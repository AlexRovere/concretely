// "Regex → automaton": a handful of tiny DFAs, each presented with a human-readable
// pattern, and an input stepped through state by state. Hand-built (no regex
// compiler) so the model is trivially correct and testable.

/** Step through a DFA on `input`: start, one `read` per char, then accept/reject. */
export function* run(dfa, input) {
  let state = dfa.start;
  yield { type: 'start', state };
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = dfa.delta[state]?.[ch];
    if (next === undefined) {
      yield { type: 'read', index: i, char: ch, from: state, to: null };
      yield { type: 'reject', index: i, reason: 'stuck' };
      return;
    }
    yield { type: 'read', index: i, char: ch, from: state, to: next };
    state = next;
  }
  yield { type: dfa.accept.includes(state) ? 'accept' : 'reject', state };
}

/** Non-animated acceptance test. */
export function accepts(dfa, input) {
  let state = dfa.start;
  for (const ch of input) {
    const next = dfa.delta[state]?.[ch];
    if (next === undefined) return false;
    state = next;
  }
  return dfa.accept.includes(state);
}

export const AUTOMATA = [
  {
    id: 'a*b',
    states: ['q0', 'q1'],
    dfa: { start: 'q0', accept: ['q1'], delta: { q0: { a: 'q0', b: 'q1' }, q1: {} } },
    inputs: ['aaab', 'b', 'aa', 'abb']
  },
  {
    id: '(ab)+',
    states: ['q0', 'q1', 'q2'],
    dfa: { start: 'q0', accept: ['q2'], delta: { q0: { a: 'q1' }, q1: { b: 'q2' }, q2: { a: 'q1' } } },
    inputs: ['ab', 'abab', 'aba', 'b']
  },
  {
    id: 'a(b|c)*d',
    states: ['q0', 'q1', 'q2'],
    dfa: { start: 'q0', accept: ['q2'], delta: { q0: { a: 'q1' }, q1: { b: 'q1', c: 'q1', d: 'q2' }, q2: {} } },
    inputs: ['ad', 'abcbcd', 'abc', 'bd']
  },
  {
    id: 'binary ÷ 3',
    states: ['s0', 's1', 's2'],
    dfa: {
      start: 's0',
      accept: ['s0'],
      delta: { s0: { 0: 's0', 1: 's1' }, s1: { 0: 's2', 1: 's0' }, s2: { 0: 's1', 1: 's2' } }
    },
    inputs: ['110', '1001', '101', '111']
  }
];

export function automatonById(id) {
  return AUTOMATA.find((a) => a.id === id) ?? AUTOMATA[0];
}
