import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gitlabModel, githubModel } from '../src/pipeline/model.js';

test('gitlabModel: stages, jobs, stage assignment, needs', () => {
  const obj = {
    stages: ['build', 'test'],
    compile: { stage: 'build', script: ['make'] },
    unit: { stage: 'test', needs: ['compile'] },
  };
  const m = gitlabModel(obj);
  assert.equal(m.format, 'gitlab');
  assert.deepEqual(m.stages, ['build', 'test']);
  assert.deepEqual(m.jobs.map((j) => j.id).sort(), ['compile', 'unit']);
  assert.equal(m.jobs.find((j) => j.id === 'unit').stage, 'test');
  assert.deepEqual(m.jobs.find((j) => j.id === 'unit').needs, ['compile']);
  assert.equal(m.errors.length, 0);
});

test('gitlabModel: hidden jobs (.name) and reserved keys are ignored', () => {
  const m = gitlabModel({ stages: ['test'], '.base': { script: ['x'] }, variables: { A: 1 }, unit: { stage: 'test' } });
  assert.deepEqual(m.jobs.map((j) => j.id), ['unit']);
});

test('gitlabModel: default stage is "test" when omitted', () => {
  const m = gitlabModel({ job: { script: ['x'] } });
  assert.equal(m.jobs[0].stage, 'test');
  assert.ok(m.stages.includes('test'));
});

test('githubModel: jobs under jobs:, needs as string or list', () => {
  const obj = {
    name: 'ci',
    jobs: {
      build: { 'runs-on': 'ubuntu-latest' },
      test: { needs: 'build' },
      deploy: { needs: ['test'] },
    },
  };
  const m = githubModel(obj);
  assert.equal(m.format, 'github');
  assert.deepEqual(m.jobs.map((j) => j.id).sort(), ['build', 'deploy', 'test']);
  assert.deepEqual(m.jobs.find((j) => j.id === 'test').needs, ['build']);
  assert.deepEqual(m.jobs.find((j) => j.id === 'deploy').needs, ['test']);
});

test('needs to a missing job is reported as an error', () => {
  const m = githubModel({ jobs: { a: { needs: ['ghost'] } } });
  assert.ok(m.errors.some((e) => /ghost/.test(e)));
});

test('a dependency cycle is detected', () => {
  const m = githubModel({ jobs: { a: { needs: ['b'] }, b: { needs: ['a'] } } });
  assert.ok(m.errors.some((e) => /cycle/i.test(e)));
});

test('empty / non-object input yields no jobs, no crash', () => {
  assert.deepEqual(gitlabModel(null).jobs, []);
  assert.deepEqual(githubModel({}).jobs, []);
  assert.deepEqual(githubModel({ jobs: null }).jobs, []);
});
