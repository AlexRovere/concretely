import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseYaml } from '../src/pipeline/yaml.js';

const val = (src) => {
  const r = parseYaml(src);
  assert.ok(!r.error, `unexpected error: ${r.error?.message}`);
  return r.value;
};

test('flat map with scalar values', () => {
  assert.deepEqual(val('a: 1\nb: hello\nc: true\nd: null'), { a: 1, b: 'hello', c: true, d: null });
});

test('nested maps by indentation', () => {
  assert.deepEqual(val('job:\n  stage: build\n  script:\n    - make\n    - test'), {
    job: { stage: 'build', script: ['make', 'test'] },
  });
});

test('block list of maps', () => {
  assert.deepEqual(val('steps:\n  - run: a\n  - run: b'), { steps: [{ run: 'a' }, { run: 'b' }] });
});

test('inline flow map and list', () => {
  assert.deepEqual(val('a: { x: 1, y: 2 }\nb: [1, 2, 3]'), { a: { x: 1, y: 2 }, b: [1, 2, 3] });
});

test('quoted strings keep spaces and colons', () => {
  assert.deepEqual(val('msg: "a: b, c"\nq: \'x y\''), { msg: 'a: b, c', q: 'x y' });
});

test('comments and blank lines are ignored', () => {
  assert.deepEqual(val('# header\na: 1\n\n  # indented comment\nb: 2'), { a: 1, b: 2 });
});

test('empty input yields an empty object', () => {
  assert.deepEqual(val(''), {});
  assert.deepEqual(val('   \n\n'), {});
});

test('malformed inline flow reports an error with a line', () => {
  const r = parseYaml('a: { x: 1');
  assert.ok(r.error, 'should error on unclosed flow');
  assert.equal(typeof r.error.line, 'number');
});

test('tab indentation is rejected with a clear error', () => {
  const r = parseYaml('a:\n\tb: 1');
  assert.ok(r.error);
  assert.match(r.error.message.toLowerCase(), /tab/);
});
