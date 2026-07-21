/**
 * Renderer 2D partagé par les visualizers ML : nuage de points dans le carré
 * unité, coloré par cluster/classe, plus des surcouches optionnelles selon ce
 * que contient le `frame` — centroïdes (✕), droite de régression, surface de
 * décision (grille de régions) et coupes d'arbre. Redessine tout le frame à
 * chaque appel (pas d'état incrémental). Palette catégorielle fixe (lisible en
 * clair comme en sombre), donc aucun abonnement au thème requis.
 *
 * Champs de `frame` reconnus (tous optionnels) :
 *   assignments : number[]           couleur de chaque point (cluster courant)
 *   centroids   : {x,y}[]            croix ✕ par cluster
 *   line        : {a,b}              droite y = a·x + b
 *   regionGrid  : {res, cells}       surface de décision (cells[iy*res+ix] = classe|-1)
 *   splits      : {x0,y0,x1,y1}[]    segments de coupe (arbre)
 *   query       : {x,y}             point interrogé mis en évidence (kNN)
 * À défaut d'`assignments`, chaque point est coloré par sa classe vraie
 * `point.label` si présente, sinon en gris neutre.
 */

// Palette catégorielle (cluster / classe). Assez distincte en clair comme sombre.
const CLUSTER_HEX = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#06b6d4', '#d946ef'];
const UNASSIGNED = '#94a3b8';
const SINGLE = '#64748b'; // points sans classe (régression)

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
    if (this.frame !== null) this.draw(this.frame);
  }

  // unité [0,1] → px (avec marge de 8px, Y inversé pour un repère mathématique)
  _x(u) { return 8 + u * (this.side - 16); }
  _y(v) { return this.side - (8 + v * (this.side - 16)); }

  // pixels client (event) → coordonnées unité [0,1] (inverse de _x/_y)
  pointerToUnit(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const inner = this.side - 16;
    const u = (clientX - rect.left - 8) / inner;
    const v = 1 - (clientY - rect.top - 8) / inner;
    return { x: Math.max(0, Math.min(1, u)), y: Math.max(0, Math.min(1, v)) };
  }

  _color(cls) {
    return cls == null || cls < 0 ? UNASSIGNED : CLUSTER_HEX[cls % CLUSTER_HEX.length];
  }

  _colorOf(point, i, frame) {
    if (frame && frame.assignments) return this._color(frame.assignments[i]);
    if (point.label != null) return this._color(point.label);
    return SINGLE;
  }

  draw(frame) {
    this.frame = frame;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.side, this.side);

    if (frame && frame.regionGrid) this._drawRegions(frame.regionGrid);
    if (frame && frame.splits) this._drawSplits(frame.splits);
    if (frame && frame.line) this._drawLine(frame.line);

    // points
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      ctx.fillStyle = this._colorOf(p, i, frame);
      ctx.beginPath();
      ctx.arc(this._x(p.x), this._y(p.y), 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (frame && frame.centroids) this._drawCentroids(frame.centroids);
    if (frame && frame.query) this._drawQuery(frame.query);
  }

  _drawRegions({ res, cells }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.18;
    const step = (this.side - 16) / res;
    for (let iy = 0; iy < res; iy++) {
      for (let ix = 0; ix < res; ix++) {
        const cls = cells[iy * res + ix];
        if (cls < 0) continue;
        ctx.fillStyle = this._color(cls);
        // +1px pour éviter les liserés entre cellules
        ctx.fillRect(8 + ix * step, this._y((iy + 1) / res), step + 1, step + 1);
      }
    }
    ctx.restore();
  }

  _drawSplits(splits) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(100,116,139,0.7)';
    ctx.lineWidth = 1.5;
    for (const s of splits) {
      ctx.beginPath();
      ctx.moveTo(this._x(s.x0), this._y(s.y0));
      ctx.lineTo(this._x(s.x1), this._y(s.y1));
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawLine({ a, b }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(8, 8, this.side - 16, this.side - 16);
    ctx.clip(); // borne la droite au carré du plan
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this._x(0), this._y(b));
    ctx.lineTo(this._x(1), this._y(a + b));
    ctx.stroke();
    ctx.restore();
  }

  _drawCentroids(centroids) {
    const ctx = this.ctx;
    ctx.lineWidth = 3;
    centroids.forEach((c, ci) => {
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

  _drawQuery({ x, y }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this._x(x), this._y(y), 7, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}
