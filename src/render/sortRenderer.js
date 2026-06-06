import { applyStep } from '../sorting/algorithms.js';
import { themeColors, onThemeChange } from './cssColors.js';

const COLOR_SPEC = {
  bar: ['--cv-bar', '#475569'],
  sorted: ['--ok', '#22c55e'],
  compare: ['--warn', '#eab308'],
  active: ['--ko', '#ef4444'],
};

/** Draws an array as bars and highlights compare/swap/sorted steps. */
export class SortRenderer {
  constructor(canvas, array) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    onThemeChange(() => this.draw()); // one renderer per panel — no leak
    this.reset(array);
  }

  reset(array) {
    this.array = [...array];
    this.max = Math.max(1, ...this.array);
    this.compare = null;
    this.active = null;
    this.sorted = new Set();
    this.draw();
  }

  step(s) {
    this.compare = null;
    this.active = null;
    if (s.type === 'compare') this.compare = [s.a, s.b];
    else if (s.type === 'swap') { applyStep(this.array, s); this.active = [s.a, s.b]; }
    else if (s.type === 'set') { applyStep(this.array, s); this.active = [s.index]; }
    else if (s.type === 'sorted') this.sorted.add(s.index);
    this.draw();
  }

  markAllSorted() {
    for (let i = 0; i < this.array.length; i++) this.sorted.add(i);
    this.compare = this.active = null;
    this.draw();
  }

  draw() {
    const { ctx, canvas, array, max } = this;
    const COLORS = themeColors(COLOR_SPEC);
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const n = array.length;
    if (!n) return;
    const bw = W / n;
    for (let i = 0; i < n; i++) {
      const h = (array[i] / max) * (H - 4);
      let color = COLORS.bar;
      if (this.sorted.has(i)) color = COLORS.sorted;
      if (this.compare && (i === this.compare[0] || i === this.compare[1])) color = COLORS.compare;
      if (this.active && this.active.includes(i)) color = COLORS.active;
      ctx.fillStyle = color;
      ctx.fillRect(i * bw + 0.5, H - h, Math.max(1, bw - 1), h);
    }
  }
}
