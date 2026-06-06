/**
 * JS engine: user code runs in a sandboxed Web Worker (no DOM access),
 * console.* is captured, and a watchdog terminates infinite loops.
 * Resolves { logs: [{ kind: 'log'|'warn'|'error'|'crash', text }], timedOut }.
 */
const WORKER_SRC = `
  const fmt = (a) => {
    if (typeof a === 'string') return a;
    if (a instanceof Error) return String(a);
    try { return JSON.stringify(a) ?? String(a); } catch { return String(a); }
  };
  for (const kind of ['log', 'info', 'warn', 'error']) {
    console[kind] = (...args) =>
      postMessage({ kind: kind === 'info' ? 'log' : kind, text: args.map(fmt).join(' ') });
  }
  onmessage = async (e) => {
    try {
      // async wrapper → top-level await works in the playground
      await (0, eval)('(async () => {\\n' + e.data + '\\n})()');
      postMessage({ kind: 'done' });
    } catch (err) {
      postMessage({ kind: 'crash', text: String(err) });
    }
  };
`;

export function runJs(code, { timeoutMs = 3000 } = {}) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
    const worker = new Worker(url);
    const logs = [];
    let settled = false;

    const finish = (timedOut) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ logs, timedOut });
    };

    const watchdog = setTimeout(() => finish(true), timeoutMs);
    worker.onmessage = (e) => {
      if (e.data.kind === 'done') finish(false);
      else logs.push(e.data);
    };
    worker.onerror = (e) => {
      logs.push({ kind: 'crash', text: e.message });
      finish(false);
    };
    worker.postMessage(code);
  });
}
