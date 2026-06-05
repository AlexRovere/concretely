/**
 * Swift value semantics and copy-on-write: structs are copied on assignment,
 * classes share one heap instance, and arrays pretend to copy but actually
 * share their buffer until the first mutation (CoW) — which is why `var b = a`
 * is cheap and `b.append(4)` is when the real copy happens.
 *
 * A scenario is a list of ops over named variables, a heap and a buffer pool:
 *   { declStruct: name, values: {...} }   struct declaration (inline values)
 *   { declClass: name, values: {...} }    class instance (new heap object)
 *   { declArray: name, values: [...] }    array (new buffer)
 *   { copy: dst, from: src }              dst = src (copy / share-ref / share-buf)
 *   { set: [name, field], value }         name.field = value (struct or class)
 *   { append: name, value }               array append (CoW copy if shared)
 *
 * Step shapes feed the visualizer:
 *   { type:'declStruct', name, values }
 *   { type:'declClass',  name, objId, values }
 *   { type:'declArray',  name, bufId, values }
 *   { type:'copyStruct', dst, src, values }     independent copy
 *   { type:'copyRef',    dst, src, objId }      shared instance
 *   { type:'shareBuf',   dst, src, bufId }      NO data copy yet
 *   { type:'mutateStruct', name, field, value } only this var changes
 *   { type:'mutateClass',  objId, field, value }visible through every ref
 *   { type:'cowCopy',    name, from, to, values }  the deferred copy
 *   { type:'append',     name, bufId, values }
 * The generator returns the final { vars, heap, buffers }.
 */

export function* simulate(ops) {
  const vars = new Map();    // name -> { kind:'struct', values } | { kind:'ref', objId } | { kind:'array', bufId }
  const heap = new Map();    // objId -> { ...fields }
  const buffers = new Map(); // bufId -> [...values]
  let nextObjId = 1;
  let nextBufId = 1;

  const sharers = (bufId) =>
    [...vars.values()].filter((v) => v.kind === 'array' && v.bufId === bufId).length;

  for (const op of ops) {
    if ('declStruct' in op) {
      vars.set(op.declStruct, { kind: 'struct', values: { ...op.values } });
      yield { type: 'declStruct', name: op.declStruct, values: { ...op.values } };
    } else if ('declClass' in op) {
      const objId = nextObjId++;
      heap.set(objId, { ...op.values });
      vars.set(op.declClass, { kind: 'ref', objId });
      yield { type: 'declClass', name: op.declClass, objId, values: { ...op.values } };
    } else if ('declArray' in op) {
      const bufId = nextBufId++;
      buffers.set(bufId, [...op.values]);
      vars.set(op.declArray, { kind: 'array', bufId });
      yield { type: 'declArray', name: op.declArray, bufId, values: [...op.values] };
    } else if ('copy' in op) {
      const { copy: dst, from: src } = op;
      const s = vars.get(src);
      if (s.kind === 'struct') {
        vars.set(dst, { kind: 'struct', values: { ...s.values } });
        yield { type: 'copyStruct', dst, src, values: { ...s.values } };
      } else if (s.kind === 'ref') {
        vars.set(dst, { kind: 'ref', objId: s.objId });
        yield { type: 'copyRef', dst, src, objId: s.objId };
      } else {
        vars.set(dst, { kind: 'array', bufId: s.bufId });
        yield { type: 'shareBuf', dst, src, bufId: s.bufId };
      }
    } else if ('set' in op) {
      const [name, field] = op.set;
      const v = vars.get(name);
      if (v.kind === 'struct') {
        v.values[field] = op.value;
        yield { type: 'mutateStruct', name, field, value: op.value };
      } else {
        heap.get(v.objId)[field] = op.value;
        yield { type: 'mutateClass', objId: v.objId, field, value: op.value };
      }
    } else if ('append' in op) {
      const name = op.append;
      const v = vars.get(name);
      if (sharers(v.bufId) > 1) {
        const from = v.bufId;
        const to = nextBufId++;
        buffers.set(to, [...buffers.get(from)]);
        v.bufId = to;
        yield { type: 'cowCopy', name, from, to, values: [...buffers.get(to)] };
      }
      buffers.get(v.bufId).push(op.value);
      yield { type: 'append', name, bufId: v.bufId, values: [...buffers.get(v.bufId)] };
    }
  }

  return snapshot(vars, heap, buffers);
}

function snapshot(vars, heap, buffers) {
  return {
    vars: Object.fromEntries(
      [...vars].map(([k, v]) =>
        [k, v.kind === 'struct' ? { kind: 'struct', values: { ...v.values } } : { ...v }])),
    heap: Object.fromEntries([...heap].map(([k, v]) => [k, { ...v }])),
    buffers: Object.fromEntries([...buffers].map(([k, v]) => [k, [...v]])),
  };
}

/** Run to completion and return the final snapshot. */
export function finalStateOf(ops) {
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const COW_SCENARIOS = [
  {
    id: 'struct-vs-class',
    code: `struct PointS { var x: Int }
final class PointC { var x: Int; init(x: Int) { self.x = x } }

var s1 = PointS(x: 1)
var s2 = s1        // COPIE indépendante (valeur)
s2.x = 99          // s1.x vaut toujours 1 ✓

let c1 = PointC(x: 1)
let c2 = c1        // même instance partagée (référence)
c2.x = 99          // c1.x vaut 99 aussi ⚠️`,
    ops: [
      { declStruct: 's1', values: { x: 1 } },
      { copy: 's2', from: 's1' },
      { set: ['s2', 'x'], value: 99 },
      { declClass: 'c1', values: { x: 1 } },
      { copy: 'c2', from: 'c1' },
      { set: ['c2', 'x'], value: 99 },
    ],
  },
  {
    id: 'cow-array',
    code: `var a = [1, 2, 3]
var b = a          // PAS de copie : buffer partagé (copy-on-write)
b.append(4)        // première écriture → LÀ le buffer est copié
// a = [1, 2, 3]  (buffer d'origine)
// b = [1, 2, 3, 4] (nouveau buffer)`,
    ops: [
      { declArray: 'a', values: [1, 2, 3] },
      { copy: 'b', from: 'a' },
      { append: 'b', value: 4 },
    ],
  },
];

export const cowScenarioById = (id) => COW_SCENARIOS.find((s) => s.id === id);
