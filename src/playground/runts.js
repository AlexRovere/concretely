/**
 * TypeScript engine: the official `typescript` compiler (lazy chunk),
 * transpile-only (no full type-check — that would need the lib.d.ts set),
 * then the result runs in the same sandboxed Worker as the JS engine.
 * Syntax errors are reported by the transpiler before anything runs.
 */
let tsPromise = null;
let loaded = false;

function compiler() {
  tsPromise ??= import('typescript')
    .then((m) => {
      loaded = true;
      return m.default ?? m;
    })
    .catch((e) => {
      tsPromise = null; // a failed download can be retried
      throw e;
    });
  return tsPromise;
}

export async function runTs(code, { timeoutMs, onLoading } = {}) {
  if (!loaded) onLoading?.();
  let ts;
  try {
    ts = await compiler();
  } catch {
    return { logs: [], timedOut: false, netError: true };
  }

  const res = ts.transpileModule(code, {
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
  });

  const logs = [];
  for (const d of res.diagnostics ?? []) {
    const line = d.file && d.start !== undefined
      ? d.file.getLineAndCharacterOfPosition(d.start).line + 1
      : null;
    const text = ts.flattenDiagnosticMessageText(d.messageText, ' ');
    logs.push({ kind: 'crash', text: line ? `l.${line}: ${text}` : text });
  }
  if (logs.length > 0) return { logs, timedOut: false, netError: false };

  const { runJs } = await import('./runjs.js');
  const out = await runJs(res.outputText, { timeoutMs });
  return { ...out, netError: false };
}
