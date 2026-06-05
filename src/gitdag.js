/**
 * A model of Git's commit DAG: commits point to their parents, branches are
 * just movable pointers, HEAD names the current branch. Merging two diverged
 * branches creates a MERGE COMMIT (two parents); merging when the target is a
 * direct descendant just moves the pointer (FAST-FORWARD, no commit). Rebase
 * REPLAYS the branch's commits on top of the new base — they get NEW ids
 * (C3 → C3'), the old ones become orphaned, and history ends up linear.
 *
 * Ops:
 *   { commit: 'msg' }      new commit on HEAD's branch
 *   { branch: 'name' }     new pointer at the current commit (lane assigned)
 *   { checkout: 'name' }   HEAD moves
 *   { merge: 'name' }      fast-forward if possible, else a merge commit
 *   { rebase: 'onto' }     replay HEAD-branch commits onto `onto`'s tip
 *
 * Step shapes:
 *   { type:'commit',   id, parents, branch, msg, lane, replayOf? }
 *   { type:'branch',   name, at, lane }
 *   { type:'checkout', name }
 *   { type:'merge',    kind:'ff', into, to }
 *   { type:'merge',    kind:'commit', id, parents, into, lane }
 *   { type:'rebase',   branch, onto }
 *   { type:'orphan',   ids }
 * The generator returns { commits, branches, head, orphaned }.
 */

export function* simulate(ops) {
  const commits = {}; // id -> { id, parents, msg, branch, lane, replayOf? }
  const branches = { main: null };
  const lanes = { main: 0 };
  let head = 'main';
  let nextId = 1;
  let nextLane = 1;
  const orphaned = [];

  const ancestorsOf = (id) => {
    const seen = new Set();
    const stack = id == null ? [] : [id];
    while (stack.length) {
      const cur = stack.pop();
      if (seen.has(cur)) continue;
      seen.add(cur);
      stack.push(...commits[cur].parents);
    }
    return seen;
  };

  const addCommit = (msg, parents, branch, replayOf) => {
    const id = replayOf ? `${replayOf}'` : `C${nextId++}`;
    commits[id] = { id, parents, msg, branch, lane: lanes[branch] };
    branches[branch] = id;
    return commits[id];
  };

  for (const op of ops) {
    if ('commit' in op) {
      const parent = branches[head];
      const c = addCommit(op.commit, parent ? [parent] : [], head);
      yield { type: 'commit', id: c.id, parents: c.parents, branch: head, msg: c.msg, lane: c.lane };
    } else if ('branch' in op) {
      branches[op.branch] = branches[head];
      lanes[op.branch] = nextLane++;
      yield { type: 'branch', name: op.branch, at: branches[head], lane: lanes[op.branch] };
    } else if ('checkout' in op) {
      head = op.checkout;
      yield { type: 'checkout', name: head };
    } else if ('merge' in op) {
      const ours = branches[head];
      const theirs = branches[op.merge];
      if (ancestorsOf(theirs).has(ours)) {
        // Nothing diverged on our side: just move the pointer.
        branches[head] = theirs;
        yield { type: 'merge', kind: 'ff', into: head, to: theirs };
      } else {
        const c = addCommit(`merge ${op.merge}`, [ours, theirs], head);
        yield { type: 'merge', kind: 'commit', id: c.id, parents: c.parents, into: head, lane: c.lane };
      }
    } else if ('rebase' in op) {
      const ontoTip = branches[op.rebase];
      const baseAncestors = ancestorsOf(ontoTip);
      // Our commits not reachable from the new base, oldest first (first-parent walk).
      const toReplay = [];
      let cur = branches[head];
      while (cur && !baseAncestors.has(cur)) {
        toReplay.unshift(commits[cur]);
        cur = commits[cur].parents[0];
      }
      yield { type: 'rebase', branch: head, onto: op.rebase };
      let parent = ontoTip;
      for (const old of toReplay) {
        const c = addCommit(old.msg, [parent], head, old.id);
        parent = c.id;
        yield { type: 'commit', id: c.id, parents: c.parents, branch: head, msg: c.msg, lane: c.lane, replayOf: old.id };
      }
      orphaned.push(...toReplay.map((o) => o.id));
      yield { type: 'orphan', ids: toReplay.map((o) => o.id) };
    }
  }

  return { commits, branches, head, orphaned };
}

/** Run to completion and return { commits, branches, head, orphaned }. */
export function summaryOf(ops) {
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

const DIVERGED = [
  { commit: 'init' },
  { commit: 'feat A' },
  { branch: 'feature' },
  { checkout: 'feature' },
  { commit: 'feat B' },
  { checkout: 'main' },
  { commit: 'hotfix' },
];

export const GITDAG_SCENARIOS = [
  {
    id: 'branches',
    code: `git commit -m "init"        # C1
git commit -m "feat A"      # C2
git switch -c feature        # une branche = un POINTEUR
git commit -m "feat B"      # C3 (sur feature)
git switch main
git commit -m "hotfix"      # C4 — main avance aussi
# → les deux branches ont DIVERGÉ depuis C2`,
    ops: [...DIVERGED],
  },
  {
    id: 'merge',
    code: `# main et feature ont divergé depuis C2 :
git switch main
git merge feature
# → impossible d'avancer le pointeur tout droit :
#   Git crée un COMMIT DE MERGE (2 parents : C4 et C3).
#   L'historique garde la trace de la fourche.`,
    ops: [...DIVERGED, { merge: 'feature' }],
  },
  {
    id: 'fast-forward',
    code: `git commit -m "init"        # C1, C2 sur main
git switch -c feature
git commit -m "feat B"      # C3 — main n'a PAS bougé
git switch main
git merge feature
# → main est un ancêtre direct : FAST-FORWARD,
#   le pointeur main glisse sur C3. AUCUN commit créé.`,
    ops: [
      { commit: 'init' },
      { commit: 'feat A' },
      { branch: 'feature' },
      { checkout: 'feature' },
      { commit: 'feat B' },
      { checkout: 'main' },
      { merge: 'feature' },
    ],
  },
  {
    id: 'rebase',
    code: `# même divergence (C3 sur feature, C4 sur main) :
git switch feature
git rebase main
# → C3 est REJOUÉ sur C4 et devient C3' (NOUVEL id !)
#   l'ancien C3 est orphelin ; l'historique est LINÉAIRE.
git switch main
git merge feature           # → simple fast-forward ✓`,
    ops: [
      ...DIVERGED,
      { checkout: 'feature' },
      { rebase: 'main' },
      { checkout: 'main' },
      { merge: 'feature' },
    ],
  },
];

export const gitDagScenarioById = (id) => GITDAG_SCENARIOS.find((s) => s.id === id);
