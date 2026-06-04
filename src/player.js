/**
 * Plays a precomputed array of steps, feeding them to `onStep` on a timer.
 * Framework-agnostic: it knows nothing about canvases or algorithms.
 *
 * `delay` is the ms between ticks; `chunk` is how many steps are applied per
 * tick (used so very large runs can play fast without a 4ms-per-step floor).
 */
export class StepPlayer {
  constructor({ onStep, onDone, onReset } = {}) {
    this.steps = [];
    this.i = 0;
    this.delay = 16;
    this.chunk = 1;
    this.timer = null;
    this.onStep = onStep;
    this.onDone = onDone;
    this.onReset = onReset;
  }

  load(steps) {
    this.stop();
    this.steps = steps;
    this.i = 0;
    this.onReset?.();
  }

  get playing() { return this.timer !== null; }
  get done() { return this.i >= this.steps.length; }
  get progress() { return this.steps.length ? this.i / this.steps.length : 0; }

  /** speed: 1 (slow) … 100 (fast) → maps to delay + chunk (non-linear). */
  setSpeed(speed) {
    const s = Math.max(1, Math.min(100, speed));
    const t = (s - 1) / 99; // 0 (slow) … 1 (fast)
    this.delay = Math.max(4, Math.round(600 * (1 - t) ** 2)); // ~600ms … ~4ms
    this.chunk = s < 70 ? 1 : Math.ceil((s - 69) / 6); // batch steps at high speed
  }

  play() {
    if (this.timer || this.done) return;
    const tick = () => {
      let n = this.chunk;
      while (n-- > 0 && this.i < this.steps.length) this.onStep(this.steps[this.i++]);
      if (this.done) { this.stop(); this.onDone?.(); return; }
      this.timer = setTimeout(tick, this.delay);
    };
    this.timer = setTimeout(tick, 0);
  }

  pause() { this.stop(); }

  stop() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }

  stepOnce() {
    this.stop();
    if (!this.done) {
      this.onStep(this.steps[this.i++]);
      if (this.done) this.onDone?.();
    }
  }
}
