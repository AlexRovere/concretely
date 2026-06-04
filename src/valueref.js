/**
 * Value vs reference: the model that explains the classic "why did my other
 * variable change?" bug. Primitives are copied by value; objects are shared by
 * reference, so mutating through one binding is visible through every binding.
 *
 * A scenario is a list of ops over named variables and a small heap:
 *   { decl: name, value }                primitive declaration
 *   { declObj: name, obj: {...} }        object declaration (new heap cell)
 *   { copy: [dst, src] }                 dst = src  (copies value OR ref)
 *   { setVar: [name, value] }            name = value (primitive reassign)
 *   { mutate: [name, field, value] }     name.field = value (needs a ref)
 *
 * Step shapes feed the visualizer; simulate() returns the final { vars, heap }.
 */

export function* simulate(ops) {
  const vars = new Map();  // name -> { kind:'value', value } | { kind:'ref', objId }
  const heap = new Map();  // objId -> { ...fields }
  let nextId = 1;

  for (const op of ops) {
    if ('decl' in op) {
      vars.set(op.decl, { kind: 'value', value: op.value });
      yield { type: 'declVal', name: op.decl, value: op.value };
    } else if ('declObj' in op) {
      const objId = nextId++;
      heap.set(objId, { ...op.obj });
      vars.set(op.declObj, { kind: 'ref', objId });
      yield { type: 'declObj', name: op.declObj, objId, obj: { ...op.obj } };
    } else if ('copy' in op) {
      const [dst, src] = op.copy;
      const s = vars.get(src);
      if (s.kind === 'value') {
        vars.set(dst, { kind: 'value', value: s.value });
        yield { type: 'copyVal', dst, src, value: s.value };
      } else {
        vars.set(dst, { kind: 'ref', objId: s.objId });
        yield { type: 'copyRef', dst, src, objId: s.objId };
      }
    } else if ('setVar' in op) {
      const [name, value] = op.setVar;
      vars.set(name, { kind: 'value', value });
      yield { type: 'setVal', name, value };
    } else if ('mutate' in op) {
      const [name, field, value] = op.mutate;
      const v = vars.get(name);
      heap.get(v.objId)[field] = value;
      yield { type: 'mutate', objId: v.objId, field, value };
    }
  }

  return snapshot(vars, heap);
}

function snapshot(vars, heap) {
  return {
    vars: Object.fromEntries([...vars].map(([k, v]) => [k, { ...v }])),
    heap: Object.fromEntries([...heap].map(([k, v]) => [k, { ...v }])),
  };
}

/** Run to completion and return the final snapshot. */
export function finalState(ops) {
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const VALUEREF_SCENARIOS = [
  {
    id: 'primitives',
    code: `let a = 1;
let b = a;   // copy of the VALUE
b = 2;
// a is still 1`,
    ops: [{ decl: 'a', value: 1 }, { copy: ['b', 'a'] }, { setVar: ['b', 2] }],
  },
  {
    id: 'objects',
    code: `let o = { n: 1 };
let p = o;   // copy of the REFERENCE
p.n = 2;
// o.n is now 2 too — same object!`,
    ops: [{ declObj: 'o', obj: { n: 1 } }, { copy: ['p', 'o'] }, { mutate: ['p', 'n', 2] }],
  },
  {
    id: 'argument',
    code: `function bump(obj) { obj.n += 10; }
let x = { n: 5 };
bump(x);     // passes the reference
// x.n is now 15`,
    ops: [{ declObj: 'x', obj: { n: 5 } }, { copy: ['obj', 'x'] }, { mutate: ['obj', 'n', 15] }],
  },
];

export const vrScenarioById = (id) => VALUEREF_SCENARIOS.find((s) => s.id === id);
