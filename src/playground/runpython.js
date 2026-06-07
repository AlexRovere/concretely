/**
 * Python engine: Pyodide — genuine CPython compiled to WebAssembly. The
 * loader and the runtime are fetched from the jsDelivr CDN on the first run
 * (~12 MB, then browser-cached); execution itself is entirely local.
 */
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyPromise = null;
let loaded = false;

function engine(out) {
  pyPromise ??= import(/* @vite-ignore */ `${PYODIDE}pyodide.mjs`)
    .then((m) => m.loadPyodide({ indexURL: PYODIDE, stdout: out.stdout, stderr: out.stderr }))
    .then((py) => {
      loaded = true;
      return py;
    })
    .catch((e) => {
      pyPromise = null; // a failed CDN download can be retried
      throw e;
    });
  return pyPromise;
}

// stdout/stderr handlers are wired ONCE at load — route them through a
// mutable sink so every run captures its own output.
const sink = { logs: null };
const out = {
  stdout: (s) => sink.logs?.push({ kind: 'log', text: s }),
  stderr: (s) => sink.logs?.push({ kind: 'warn', text: s }),
};

export async function runPython(code, { onLoading } = {}) {
  if (!loaded) onLoading?.();
  let py;
  try {
    py = await engine(out);
  } catch {
    return { logs: [], netError: true };
  }

  const logs = [];
  sink.logs = logs;
  try {
    const result = await py.runPythonAsync(code);
    if (result !== undefined && result !== null) {
      logs.push({ kind: 'log', text: String(result) });
    }
  } catch (e) {
    // Keep the tail of the traceback: the last lines carry the actual error.
    const lines = String(e?.message ?? e).trim().split('\n');
    for (const l of lines.slice(-4)) logs.push({ kind: 'crash', text: l });
  } finally {
    sink.logs = null;
  }
  return { logs, netError: false };
}
