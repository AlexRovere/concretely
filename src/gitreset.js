/**
 * Git's three zones and what `git reset` actually moves. The model that answers
 * "j'ai fait git reset --hard et j'ai perdu mon travail — pourquoi ?".
 *
 * A change travels through three zones, one at a time:
 *   working tree   the files on disk you edit
 *   index (staging) the snapshot `git add` builds for the next commit
 *   HEAD commit    the last committed snapshot on the branch
 *
 * `git reset HEAD~1` always moves HEAD back to the previous commit. The *mode*
 * decides how far the reset reaches into the other two zones:
 *   --soft   only HEAD moves; index and working tree keep the newer files.
 *   --mixed  HEAD + index reset (default); working tree keeps the newer files.
 *   --hard   HEAD + index + working tree all reset — uncommitted work is LOST.
 *
 * A scenario is a list of ops executed by simulate(ops):
 *   { edit: 'file', content: 'v2' }   edit a file in the working tree
 *   { add: 'file' }                   stage it: index[file] = workingTree[file]
 *   { commit: 'msg' }                 snapshot the INDEX into a new commit
 *   { reset: 'soft'|'mixed'|'hard' }  move HEAD to HEAD~1 (+ index/working)
 *
 * Step shapes feed the visualizer:
 *   { type:'edit',   file, content }
 *   { type:'add',    file, content }                content copied into the index
 *   { type:'commit', id, msg, files:{...} }         new commit snapshotting index
 *   { type:'reset',  mode, to }                     HEAD moves to commit `to`
 *   { type:'zone',   zone:'head'|'index'|'working', state:{...} }  a zone changed
 * On reset, one 'zone' step is emitted per zone that CHANGED, in order
 * head -> index -> working; the head zone step is always emitted.
 *
 * The generator RETURNS { workingTree, index, head:{id,files}, commits:[ids] }.
 */

export function* simulate(ops) {
  const workingTree = {};
  const index = {};
  const commits = []; // [{ id, msg, files }]; last = HEAD
  let nextCommit = 1;

  for (const op of ops) {
    if ('edit' in op) {
      workingTree[op.edit] = op.content;
      yield { type: 'edit', file: op.edit, content: op.content };
    } else if ('add' in op) {
      const content = workingTree[op.add];
      index[op.add] = content;
      yield { type: 'add', file: op.add, content };
    } else if ('commit' in op) {
      const id = `C${nextCommit++}`;
      const files = { ...index };
      commits.push({ id, msg: op.commit, files });
      yield { type: 'commit', id, msg: op.commit, files: { ...files } };
    } else if ('reset' in op) {
      const mode = op.reset;
      // HEAD moves back to the previous commit (HEAD~1).
      commits.pop();
      const head = commits[commits.length - 1];

      yield { type: 'reset', mode, to: head.id };

      // head zone always changes.
      yield { type: 'zone', zone: 'head', state: { ...head.files } };

      if (mode === 'mixed' || mode === 'hard') {
        for (const k of Object.keys(index)) delete index[k];
        Object.assign(index, head.files);
        yield { type: 'zone', zone: 'index', state: { ...index } };
      }
      if (mode === 'hard') {
        for (const k of Object.keys(workingTree)) delete workingTree[k];
        Object.assign(workingTree, head.files);
        yield { type: 'zone', zone: 'working', state: { ...workingTree } };
      }
    }
  }

  const head = commits[commits.length - 1];
  return {
    workingTree: { ...workingTree },
    index: { ...index },
    head: { id: head.id, files: { ...head.files } },
    commits: commits.map((c) => c.id),
  };
}

/** Run to completion and return the final state. */
export function summaryOf(ops) {
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

// Prelude shared by every scenario: an initial commit C1 with app.js v1,
// then a working edit + add + commit producing C2 with app.js v2.
const PRELUDE = [
  { edit: 'app.js', content: 'v1' },
  { add: 'app.js' },
  { commit: 'v1' },
  { edit: 'app.js', content: 'v2' },
  { add: 'app.js' },
  { commit: 'v2' },
];

export const GITRESET_SCENARIOS = [
  {
    id: 'add-commit',
    code: `echo "v2" > app.js     # working tree modifié
git add app.js          # → index (staging)
git commit -m "v2"      # → HEAD (nouveau commit C2)
# Le changement traverse les 3 zones, une étape à la fois.`,
    ops: [...PRELUDE],
  },
  {
    id: 'reset-soft',
    code: `git reset --soft HEAD~1
# HEAD recule sur C1, MAIS l'index et le working tree gardent v2 :
# le commit est "défait", les changements restent stagés.
# Parfait pour refaire un commit (squash, message raté…).`,
    ops: [...PRELUDE, { reset: 'soft' }],
  },
  {
    id: 'reset-mixed',
    code: `git reset --mixed HEAD~1   # (le défaut)
# HEAD recule ET l'index est vidé — le working tree garde v2 :
# les changements redeviennent "non stagés".`,
    ops: [...PRELUDE, { reset: 'mixed' }],
  },
  {
    id: 'reset-hard',
    code: `git reset --hard HEAD~1
# ⚠️ TOUT recule : HEAD, index ET working tree.
# Les modifications non commitées sont PERDUES.`,
    ops: [...PRELUDE, { reset: 'hard' }],
  },
];

export const gitResetScenarioById = (id) =>
  GITRESET_SCENARIOS.find((s) => s.id === id);
