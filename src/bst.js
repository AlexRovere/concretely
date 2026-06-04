// Binary Search Tree — pure model + step generators (no DOM, fully testable).
// Nodes live in a flat map keyed by a numeric id; children are ids or null.

export function createTree() {
  return { root: null, nodes: {}, seq: 0 };
}

function addNode(tree, value) {
  const id = tree.seq++;
  tree.nodes[id] = { id, value, left: null, right: null };
  return tree.nodes[id];
}

/** Plain (non-animated) insert — used to build a tree. Duplicates are ignored. */
export function insertValue(tree, value) {
  if (tree.root === null) {
    tree.root = addNode(tree, value).id;
    return;
  }
  let cur = tree.nodes[tree.root];
  for (;;) {
    if (value < cur.value) {
      if (cur.left === null) { cur.left = addNode(tree, value).id; return; }
      cur = tree.nodes[cur.left];
    } else if (value > cur.value) {
      if (cur.right === null) { cur.right = addNode(tree, value).id; return; }
      cur = tree.nodes[cur.right];
    } else {
      return;
    }
  }
}

export function buildTree(values) {
  const tree = createTree();
  for (const v of values) insertValue(tree, v);
  return tree;
}

/** Animated search: a `compare` per node on the path, then `found` / `notfound`. */
export function* search(tree, value) {
  let id = tree.root;
  while (id !== null) {
    const node = tree.nodes[id];
    yield { type: 'compare', id };
    if (value === node.value) { yield { type: 'found', id }; return; }
    id = value < node.value ? node.left : node.right;
  }
  yield { type: 'notfound', value };
}

/** Animated traversal: a `visit` per node, in 'in' | 'pre' | 'post' order. */
export function* traverse(tree, order) {
  function* go(id) {
    if (id === null) return;
    const node = tree.nodes[id];
    if (order === 'pre') yield { type: 'visit', id, value: node.value };
    yield* go(node.left);
    if (order === 'in') yield { type: 'visit', id, value: node.value };
    yield* go(node.right);
    if (order === 'post') yield { type: 'visit', id, value: node.value };
  }
  yield* go(tree.root);
}

/** Layout: in-order x-index + depth per node → { pos:{id:{x,depth}}, width, depth }. */
export function layout(tree) {
  const pos = {};
  let x = 0;
  let maxDepth = 0;
  function walk(id, depth) {
    if (id === null) return;
    const node = tree.nodes[id];
    walk(node.left, depth + 1);
    pos[id] = { x: x++, depth };
    if (depth > maxDepth) maxDepth = depth;
    walk(node.right, depth + 1);
  }
  walk(tree.root, 0);
  return { pos, width: x, depth: maxDepth };
}

/** Parent→child id pairs, for drawing edges. */
export function edges(tree) {
  const list = [];
  for (const id in tree.nodes) {
    const n = tree.nodes[id];
    if (n.left !== null) list.push([n.id, n.left]);
    if (n.right !== null) list.push([n.id, n.right]);
  }
  return list;
}

export const BST_DEMO = [50, 30, 70, 20, 40, 60, 80, 35, 65, 75];

export const BST_OPS = [
  { id: 'in', kind: 'traverse', order: 'in' },
  { id: 'pre', kind: 'traverse', order: 'pre' },
  { id: 'post', kind: 'traverse', order: 'post' },
  { id: 'search-hit', kind: 'search', value: 65 },
  { id: 'search-miss', kind: 'search', value: 55 }
];

export function bstOpById(id) {
  return BST_OPS.find((o) => o.id === id) ?? BST_OPS[0];
}

export function opSteps(tree, op) {
  return op.kind === 'traverse' ? [...traverse(tree, op.order)] : [...search(tree, op.value)];
}
