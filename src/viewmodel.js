/**
 * Android state across configuration changes and process death: the model that
 * explains "why is my counter back to 0 after I rotated the screen?".
 *
 * A screen rotation is a *configuration change*: Android DESTROYS the Activity
 * and recreates it, so plain Activity fields are lost. A `ViewModel` is scoped
 * above the Activity and SURVIVES rotation — but it lives in process memory, so
 * it dies if the system kills the process. A `SavedStateHandle` /
 * `rememberSaveable` writes into a Bundle that survives BOTH rotation and
 * process death (restored automatically from onSaveInstanceState).
 *
 * Three holders model where a value lives:
 *   'activity'   plain field        — lost on rotation AND on process death
 *   'viewmodel'  ViewModel field    — survives rotation, lost on process death
 *   'bundle'     SavedStateHandle   — survives rotation AND process death
 *
 * A scenario is a list of ops executed by simulate(ops):
 *   { set: ['activity'|'viewmodel'|'bundle', name], value }   write into a holder
 *   { rotate: true }        configuration change (destroy + recreate)
 *   { processDeath: true }  the system kills the process (low memory)
 *
 * Step shapes feed the visualizer:
 *   { type:'set',          holder, name, value }
 *   { type:'rotate' }                                  rotation begins
 *   { type:'processDeath' }                            process death begins
 *   { type:'destroy',      lost: { ...clearedFields } } fields wiped out
 *   { type:'recreate' }                                a fresh Activity is built
 *   { type:'survive',      holder:'viewmodel', values:{...} }  kept across rotation
 *   { type:'restore',      holder:'bundle',    values:{...} }  restored from Bundle
 * The generator RETURNS { activity, viewmodel, bundle } (plain objects of the
 * surviving fields in each holder).
 */

export function* simulate(ops) {
  const activity = {};
  const viewmodel = {};
  const bundle = {};

  for (const op of ops) {
    if ('set' in op) {
      const [holder, name] = op.set;
      const target = holder === 'activity' ? activity
        : holder === 'viewmodel' ? viewmodel
        : bundle;
      target[name] = op.value;
      yield { type: 'set', holder, name, value: op.value };
    } else if ('rotate' in op) {
      yield { type: 'rotate' };
      const lost = { ...activity };
      for (const k of Object.keys(activity)) delete activity[k];
      yield { type: 'destroy', lost };
      yield { type: 'recreate' };
      if (Object.keys(viewmodel).length) {
        yield { type: 'survive', holder: 'viewmodel', values: { ...viewmodel } };
      }
      if (Object.keys(bundle).length) {
        yield { type: 'restore', holder: 'bundle', values: { ...bundle } };
      }
    } else if ('processDeath' in op) {
      yield { type: 'processDeath' };
      const lost = { ...activity, ...viewmodel };
      for (const k of Object.keys(activity)) delete activity[k];
      for (const k of Object.keys(viewmodel)) delete viewmodel[k];
      yield { type: 'destroy', lost };
      yield { type: 'recreate' };
      if (Object.keys(bundle).length) {
        yield { type: 'restore', holder: 'bundle', values: { ...bundle } };
      }
    }
  }

  return {
    activity: { ...activity },
    viewmodel: { ...viewmodel },
    bundle: { ...bundle },
  };
}

/** Run to completion and return the final { activity, viewmodel, bundle }. */
export function summaryOf(ops) {
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const VIEWMODEL_SCENARIOS = [
  {
    id: 'rotation-bug',
    code: `class MainActivity : AppCompatActivity() {
    var count = 0          // ⚠️ simple champ d'Activity

    fun onClick() { count++ }
}
// L'utilisateur clique 2 fois… puis TOURNE l'écran :
// l'Activity est DÉTRUITE et recréée → count == 0 💥`,
    ops: [
      { set: ['activity', 'count'], value: 1 },
      { set: ['activity', 'count'], value: 2 },
      { rotate: true },
    ],
  },
  {
    id: 'viewmodel-fix',
    code: `class CounterViewModel : ViewModel() {
    var count = 0          // ✓ survit à la rotation
}
// rotation → l'Activity est recréée, le ViewModel est CONSERVÉ
// …mais si Android tue le PROCESS (mémoire) : ViewModel perdu aussi !`,
    ops: [
      { set: ['viewmodel', 'count'], value: 1 },
      { set: ['viewmodel', 'count'], value: 2 },
      { rotate: true },
      { processDeath: true },
    ],
  },
  {
    id: 'savedstate',
    code: `class CounterViewModel(state: SavedStateHandle) : ViewModel() {
    var count by state.saveable { mutableStateOf(0) }  // ✓✓
}
// SavedStateHandle (Bundle) survit à la rotation
// ET à la mort du process — restauré automatiquement.`,
    ops: [
      { set: ['bundle', 'count'], value: 1 },
      { set: ['bundle', 'count'], value: 2 },
      { rotate: true },
      { processDeath: true },
    ],
  },
];

export const viewModelScenarioById = (id) =>
  VIEWMODEL_SCENARIOS.find((s) => s.id === id);
