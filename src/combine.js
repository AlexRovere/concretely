/**
 * A model of a Combine-style reactive pipeline (Swift). Values flow one at a
 * time from a publisher through operators (map/filter) to a sink — which is the
 * mental model behind Combine and async streams generally.
 *
 * Operators are data (so the Swift code shown matches the simulation):
 *   { op:'map',    expr:'$0 * 2',     fn:(x)=>x*2 }
 *   { op:'filter', expr:'$0 % 2 == 0', fn:(x)=>x%2===0 }
 *
 * Step shapes:
 *   { type:'emit',   value }
 *   { type:'map',    stage, from, to }
 *   { type:'filter', stage, value, pass }
 *   { type:'drop',   stage, value }
 *   { type:'sink',   value }
 * The generator returns the array of values received by the sink.
 */

export function* simulate(source, operators) {
  const received = [];
  for (const v0 of source) {
    let v = v0;
    yield { type: 'emit', value: v };
    let dropped = false;
    for (let i = 0; i < operators.length; i++) {
      const op = operators[i];
      if (op.op === 'map') {
        const to = op.fn(v);
        yield { type: 'map', stage: i, from: v, to };
        v = to;
      } else if (op.op === 'filter') {
        const pass = !!op.fn(v);
        yield { type: 'filter', stage: i, value: v, pass };
        if (!pass) { yield { type: 'drop', stage: i, value: v }; dropped = true; break; }
      }
    }
    if (!dropped) { received.push(v); yield { type: 'sink', value: v }; }
  }
  return received;
}

export function receivedOf(source, operators) {
  const gen = simulate(source, operators);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const COMBINE_SCENARIOS = [
  {
    id: 'map-filter',
    source: [1, 2, 3, 4, 5],
    operators: [
      { op: 'map', expr: '$0 * 2', fn: (x) => x * 2 },
      { op: 'filter', expr: '$0 > 5', fn: (x) => x > 5 },
    ],
    code: `[1, 2, 3, 4, 5].publisher
    .map { $0 * 2 }
    .filter { $0 > 5 }
    .sink { print($0) }`,
    expected: [6, 8, 10],
  },
  {
    id: 'filter-map',
    source: [1, 2, 3, 4, 5, 6],
    operators: [
      { op: 'filter', expr: '$0 % 2 == 0', fn: (x) => x % 2 === 0 },
      { op: 'map', expr: '$0 * $0', fn: (x) => x * x },
    ],
    code: `[1, 2, 3, 4, 5, 6].publisher
    .filter { $0 % 2 == 0 }
    .map { $0 * $0 }
    .sink { print($0) }`,
    expected: [4, 16, 36],
  },
];

export const combineScenarioById = (id) => COMBINE_SCENARIOS.find((s) => s.id === id);

/** Visual stages: publisher → operators… → sink. */
export function stagesOf(operators) {
  return [
    { kind: 'source', label: 'publisher' },
    ...operators.map((o) => ({ kind: o.op, label: `${o.op} { ${o.expr} }` })),
    { kind: 'sink', label: 'sink' },
  ];
}
