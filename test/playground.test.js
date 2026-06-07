import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAYGROUNDS, playgroundFor } from '../src/playground/samples.js';
import { parseGitCommands, runGitOps, renderDagSvg } from '../src/playground/gitrepl.js';

const ENGINES = new Set(['js', 'vue', 'ruby', 'kotlin', 'git', 'ts', 'go', 'rust']);
const LANGS = new Set(['js', 'ruby', 'kotlin', 'shell', 'ts', 'go', 'rust']);

test('every category except swift has a playground (engine + sample)', () => {
  for (const cat of ['general', 'js', 'ts', 'vue', 'ruby', 'kotlin', 'go', 'rust', 'git']) {
    const c = playgroundFor(cat);
    assert.ok(c, cat);
    assert.ok(ENGINES.has(c.engine), `${cat}: engine ${c.engine}`);
    assert.ok(LANGS.has(c.lang), `${cat}: lang ${c.lang}`);
    assert.ok(c.sample.length > 50, `${cat}: sample too short`);
  }
  assert.equal(playgroundFor('swift'), null, 'no browser Swift compiler — no playground');
  assert.equal(Object.keys(PLAYGROUNDS).length, 9);
});

test('git REPL: parses the shipped sample without any error', () => {
  const { ops, errors } = parseGitCommands(PLAYGROUNDS.git.sample);
  assert.deepEqual(errors, []);
  assert.ok(ops.length >= 8);
});

test('git REPL: command surface (quotes, -c/-b, comments, unknowns)', () => {
  const { ops, errors } = parseGitCommands(`
git commit -m "deux mots"
git commit -m 'simple'
git commit
git checkout -b fix     # crée + bascule
git branch autre
git switch main
git push origin main
echo nope
git merge fix
`);
  assert.deepEqual(ops[0], { commit: 'deux mots' });
  assert.deepEqual(ops[1], { commit: 'simple' });
  assert.deepEqual(ops[2], { commit: 'commit' });
  assert.deepEqual(ops.slice(3, 5), [{ branch: 'fix' }, { checkout: 'fix' }]);
  assert.deepEqual(ops[5], { branch: 'autre' });
  assert.deepEqual(ops[6], { checkout: 'main' });
  assert.deepEqual(ops[7], { merge: 'fix' });
  assert.equal(errors.length, 2); // push, echo
  assert.ok(errors.every((e) => e.line > 0 && e.text.length > 0));
});

test('git REPL: validation refuses unknown branches, duplicates and self-merge', () => {
  const { ops, errors } = parseGitCommands(`
git switch nope
git branch dup
git branch dup
git merge main
git rebase main
`);
  // switch nope → error; dup twice → 1 op + 1 error; merge/rebase main while ON main → errors
  assert.equal(ops.length, 1);
  assert.equal(errors.length, 4);
});

test('git REPL: the sample journey ends rebased + fast-forwarded (vs gitdag)', () => {
  const { ops } = parseGitCommands(PLAYGROUNDS.git.sample);
  const { commits, branches, head, events } = runGitOps(ops);
  assert.equal(branches.feature, "C3'");
  assert.equal(branches.main, "C3'", 'merge after rebase must fast-forward');
  assert.equal(head, 'main');
  assert.ok(commits.find((c) => c.id === 'C3')?.orphan, 'old C3 is orphaned');
  assert.ok(events.some((e) => e.includes('fast-forward')));
});

test('git REPL: SVG contains nodes, branch tags and the HEAD star', () => {
  const { ops } = parseGitCommands(PLAYGROUNDS.git.sample);
  const svg = renderDagSvg(runGitOps(ops));
  assert.match(svg, /^<svg class="gd-svg"/);
  assert.match(svg, /class="cid/);
  assert.match(svg, /★ main/);
  assert.match(svg, /class="node orphan"/);
});
