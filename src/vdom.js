/**
 * A model of Virtual-DOM list diffing, UNKEYED vs KEYED — the reason `:key`
 * matters in Vue (and React). Same final list, very different DOM work.
 *
 * UNKEYED — nodes are compared BY POSITION. For each index i we look at
 *   old[i] vs next[i]:
 *     same text     → keep   (node untouched)
 *     different text→ patch  (DOM content is REWRITTEN in place; any local DOM
 *                             state like an <input> value is LOST!)
 *     only next[i]  → insert (extra new item appended)
 *     only old[i]   → remove (extra old item dropped)
 *   A prepend therefore patches almost everything: every position shifts.
 *
 * KEYED — nodes are matched BY KEY (here the string is both key and content):
 *     key exists in old → reuse the SAME DOM node:
 *         old index === new index → keep  (already in place)
 *         old index !== new index → move  (node relocated, NOT rebuilt)
 *     key not in old              → insert
 *     old key absent from next    → remove
 *   Content never has to be patched when matching by key, because identical
 *   keys carry identical content in this model — a moved node is reused as-is.
 *
 * Simplified move rule (documented deviation): a kept node is one whose old
 * index equals its new index; otherwise the reused node counts as a `move`.
 * A real diff (Vue's longest-increasing-subsequence) keeps a maximal stable
 * run and only moves the rest, so it may emit fewer moves than this model.
 * We never patch in keyed mode and never claim more moves than necessary to
 * make the point that keyed reuses nodes while unkeyed rewrites them.
 *
 * Scenario shape:
 *   { id, code, mode:'unkeyed'|'keyed', old:['A','B','C'], next:[...] }
 *   (items are strings; the string is BOTH the key and the rendered content.)
 *
 * Step shapes:
 *   { type:'compare', index, oldItem:x|null, newItem:y|null }
 *   { type:'keep',    index, item }          node reused, nothing touched
 *   { type:'patch',   index, from, to }      DOM content rewritten (unkeyed)
 *   { type:'move',    item, from, to }       keyed: node relocated, not rebuilt
 *   { type:'insert',  index, item }
 *   { type:'remove',  index|item }
 * The generator RETURNS:
 *   { result:[...final list], ops:{ keep, patch, move, insert, remove } }
 */

export function* simulate(scenario) {
  const { mode, old, next } = scenario;
  const ops = { keep: 0, patch: 0, move: 0, insert: 0, remove: 0 };
  const result = [];

  if (mode === 'keyed') {
    const oldIndex = new Map();
    old.forEach((item, i) => oldIndex.set(item, i));
    const nextSet = new Set(next);

    for (let i = 0; i < next.length; i++) {
      const item = next[i];
      const from = oldIndex.has(item) ? oldIndex.get(item) : null;
      yield { type: 'compare', index: i, oldItem: from === null ? null : item, newItem: item };
      if (from === null) {
        ops.insert++;
        yield { type: 'insert', index: i, item };
      } else if (from === i) {
        ops.keep++;
        yield { type: 'keep', index: i, item };
      } else {
        ops.move++;
        yield { type: 'move', item, from, to: i };
      }
      result.push(item);
    }

    for (let i = 0; i < old.length; i++) {
      const item = old[i];
      if (!nextSet.has(item)) {
        ops.remove++;
        yield { type: 'remove', index: i, item };
      }
    }

    return { result, ops };
  }

  // Unkeyed: walk positions 0..max(old.length, next.length)-1, by position.
  const max = Math.max(old.length, next.length);
  for (let i = 0; i < max; i++) {
    const oldItem = i < old.length ? old[i] : null;
    const newItem = i < next.length ? next[i] : null;
    yield { type: 'compare', index: i, oldItem, newItem };
    if (oldItem !== null && newItem !== null) {
      if (oldItem === newItem) {
        ops.keep++;
        yield { type: 'keep', index: i, item: newItem };
      } else {
        ops.patch++;
        yield { type: 'patch', index: i, from: oldItem, to: newItem };
      }
      result.push(newItem);
    } else if (newItem !== null) {
      ops.insert++;
      yield { type: 'insert', index: i, item: newItem };
      result.push(newItem);
    } else {
      ops.remove++;
      yield { type: 'remove', index: i, item: oldItem };
    }
  }

  return { result, ops };
}

/** Drains the generator and returns its summary { result, ops }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const VDOM_SCENARIOS = [
  {
    id: 'prepend-unkeyed',
    mode: 'unkeyed',
    old: ['B', 'C'],
    next: ['A', 'B', 'C'],
    code: `<!-- v-for SANS :key -->
<li v-for="item in items">{{ item }}</li>
<!-- ['B','C'] devient ['A','B','C'] :
     comparé PAR POSITION → B→A patché, C→B patché, C inséré.
     3 opérations DOM (et l'état des inputs se mélange !) -->`,
  },
  {
    id: 'prepend-keyed',
    mode: 'keyed',
    old: ['B', 'C'],
    next: ['A', 'B', 'C'],
    code: `<!-- v-for AVEC :key -->
<li v-for="item in items" :key="item">{{ item }}</li>
<!-- B et C sont RÉUTILISÉS tels quels (déplacés),
     seul A est créé : 1 insertion. -->`,
  },
  {
    id: 'shuffle-unkeyed',
    mode: 'unkeyed',
    old: ['A', 'B', 'C', 'D'],
    next: ['D', 'A', 'B', 'C'],
    code: `<!-- Rotation SANS :key : chaque position change de texte
     → 4 patchs (tout le contenu réécrit). -->`,
  },
  {
    id: 'shuffle-keyed',
    mode: 'keyed',
    old: ['A', 'B', 'C', 'D'],
    next: ['D', 'A', 'B', 'C'],
    code: `<!-- Rotation AVEC :key : les nœuds sont déplacés, jamais réécrits. -->`,
  },
];

export const vdomScenarioById = (id) => VDOM_SCENARIOS.find((s) => s.id === id);
