import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  VIEWMODEL_SCENARIOS,
  simulate,
  summaryOf,
  viewModelScenarioById,
} from '../src/viewmodel.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

/* ---------------------------------------------------------- rotation bug */

test('rotation-bug: plain Activity field is lost on rotation', () => {
  const { activity } = summaryOf(viewModelScenarioById('rotation-bug').ops);
  assert.deepEqual(activity, {});
});

test('rotation-bug: a destroy step reports lost {count:2}', () => {
  const { steps } = run(simulate(viewModelScenarioById('rotation-bug').ops));
  const destroy = steps.find((s) => s.type === 'destroy');
  assert.ok(destroy, 'a destroy step must be emitted');
  assert.deepEqual(destroy.lost, { count: 2 });
});

/* ------------------------------------------------------------ ViewModel */

test('viewmodel-fix: ViewModel survives rotation but dies on process death', () => {
  const { steps, value } = run(simulate(viewModelScenarioById('viewmodel-fix').ops));
  // Process death cleared the ViewModel too.
  assert.deepEqual(value.viewmodel, {});
  // Rotation emitted a survive step keeping count = 2.
  const survive = steps.find((s) => s.type === 'survive' && s.holder === 'viewmodel');
  assert.ok(survive, 'a survive step must be emitted on rotation');
  assert.deepEqual(survive.values, { count: 2 });
  // The later process-death destroy wiped the ViewModel field.
  const pdIndex = steps.findIndex((s) => s.type === 'processDeath');
  const pdDestroy = steps.slice(pdIndex).find((s) => s.type === 'destroy');
  assert.ok('count' in pdDestroy.lost, 'process-death destroy loses the ViewModel count');
});

test('viewmodel-fix: ViewModel keeps its value across rotation alone', () => {
  const ops = [
    { set: ['viewmodel', 'count'], value: 2 },
    { rotate: true },
  ];
  const { viewmodel } = summaryOf(ops);
  assert.deepEqual(viewmodel, { count: 2 });
});

/* ----------------------------------------------------------- SavedState */

test('savedstate: Bundle survives both rotation and process death', () => {
  const { bundle } = summaryOf(viewModelScenarioById('savedstate').ops);
  assert.deepEqual(bundle, { count: 2 });
});

test('savedstate: two restore steps, one per event', () => {
  const { steps } = run(simulate(viewModelScenarioById('savedstate').ops));
  const restores = steps.filter((s) => s.type === 'restore' && s.holder === 'bundle');
  assert.equal(restores.length, 2);
  for (const r of restores) assert.deepEqual(r.values, { count: 2 });
});

/* -------------------------------------------------------------- generic */

test('set steps carry holder, name and value', () => {
  const { steps } = run(simulate([{ set: ['activity', 'count'], value: 7 }]));
  assert.deepEqual(steps, [{ type: 'set', holder: 'activity', name: 'count', value: 7 }]);
});

test('every scenario has Kotlin code and ops', () => {
  for (const s of VIEWMODEL_SCENARIOS) {
    assert.ok(s.code.length > 0, `${s.id} has code`);
    assert.ok(s.ops.length > 0, `${s.id} has ops`);
    assert.equal(viewModelScenarioById(s.id), s, `${s.id} is resolvable by id`);
  }
});
