/**
 * Renderer 2D partagé par les visualizers ML : nuage de points dans le carré
 * unité, coloré par cluster/classe, centroïdes dessinés en ✕. Redessine tout
 * le frame à chaque appel (pas d'état incrémental). Couleurs indépendantes du
 * thème (palette catégorielle fixe), donc pas d'abonnement au thème requis.
 */

// Palette catégorielle (cluster / classe). Assez distincte en clair comme sombre.
const CLUSTER_HEX = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#06b6d4', '#d946ef'];
const UNASSIGNED = '#94a3b8';

export class MlPlaneRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.points = [];
    this.frame = null;
    this.resize();
  }

  setPoints(points) {
    this.points = points;
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.max(1, Math.round(rect.width || this.canvas.width || 480));
    this.side = size;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // unité [0,1] → px (avec marge de 8px, Y inversé pour un repère mathématique)
  _x(u) { return 8 + u * (this.side - 16); }
  _y(v) { return this.side - (8 + v * (this.side - 16)); }

  draw(frame) {
    this.frame = frame;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.side, this.side);

    // points
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const cluster = frame ? frame.assignments[i] : -1;
      ctx.fillStyle = cluster < 0 ? UNASSIGNED : CLUSTER_HEX[cluster % CLUSTER_HEX.length];
      ctx.beginPath();
      ctx.arc(this._x(p.x), this._y(p.y), 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // centroïdes (✕)
    if (frame && frame.centroids) {
      ctx.lineWidth = 3;
      frame.centroids.forEach((c, ci) => {
        ctx.strokeStyle = CLUSTER_HEX[ci % CLUSTER_HEX.length];
        const x = this._x(c.x);
        const y = this._y(c.y);
        const r = 7;
        ctx.beginPath();
        ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
        ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
        ctx.stroke();
      });
    }
  }
}
