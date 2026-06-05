/**
 * Shared evaluation-trace engine for the per-language "basics & quirks" tabs
 * (JS, Swift, Kotlin — Ruby has its own richer model in rubybasics.js).
 * A scenario is a list of declarative ops replayed line by line:
 *
 *   { eval: 'code', value: 'shown result', note? }      a normal evaluation
 *   { error: 'code', message }                           ❌ does not compile
 *   { crash: 'code', message }                           💥 runtime crash
 *   { branch: 'cond', taken: boolean, then?, else? }     an if + which side ran
 *   { log: 'text' }                                      plain output line
 *
 * Step shapes (1:1 with the ops, validated):
 *   { type:'eval', code, value, note? }
 *   { type:'error', code, message }
 *   { type:'crash', code, message }
 *   { type:'branch', cond, taken } then { type:'log', value } for the side run
 *   { type:'log', value }
 * The generator returns { logs, errors, crashes }.
 */

export function* simulateTrace(ops) {
  const logs = [];
  const errors = [];
  const crashes = [];

  for (const op of ops) {
    if ('eval' in op) {
      const step = { type: 'eval', code: op.eval, value: op.value };
      if (op.note) step.note = op.note;
      yield step;
    } else if ('error' in op) {
      errors.push(op.error);
      yield { type: 'error', code: op.error, message: op.message };
    } else if ('crash' in op) {
      crashes.push(op.crash);
      yield { type: 'crash', code: op.crash, message: op.message };
    } else if ('branch' in op) {
      yield { type: 'branch', cond: op.branch, taken: op.taken };
      const side = op.taken ? op.then : op.else;
      if (side !== undefined) { logs.push(side); yield { type: 'log', value: side }; }
    } else if ('log' in op) {
      logs.push(op.log);
      yield { type: 'log', value: op.log };
    }
  }

  return { logs, errors, crashes };
}

/** Run an op list to completion and return { logs, errors, crashes }. */
export function traceSummaryOf(ops) {
  const gen = simulateTrace(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}
