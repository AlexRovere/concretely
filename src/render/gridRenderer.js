import { key, isWall } from '../pathfinding/grid.js';
import { themeColors, onThemeChange } from './cssColors.js';

const COLOR_SPEC = {
  empty: ['--cv-cell', '#1f2937'],
  wall: ['--cv-wall', '#0b1220'],
  frontier: ['--cv-frontier', '#0ea5e9'],
  visited: ['--cv-visited', '#7c3aed'],
  path: ['--warn', '#eab308'],
  start: ['--ok', '#22c55e'],
  end: ['--ko', '#ef4444'],
};

/** Draws a grid with walls, the search frontier/visited cells, and the path. */
export class GridRenderer {
  constructor(canvas, grid, start, end) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    onThemeChange(() => this.draw()); // one renderer per panel — no leak
    this.set(grid, start, end);
  }

  set(grid, start, end) {
    this.grid = grid;
    this.start = start;
    this.end = end;
    this.clearOverlay();
  }

  clearOverlay() {
    this.visited = new Set();
    this.frontier = new Set();
    this.path = [];
    this.draw();
  }

  step(s) {
    if (s.type === 'visit') {
      this.visited.add(key(s.r, s.c));
      this.frontier.delete(key(s.r, s.c));
    } else if (s.type === 'frontier') {
      const k = key(s.r, s.c);
      if (!this.visited.has(k)) this.frontier.add(k);
    } else if (s.type === 'path') {
      this.path = s.cells;
    }
    this.draw();
  }

  cellSize() {
    return Math.floor(Math.min(this.canvas.width / this.grid.cols, this.canvas.height / this.grid.rows));
  }

  cellAt(px, py) {
    const cs = this.cellSize();
    return [Math.floor(py / cs), Math.floor(px / cs)];
  }

  draw() {
    const { ctx, canvas, grid } = this;
    const COLORS = themeColors(COLOR_SPEC);
    const cs = this.cellSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const k = key(r, c);
        let color = COLORS.empty;
        if (isWall(grid, r, c)) color = COLORS.wall;
        else if (this.frontier.has(k)) color = COLORS.frontier;
        else if (this.visited.has(k)) color = COLORS.visited;
        ctx.fillStyle = color;
        ctx.fillRect(c * cs, r * cs, cs - 1, cs - 1);
      }
    }
    ctx.fillStyle = COLORS.path;
    for (const [r, c] of this.path) ctx.fillRect(c * cs, r * cs, cs - 1, cs - 1);
    ctx.fillStyle = COLORS.start;
    ctx.fillRect(this.start[1] * cs, this.start[0] * cs, cs - 1, cs - 1);
    ctx.fillStyle = COLORS.end;
    ctx.fillRect(this.end[1] * cs, this.end[0] * cs, cs - 1, cs - 1);
  }
}
