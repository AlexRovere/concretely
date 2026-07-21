/**
 * Petite courbe de loss pour les visualizers qui optimisent (descente de
 * gradient, réseau de neurones). Trace la suite des pertes `losses` jusqu'à
 * l'indice `upTo` inclus, normalisée sur [min, max]. Autonome : aucun état,
 * redessine tout à chaque appel.
 */
export function drawLossCurve(canvas, losses, upTo) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width || canvas.width || 240));
  const h = Math.max(1, Math.round(rect.height || canvas.height || 90));
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  if (!losses.length) return;
  const n = losses.length;
  const max = Math.max(...losses);
  const min = Math.min(...losses);
  const span = max - min || 1;
  const pad = 6;
  const px = (i) => pad + (i / Math.max(1, n - 1)) * (w - 2 * pad);
  const py = (v) => h - pad - ((v - min) / span) * (h - 2 * pad);

  // ligne complète en gris clair (aperçu de la trajectoire)
  ctx.strokeStyle = 'rgba(100,116,139,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  losses.forEach((v, i) => (i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
  ctx.stroke();

  // portion parcourue en accent
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= upTo && i < n; i++) {
    if (i) ctx.lineTo(px(i), py(losses[i]));
    else ctx.moveTo(px(i), py(losses[i]));
  }
  ctx.stroke();

  // point courant
  const cur = Math.min(upTo, n - 1);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(px(cur), py(losses[cur]), 3, 0, 2 * Math.PI);
  ctx.fill();
}
