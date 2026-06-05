import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ancestorsOf,
  simulate,
  summaryOf,
  RUBYLOOKUP_SCENARIOS,
  rubyLookupScenarioById,
} from '../src/rubylookup.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, result: res.value };
}

const prependInclude = rubyLookupScenarioById('prepend-include');
const methodMissing = rubyLookupScenarioById('method-missing');

test('ancestorsOf: prepend before the class, include after, then superclasses', () => {
  assert.deepEqual(ancestorsOf(prependInclude.world, 'Greeter'), [
    'Loud', 'Greeter', 'Polite', 'Object', 'Kernel', 'BasicObject',
  ]);
});

test('prepend-include: bodies run Loud → Greeter → Polite', () => {
  const { callOrder, output } = summaryOf(
    prependInclude.world, prependInclude.className, prependInclude.call,
  );
  assert.deepEqual(callOrder, ['Loud', 'Greeter', 'Polite']);
  assert.deepEqual(output, [
    '📢 (Loud, prepend)',
    'Bonjour ! (Greeter)',
    '…et bonne journée (Polite, include)',
  ]);
});

test('prepend-include: the FIRST check is at Loud (prepend beats the class)', () => {
  const { steps } = run(simulate(prependInclude.world, 'Greeter', 'hello'));
  const firstCheck = steps.find((s) => s.type === 'check');
  assert.deepEqual(firstCheck, { type: 'check', at: 'Loud', found: true });
});

test('checks stop at first found each pass: every found follows its own check, no extra checks before super resumes', () => {
  const { steps } = run(simulate(prependInclude.world, 'Greeter', 'hello'));
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].type === 'found') {
      const prev = steps[i - 1];
      assert.deepEqual(prev, { type: 'check', at: steps[i].at, found: true });
      // a found is followed by its invoke before any further check
      assert.equal(steps[i + 1].type, 'invoke');
      assert.equal(steps[i + 1].at, steps[i].at);
    }
  }
  // hello is defined on every ancestor hit, so each check is a hit: 3 checks total
  const checks = steps.filter((s) => s.type === 'check');
  assert.deepEqual(checks.map((c) => c.at), ['Loud', 'Greeter', 'Polite']);
  assert.ok(checks.every((c) => c.found));
});

test('super resumes from the NEXT ancestor: after Greeter the next check is Polite', () => {
  const { steps } = run(simulate(prependInclude.world, 'Greeter', 'hello'));
  const greeterInvoke = steps.findIndex((s) => s.type === 'invoke' && s.at === 'Greeter');
  assert.ok(greeterInvoke > -1);
  const after = steps.slice(greeterInvoke + 1);
  const nextCheck = after.find((s) => s.type === 'check');
  assert.equal(nextCheck.at, 'Polite');
  // never re-checks Loud or Greeter
  assert.ok(!after.some((s) => s.type === 'check' && (s.at === 'Loud' || s.at === 'Greeter')));
});

test('method-missing: fly misses on every ancestor, then a second pass finds method_missing', () => {
  const { steps, result } = run(simulate(methodMissing.world, 'Greeter', 'fly'));
  const chain = ancestorsOf(methodMissing.world, 'Greeter');
  const mmIndex = steps.findIndex((s) => s.type === 'methodMissing');
  assert.ok(mmIndex > -1);
  assert.equal(steps[mmIndex].method, 'fly');
  // first pass: every ancestor checked, all misses
  const firstPass = steps.slice(0, mmIndex).filter((s) => s.type === 'check');
  assert.deepEqual(firstPass.map((c) => c.at), chain);
  assert.ok(firstPass.every((c) => c.found === false));
  // second pass finds method_missing on Greeter and interpolates the name
  assert.deepEqual(result.callOrder, ['Greeter']);
  assert.deepEqual(result.output, ['👻 méthode fantôme : fly']);
});

test('scenarios are well-formed and simulate terminates', () => {
  assert.equal(RUBYLOOKUP_SCENARIOS.length, 2);
  for (const s of RUBYLOOKUP_SCENARIOS) {
    assert.equal(typeof s.code, 'string');
    assert.ok(s.code.length > 0, `${s.id} has code`);
    assert.ok(s.world && s.world.classes, `${s.id} has a world`);
    assert.equal(typeof s.className, 'string');
    assert.equal(typeof s.call, 'string');
    const { steps, result } = run(simulate(s.world, s.className, s.call));
    assert.ok(steps.length > 0 && steps.length < 1000, `${s.id} terminates`);
    assert.equal(steps[0].type, 'lookup');
    assert.ok(Array.isArray(result.callOrder));
    assert.ok(Array.isArray(result.output));
  }
  assert.equal(rubyLookupScenarioById('nope'), undefined);
});
