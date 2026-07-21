/**
 * Petit perceptron multicouche (2 entrées → couche cachée tanh → 1 sortie
 * sigmoïde) entraîné par descente de gradient batch (entropie croisée binaire)
 * sur un jeu 2D à deux classes. On enregistre des frames à intervalle régulier :
 * surface de décision (grille res×res) + loss + époque — de quoi animer
 * l'apprentissage d'une frontière non linéaire.
 *
 * nnSteps(points, opts) => { net, frames, hidden }
 *   frames : [{ epoch, loss, regionGrid:{res,cells} }]
 */
import { mulberry32 } from './datasets.js';

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

function initNet(hidden, seed) {
  const rng = mulberry32(seed);
  const rand = () => (rng() * 2 - 1) * 0.8;
  return {
    W1: Array.from({ length: hidden }, () => [rand(), rand()]),
    b1: new Array(hidden).fill(0),
    W2: Array.from({ length: hidden }, () => rand()),
    b2: 0,
  };
}

function forward(net, x1, x2) {
  const H = net.W1.length;
  const a1 = new Array(H);
  for (let j = 0; j < H; j++) {
    a1[j] = Math.tanh(net.W1[j][0] * x1 + net.W1[j][1] * x2 + net.b1[j]);
  }
  let z2 = net.b2;
  for (let j = 0; j < H; j++) z2 += net.W2[j] * a1[j];
  return { a1, out: sigmoid(z2) };
}

function bce(net, points) {
  let s = 0;
  for (const p of points) {
    const { out } = forward(net, p.x, p.y);
    s += -(p.label * Math.log(out + 1e-9) + (1 - p.label) * Math.log(1 - out + 1e-9));
  }
  return s / points.length;
}

function trainStep(net, points, lr) {
  const H = net.W1.length;
  const n = points.length;
  const gW1 = Array.from({ length: H }, () => [0, 0]);
  const gb1 = new Array(H).fill(0);
  const gW2 = new Array(H).fill(0);
  let gb2 = 0;
  for (const p of points) {
    const { a1, out } = forward(net, p.x, p.y);
    const dz2 = out - p.label; // dérivée BCE ∘ sigmoïde
    for (let j = 0; j < H; j++) {
      gW2[j] += dz2 * a1[j];
      const dz1 = dz2 * net.W2[j] * (1 - a1[j] * a1[j]); // tanh'
      gW1[j][0] += dz1 * p.x;
      gW1[j][1] += dz1 * p.y;
      gb1[j] += dz1;
    }
    gb2 += dz2;
  }
  for (let j = 0; j < H; j++) {
    net.W2[j] -= (lr * gW2[j]) / n;
    net.W1[j][0] -= (lr * gW1[j][0]) / n;
    net.W1[j][1] -= (lr * gW1[j][1]) / n;
    net.b1[j] -= (lr * gb1[j]) / n;
  }
  net.b2 -= (lr * gb2) / n;
}

/** Classe prédite (0/1) pour un point — utile aux tests d'accuracy. */
export function nnPredict(net, x1, x2) {
  return forward(net, x1, x2).out >= 0.5 ? 1 : 0;
}

export function nnSteps(points, { hidden = 8, lr = 0.8, epochs = 300, record = 10, res = 32, seed = 3 } = {}) {
  const net = initNet(hidden, seed);
  const frames = [];
  const snapshot = (epoch) => {
    const cells = new Int8Array(res * res);
    for (let iy = 0; iy < res; iy++) {
      for (let ix = 0; ix < res; ix++) {
        cells[iy * res + ix] = nnPredict(net, (ix + 0.5) / res, (iy + 0.5) / res);
      }
    }
    frames.push({ epoch, loss: bce(net, points), regionGrid: { res, cells } });
  };
  snapshot(0);
  for (let e = 1; e <= epochs; e++) {
    trainStep(net, points, lr);
    if (e % record === 0 || e === epochs) snapshot(e);
  }
  return { net, frames, hidden };
}
