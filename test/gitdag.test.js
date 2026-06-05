import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GITDAG_SCENARIOS, gitDagScenarioById, simulate, summaryOf } from '../src/gitdag.js';

function steps(ops) {
  const out = [];
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) { out.push(res.value); res = gen.next(); }
  return out;
}

test('branches: a branch is just a pointer, divergence shares the fork commit', () => {
  const { commits, branches, head } = summaryOf(gitDagScenarioById('branches').ops);
  assert.equal(head, 'main');
  assert.equal(branches.feature, 'C3');
  assert.equal(branches.main, 'C4');
  assert.deepEqual(commits.C3.parents, ['C2'], 'feature forked at C2');
  assert.deepEqual(commits.C4.parents, ['C2'], 'main continued from C2');
});

test('merge of diverged branches creates a merge commit with two parents', () => {
  const { commits, branches } = summaryOf(gitDagScenarioById('merge').ops);
  const m = commits[branches.main];
  assert.equal(m.parents.length, 2);
  assert.deepEqual(m.parents, ['C4', 'C3'], 'ours then theirs');
});

test('fast-forward moves the pointer without creating any commit', () => {
  const sc = gitDagScenarioById('fast-forward');
  const all = steps(sc.ops);
  const { commits, branches } = summaryOf(sc.ops);
  assert.equal(branches.main, 'C3', 'main slid onto feature tip');
  const ff = all.find((s) => s.type === 'merge');
  assert.equal(ff.kind, 'ff');
  assert.equal(Object.keys(commits).length, 3, 'C1..C3 only — no merge commit');
});

test('rebase replays commits with NEW ids and orphans the old ones', () => {
  const { commits, branches, orphaned } = summaryOf(gitDagScenarioById('rebase').ops);
  assert.ok(commits["C3'"], 'replayed commit exists');
  assert.deepEqual(commits["C3'"].parents, ['C4'], 'replayed on top of main tip');
  assert.equal(commits["C3'"].replayOf ?? "C3", "C3");
  assert.deepEqual(orphaned, ['C3']);
  assert.equal(branches.feature, "C3'");
});

test('after a rebase, merging is a fast-forward (linear history)', () => {
  const all = steps(gitDagScenarioById('rebase').ops);
  const merges = all.filter((s) => s.type === 'merge');
  assert.equal(merges.length, 1);
  assert.equal(merges[0].kind, 'ff');
  const { branches } = summaryOf(gitDagScenarioById('rebase').ops);
  assert.equal(branches.main, "C3'");
});

test('rebase emits replay commits flagged with replayOf', () => {
  const all = steps(gitDagScenarioById('rebase').ops);
  const replayed = all.filter((s) => s.type === 'commit' && s.replayOf);
  assert.equal(replayed.length, 1);
  assert.equal(replayed[0].replayOf, 'C3');
  assert.ok(all.some((s) => s.type === 'orphan' && s.ids.includes('C3')));
});

test('every scenario has shell code and terminates', () => {
  for (const s of GITDAG_SCENARIOS) {
    assert.ok(s.code.includes('git '), s.id);
    assert.ok(steps(s.ops).length >= s.ops.length, s.id);
  }
});
