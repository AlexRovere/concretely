/**
 * A model of Ruby Enumerable chains, eager vs lazy. An eager chain like
 * `map.select.first(2)` builds a FULL intermediate array per stage before the
 * next stage even starts; `.lazy` flows one element at a time through the
 * chain and stops as soon as `first(n)` is satisfied — which also makes
 * infinite ranges usable (eager on an infinite range never finishes).
 *
 * Operators are data (so the Ruby code shown matches the simulation):
 *   { op:'map',    expr:'x * x',    fn:(x)=>x*x }
 *   { op:'select', expr:'x.even?',  fn:(x)=>x%2===0 }
 *
 * Scenario shape:
 *   { id, code, source: [..] | { infinite:true, start }, ops, take, lazy }
 *
 * Step shapes — eager mode:
 *   { type:'hang' }                              (infinite source: we bail out)
 *   { type:'stage-start', stage, input:[...] }
 *   { type:'apply', stage, value, result }       (map)
 *   { type:'apply', stage, value, pass }         (select)
 *   { type:'stage-end',   stage, output:[...] }  (a FULL intermediate array)
 *   { type:'take', values:[...] }                (first n of the final array)
 * Step shapes — lazy mode:
 *   { type:'emit', value }
 *   { type:'apply', stage, value, result|pass }
 *   { type:'drop', stage, value }                (failed select: element stops)
 *   { type:'sink', value }                       (element survived all stages)
 *   { type:'stop', after }                       (n sunk: after = emitted count)
 * The generator returns { result, applied, intermediates, hung }.
 */

function* sourceValues(source) {
  if (Array.isArray(source)) { yield* source; return; }
  for (let v = source.start; ; v++) yield v;
}

const isInfinite = (source) => !Array.isArray(source) && !!source.infinite;

export function* simulate(scenario) {
  const { source, ops, take, lazy } = scenario;
  let applied = 0;

  if (!lazy) {
    if (isInfinite(source)) {
      yield { type: 'hang' };
      return { result: null, applied: 0, intermediates: 0, hung: true };
    }
    let current = [...source];
    let intermediates = 0;
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      yield { type: 'stage-start', stage: i, input: [...current] };
      const output = [];
      for (const value of current) {
        if (op.op === 'map') {
          const result = op.fn(value);
          applied++;
          yield { type: 'apply', stage: i, value, result };
          output.push(result);
        } else {
          const pass = !!op.fn(value);
          applied++;
          yield { type: 'apply', stage: i, value, pass };
          if (pass) output.push(value);
        }
      }
      intermediates++;
      yield { type: 'stage-end', stage: i, output: [...output] };
      current = output;
    }
    const result = current.slice(0, take);
    yield { type: 'take', values: [...result] };
    return { result, applied, intermediates, hung: false };
  }

  // Lazy: one element at a time, stop as soon as `take` values are sunk.
  const result = [];
  let emitted = 0;
  for (const v0 of sourceValues(source)) {
    emitted++;
    let v = v0;
    yield { type: 'emit', value: v };
    let dropped = false;
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      if (op.op === 'map') {
        const res = op.fn(v);
        applied++;
        yield { type: 'apply', stage: i, value: v, result: res };
        v = res;
      } else {
        const pass = !!op.fn(v);
        applied++;
        yield { type: 'apply', stage: i, value: v, pass };
        if (!pass) { yield { type: 'drop', stage: i, value: v }; dropped = true; break; }
      }
    }
    if (!dropped) {
      result.push(v);
      yield { type: 'sink', value: v };
      if (result.length >= take) {
        yield { type: 'stop', after: emitted };
        break;
      }
    }
  }
  return { result, applied, intermediates: 0, hung: false };
}

/** Drains the generator and returns its summary { result, applied, intermediates, hung }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

const OPS = [
  { op: 'map', expr: 'x * x', fn: (x) => x * x },
  { op: 'select', expr: 'x.even?', fn: (x) => x % 2 === 0 },
];

const ONE_TO_TEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const RUBYLAZY_SCENARIOS = [
  {
    id: 'eager',
    source: ONE_TO_TEN,
    ops: OPS,
    take: 2,
    lazy: false,
    code: `(1..10).map { |x| x * x }     # 10 appels → tableau intermédiaire COMPLET
       .select(&:even?)       # 10 appels → encore un tableau
       .first(2)              # on jette presque tout ! [4, 16]`,
  },
  {
    id: 'lazy',
    source: ONE_TO_TEN,
    ops: OPS,
    take: 2,
    lazy: true,
    code: `(1..10).lazy                  # les valeurs coulent UNE PAR UNE
       .map { |x| x * x }
       .select(&:even?)
       .first(2)              # s'arrête dès 2 résultats : 8 appels au lieu de 20`,
  },
  {
    id: 'infinite',
    source: { infinite: true, start: 1 },
    ops: OPS,
    take: 2,
    lazy: true,
    code: `(1..Float::INFINITY).lazy     # un Range INFINI…
  .map { |x| x * x }
  .select(&:even?)
  .first(2)                   # …et ça termine ! (eager boucle à jamais 💥)`,
  },
];

export const rubyLazyScenarioById = (id) => RUBYLAZY_SCENARIOS.find((s) => s.id === id);
