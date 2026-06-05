/**
 * A model of Ruby blocks, procs and lambdas — `yield`, and THE classic trap:
 * `return` inside a lambda returns to the caller (the method continues),
 * while `return` inside a proc returns from the ENCLOSING METHOD (the rest
 * of the method never runs).
 *
 * A program:
 *   { method: 'demo',                    method name (stack frame label)
 *     body: [ ...actions ],              run in the method frame
 *     block: { kind: 'block'|'proc'|'lambda', label, body: [ ...actions ] } }
 * Actions:
 *   { log: '...' }                       puts
 *   { callBlock: true, args?: [..] }     yield / blk.call
 *   { return: value }                    only meaningful inside block bodies
 *
 * Step shapes (for the visualizer):
 *   { type:'push', frame }               frame label, e.g. 'demo' or 'lambda'
 *   { type:'pop',  frame }
 *   { type:'log',  value }               console output
 *   { type:'callBlock', kind, args? }    yield / blk.call
 *   { type:'blockReturn', kind, value }  the `return` executes, THEN:
 *     - kind 'lambda': pop the block frame only, the method body CONTINUES
 *     - kind 'proc':  { type:'unwind' } then pop BOTH frames (block then
 *       method); the remaining method-body actions are SKIPPED
 * The generator returns { output: [...logs], methodCompleted: boolean }.
 * methodCompleted = true iff the method body ran to its end.
 */

export function* simulate(program) {
  const output = [];
  const { method, body, block } = program;
  let methodCompleted = false;

  // Runs the block body. Returns true if a proc `return` unwound the method.
  function* runBlock(args) {
    const step = { type: 'callBlock', kind: block.kind };
    if (args) step.args = args;
    yield step;
    yield { type: 'push', frame: block.label };
    for (const a of block.body) {
      if ('log' in a) {
        output.push(a.log);
        yield { type: 'log', value: a.log };
      } else if ('return' in a) {
        yield { type: 'blockReturn', kind: block.kind, value: a.return };
        if (block.kind === 'proc') {
          // Non-local return: unwinds the enclosing method itself.
          yield { type: 'unwind' };
          yield { type: 'pop', frame: block.label };
          yield { type: 'pop', frame: method };
          return true;
        }
        // lambda (and block): return hands control back to the caller.
        yield { type: 'pop', frame: block.label };
        return false;
      }
    }
    yield { type: 'pop', frame: block.label };
    return false;
  }

  yield { type: 'push', frame: method };
  for (const a of body) {
    if ('log' in a) {
      output.push(a.log);
      yield { type: 'log', value: a.log };
    } else if ('callBlock' in a) {
      const unwound = yield* runBlock(a.args);
      if (unwound) return { output, methodCompleted };
    }
  }
  methodCompleted = true;
  yield { type: 'pop', frame: method };
  return { output, methodCompleted };
}

export const RUBYBLOCKS_SCENARIOS = [
  {
    id: 'yield',
    code: `def somme
  puts "avant le bloc"
  resultat = yield(1, 2)     # appelle le bloc avec 1 et 2
  puts "après le bloc"
end

somme { |a, b| puts "1 + 2 = 3" }   # le bloc`,
    program: {
      method: 'somme',
      body: [
        { log: 'avant le bloc' },
        { callBlock: true, args: [1, 2] },
        { log: 'après le bloc' },
      ],
      block: { kind: 'block', label: '{ |a, b| … }', body: [{ log: '1 + 2 = 3' }] },
    },
    expected: ['avant le bloc', '1 + 2 = 3', 'après le bloc'],
  },
  {
    id: 'lambda-return',
    code: `def demo_lambda
  fn = lambda { puts "dans la lambda"; return 42 }
  fn.call                    # return → rend la main ICI
  puts "après le call ✓"     # exécuté
end`,
    program: {
      method: 'demo_lambda',
      body: [{ callBlock: true }, { log: 'après le call ✓' }],
      block: {
        kind: 'lambda',
        label: 'lambda',
        body: [{ log: 'dans la lambda' }, { return: 42 }],
      },
    },
    expected: ['dans la lambda', 'après le call ✓'],
  },
  {
    id: 'proc-return',
    code: `def demo_proc
  fn = Proc.new { puts "dans le proc"; return 42 }
  fn.call                    # return → sort de demo_proc 💥
  puts "après le call"       # JAMAIS exécuté
end`,
    program: {
      method: 'demo_proc',
      body: [{ callBlock: true }, { log: 'après le call' }],
      block: {
        kind: 'proc',
        label: 'Proc.new',
        body: [{ log: 'dans le proc' }, { return: 42 }],
      },
    },
    expected: ['dans le proc'],
  },
];

export const rubyBlocksScenarioById = (id) =>
  RUBYBLOCKS_SCENARIOS.find((s) => s.id === id);

/** Run a program to completion and return { output, methodCompleted }. */
export function summaryOf(program) {
  const gen = simulate(program);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}
