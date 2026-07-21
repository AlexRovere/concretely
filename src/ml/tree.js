/**
 * Arbre de décision (CART) pour la classification 2D, avec coupes axis-aligned.
 * On construit l'arbre complet (impureté de Gini), puis on émet une liste de
 * frames révélant une coupe de plus à chaque étape (ordre BFS) — de quoi
 * animer la partition du plan et synchroniser un diagramme d'arbre.
 *
 * decisionTreeSteps(points, {maxDepth, res}) => { tree, frames }
 *   tree   : nœud racine (voir buildTree)
 *   frames : [{ splits, regionGrid, splitsShown, regions, depth }]
 * MlPlaneRenderer lit `splits` (segments) et `regionGrid` ({res, cells}).
 */

const NUM_CLASSES = 6;

function counts(points) {
  const c = new Array(NUM_CLASSES).fill(0);
  for (const p of points) c[p.label] += 1;
  return c;
}

export function gini(points) {
  if (!points.length) return 0;
  const c = counts(points);
  let sum = 0;
  for (const n of c) {
    const p = n / points.length;
    sum += p * p;
  }
  return 1 - sum;
}

function majorityClass(points) {
  const c = counts(points);
  let best = 0;
  for (let i = 1; i < c.length; i++) if (c[i] > c[best]) best = i;
  return best;
}

/** Meilleure coupe axis-aligned minimisant l'impureté pondérée. */
function bestSplit(points) {
  const parent = gini(points);
  let best = null;
  for (const axis of ['x', 'y']) {
    const vals = [...new Set(points.map((p) => p[axis]))].sort((a, b) => a - b);
    for (let i = 1; i < vals.length; i++) {
      const threshold = (vals[i - 1] + vals[i]) / 2;
      const left = points.filter((p) => p[axis] <= threshold);
      const right = points.filter((p) => p[axis] > threshold);
      if (!left.length || !right.length) continue;
      const weighted = (left.length * gini(left) + right.length * gini(right)) / points.length;
      const gain = parent - weighted;
      if (!best || gain > best.gain) best = { axis, threshold, gain, left, right };
    }
  }
  return best && best.gain > 1e-9 ? best : null;
}

/** Construit l'arbre récursivement. Chaque nœud interne porte une `split`. */
export function buildTree(points, { maxDepth = 4, minLeaf = 4 } = {}, bounds = { x0: 0, x1: 1, y0: 0, y1: 1 }, depth = 0) {
  const node = { depth, bounds, n: points.length, majority: majorityClass(points), gini: gini(points), split: null, left: null, right: null };
  if (depth >= maxDepth || node.gini === 0 || points.length < minLeaf) return node;
  const best = bestSplit(points);
  if (!best) return node;
  node.split = { axis: best.axis, threshold: best.threshold };
  const lb = best.axis === 'x' ? { ...bounds, x1: best.threshold } : { ...bounds, y1: best.threshold };
  const rb = best.axis === 'x' ? { ...bounds, x0: best.threshold } : { ...bounds, y0: best.threshold };
  node.left = buildTree(best.left, { maxDepth, minLeaf }, lb, depth + 1);
  node.right = buildTree(best.right, { maxDepth, minLeaf }, rb, depth + 1);
  return node;
}

/** Numérote les nœuds internes en ordre BFS (champ `bfs`). Retourne le total. */
function numberInternal(root) {
  const queue = [root];
  let next = 0;
  while (queue.length) {
    const node = queue.shift();
    if (node.split) {
      node.bfs = next++;
      queue.push(node.left, node.right);
    }
  }
  return next;
}

function predict(node, x, y, limit) {
  if (!node.split || node.bfs >= limit) return node.majority;
  const goLeft = node.split.axis === 'x' ? x <= node.split.threshold : y <= node.split.threshold;
  return predict(goLeft ? node.left : node.right, x, y, limit);
}

function collectSplits(node, limit, out) {
  if (!node.split || node.bfs >= limit) return;
  const { axis, threshold } = node.split;
  const b = node.bounds;
  if (axis === 'x') out.push({ x0: threshold, y0: b.y0, x1: threshold, y1: b.y1 });
  else out.push({ x0: b.x0, y0: threshold, x1: b.x1, y1: threshold });
  collectSplits(node.left, limit, out);
  collectSplits(node.right, limit, out);
}

function maxRevealedDepth(node, limit) {
  if (!node.split || node.bfs >= limit) return node.depth;
  return Math.max(maxRevealedDepth(node.left, limit), maxRevealedDepth(node.right, limit));
}

function regionGrid(root, limit, res) {
  const cells = new Int8Array(res * res);
  for (let iy = 0; iy < res; iy++) {
    for (let ix = 0; ix < res; ix++) {
      cells[iy * res + ix] = predict(root, (ix + 0.5) / res, (iy + 0.5) / res, limit);
    }
  }
  return { res, cells };
}

export function decisionTreeSteps(points, { maxDepth = 4, res = 40 } = {}) {
  const tree = buildTree(points, { maxDepth });
  const total = numberInternal(tree);
  const frames = [];
  for (let limit = 0; limit <= total; limit++) {
    const splits = [];
    collectSplits(tree, limit, splits);
    frames.push({
      splits,
      regionGrid: regionGrid(tree, limit, res),
      splitsShown: limit,
      regions: limit + 1,
      depth: maxRevealedDepth(tree, limit),
    });
  }
  return { tree, frames };
}
