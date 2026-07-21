/**
 * Descente de gradient pour la régression linéaire (y = a·x + b), comme liste
 * de frames. Chaque frame = { a, b, loss, epoch, line:{a,b} } : snapshot des
 * paramètres et de l'erreur quadratique moyenne (MSE) à cette époque. `line`
 * est lu directement par MlPlaneRenderer pour tracer la droite courante.
 *
 * lr par défaut = 0.3 : sous le seuil de divergence pour des x ∈ [0,1], donc la
 * loss décroît de façon monotone (MSE convexe).
 */
export function gradientSteps(points, { lr = 0.3, epochs = 50 } = {}) {
  const n = points.length;
  let a = 0;
  let b = 0;

  const mse = (aa, bb) => {
    let s = 0;
    for (const p of points) {
      const e = aa * p.x + bb - p.y;
      s += e * e;
    }
    return s / n;
  };

  const frames = [{ a, b, loss: mse(a, b), epoch: 0, line: { a, b } }];
  for (let epoch = 1; epoch <= epochs; epoch++) {
    let ga = 0;
    let gb = 0;
    for (const p of points) {
      const e = a * p.x + b - p.y;
      ga += e * p.x;
      gb += e;
    }
    ga = (2 / n) * ga;
    gb = (2 / n) * gb;
    a -= lr * ga;
    b -= lr * gb;
    frames.push({ a, b, loss: mse(a, b), epoch, line: { a, b } });
  }
  return frames;
}
