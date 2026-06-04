import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SNIPPETS, LANGUAGES, snippet } from '../src/snippets/index.js';
import js from '../src/snippets/js.js';

const ALGO_IDS = [
  'bubble', 'insertion', 'selection', 'quick', 'merge',
  'gnome', 'pancake', 'stooge', 'bogo',
  'bfs', 'dijkstra', 'astar',
];

test('every language provides a non-empty snippet for every algorithm', () => {
  for (const { id: lang } of LANGUAGES) {
    for (const algo of ALGO_IDS) {
      const code = snippet(algo, lang);
      assert.equal(typeof code, 'string', `${lang}/${algo} not a string`);
      assert.ok(code.trim().length > 10, `${lang}/${algo} too short`);
      assert.ok(!code.includes('`'), `${lang}/${algo} contains a backtick`);
      assert.ok(!code.includes('${'), `${lang}/${algo} contains a template expression`);
    }
  }
});

test('SNIPPETS exposes exactly the offered languages', () => {
  assert.deepEqual(Object.keys(SNIPPETS).sort(), LANGUAGES.map((l) => l.id).sort());
});

// The JavaScript snippets are real JS, so we can execute them.
function runSort(code, input) {
  const name = code.match(/function\s+(\w+Sort)\b/)[1];
  const fn = new Function(`${code}\nreturn ${name};`)();
  const copy = [...input];
  const r = fn(copy);
  return Array.isArray(r) ? r : copy;
}

test('JavaScript sort snippets actually sort ascending', () => {
  const input = [5, 2, 9, 1, 7, 3, 8, 4, 6, 0];
  const expected = [...input].sort((a, b) => a - b);
  for (const id of ['bubble', 'insertion', 'selection', 'quick', 'merge', 'gnome', 'pancake', 'stooge']) {
    assert.deepEqual(runSort(js[id], input), expected, `${id} snippet did not sort`);
  }
});

test('JavaScript bogosort snippet sorts a tiny array', () => {
  assert.deepEqual(runSort(js.bogo, [3, 1, 2]), [1, 2, 3]);
});
