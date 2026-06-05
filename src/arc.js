/**
 * Swift ARC (Automatic Reference Counting): every strong reference bumps an
 * object's retain count; when it drops to 0 the object is deallocated and the
 * strong references *it* held are released in cascade. Two objects pointing at
 * each other strongly keep rc > 0 forever — a retain cycle, i.e. a leak. A
 * `weak` reference doesn't retain and is zeroed automatically on dealloc.
 *
 * A scenario is a list of ops executed by simulate(ops):
 *   { alloc: 'a', cls: 'Person' }                        new object, rc = 1
 *   { copy: 'b', from: 'a' }                             second strong var → rc++
 *   { assign: ['a','prop'], to: 'b', kind: 'strong' }    a.prop = b → rc++
 *   { assign: ['a','prop'], to: 'b', kind: 'weak' }      weak: no rc change
 *   { release: 'a' }                                     a = nil → rc--
 *
 * Step shapes:
 *   { type:'alloc',      objId, cls, var }
 *   { type:'retain',     objId, rc, by }       by: 'b' or 'a.apartment'
 *   { type:'weakAssign', objId, by }
 *   { type:'release',    objId, rc, by }
 *   { type:'dealloc',    objId }               then the cascade:
 *   { type:'weakZero',   objId, by }           weak ref to objId becomes nil
 *   { type:'leak',       objIds }              alive but unreachable (if any)
 * The generator returns { objects: { [objId]: { cls, rc, alive } }, leaked }.
 */

export function* simulate(ops) {
  const vars = new Map();    // name -> objId | null
  const objects = new Map(); // objId -> { cls, rc, alive, strong: [], weak: [] }
  let nextId = 1;

  function* releaseRef(objId, by) {
    const o = objects.get(objId);
    o.rc -= 1;
    yield { type: 'release', objId, rc: o.rc, by };
    if (o.rc > 0) return;
    o.alive = false;
    yield { type: 'dealloc', objId };
    // Cascade: the strong refs this object held are released in turn…
    for (const ref of o.strong) yield* releaseRef(ref.targetId, ref.label);
    // …and weak refs in other alive objects pointing here become nil.
    for (const [otherId, other] of objects) {
      if (otherId === objId || !other.alive) continue;
      for (const ref of other.weak) {
        if (ref.targetId !== objId) continue;
        ref.targetId = null;
        yield { type: 'weakZero', objId, by: ref.label };
      }
    }
  }

  for (const op of ops) {
    if ('alloc' in op) {
      const objId = nextId++;
      objects.set(objId, { cls: op.cls, rc: 1, alive: true, strong: [], weak: [] });
      vars.set(op.alloc, objId);
      yield { type: 'alloc', objId, cls: op.cls, var: op.alloc };
    } else if ('copy' in op) {
      const objId = vars.get(op.from);
      const o = objects.get(objId);
      o.rc += 1;
      vars.set(op.copy, objId);
      yield { type: 'retain', objId, rc: o.rc, by: op.copy };
    } else if ('assign' in op) {
      const [ownerVar, prop] = op.assign;
      const owner = objects.get(vars.get(ownerVar));
      const targetId = vars.get(op.to);
      const label = `${ownerVar}.${prop}`;
      if (op.kind === 'weak') {
        owner.weak.push({ prop, targetId, label });
        yield { type: 'weakAssign', objId: targetId, by: label };
      } else {
        const target = objects.get(targetId);
        target.rc += 1;
        owner.strong.push({ prop, targetId, label });
        yield { type: 'retain', objId: targetId, rc: target.rc, by: label };
      }
    } else if ('release' in op) {
      const objId = vars.get(op.release);
      vars.set(op.release, null);
      if (objId != null) yield* releaseRef(objId, op.release);
    }
  }

  // Reachability scan from the still-set variables (strong edges only):
  // alive objects nobody can reach anymore are leaked.
  const reachable = new Set();
  const stack = [...vars.values()].filter((id) => id != null);
  while (stack.length) {
    const id = stack.pop();
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const ref of objects.get(id).strong) {
      if (ref.targetId != null) stack.push(ref.targetId);
    }
  }
  const leaked = [...objects]
    .filter(([id, o]) => o.alive && !reachable.has(id))
    .map(([id]) => id);
  if (leaked.length) yield { type: 'leak', objIds: leaked };

  return {
    objects: Object.fromEntries(
      [...objects].map(([id, o]) => [id, { cls: o.cls, rc: o.rc, alive: o.alive }]),
    ),
    leaked,
  };
}

/** Run to completion and return the final { objects, leaked } summary. */
export function summaryOf(ops) {
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const ARC_SCENARIOS = [
  {
    id: 'retain-release',
    code: `var a: Person? = Person("Ana")  // rc = 1
var b = a                       // rc = 2 (deuxième référence forte)
a = nil                         // rc = 1 — l'objet vit encore
b = nil                         // rc = 0 → deinit ✓`,
    ops: [
      { alloc: 'a', cls: 'Person' },
      { copy: 'b', from: 'a' },
      { release: 'a' },
      { release: 'b' },
    ],
    expected: { alive: [], leaked: [] },
  },
  {
    id: 'cycle-leak',
    code: `class Person    { var apartment: Apartment? }     // forte
class Apartment { var tenant: Person? }           // forte ⚠️

var p: Person? = Person()
var a: Apartment? = Apartment()
p!.apartment = a   // rc(Apartment) = 2
a!.tenant = p      // rc(Person) = 2
p = nil            // rc(Person) = 1 — retenu par l'appartement
a = nil            // rc(Apartment) = 1 — retenu par la personne
// 💥 plus rien ne pointe dessus, mais rc > 0 : fuite mémoire !`,
    ops: [
      { alloc: 'p', cls: 'Person' },
      { alloc: 'a', cls: 'Apartment' },
      { assign: ['p', 'apartment'], to: 'a', kind: 'strong' },
      { assign: ['a', 'tenant'], to: 'p', kind: 'strong' },
      { release: 'p' },
      { release: 'a' },
    ],
    expected: { alive: [1, 2], leaked: [1, 2] },
  },
  {
    id: 'weak-fix',
    code: `class Person    { var apartment: Apartment? }     // forte
class Apartment { weak var tenant: Person? }      // weak ✓

var p: Person? = Person()
var a: Apartment? = Apartment()
p!.apartment = a   // rc(Apartment) = 2
a!.tenant = p      // weak : rc(Person) reste 1
p = nil            // rc(Person) = 0 → deinit, relâche l'appartement,
                   // et a!.tenant devient nil tout seul
a = nil            // rc(Apartment) = 0 → deinit ✓ pas de fuite`,
    ops: [
      { alloc: 'p', cls: 'Person' },
      { alloc: 'a', cls: 'Apartment' },
      { assign: ['p', 'apartment'], to: 'a', kind: 'strong' },
      { assign: ['a', 'tenant'], to: 'p', kind: 'weak' },
      { release: 'p' },
      { release: 'a' },
    ],
    expected: { alive: [], leaked: [] },
  },
];

export const arcScenarioById = (id) => ARC_SCENARIOS.find((s) => s.id === id);
