/**
 * Java engine: the Compiler Explorer (godbolt.org) execution API — CORS `*`.
 * Compiled and executed on the Compiler Explorer servers (jdk 25).
 * Godbolt names the source file `<source>`, so the main class must NOT be
 * public — the sample and the note both say so.
 */
const API = 'https://godbolt.org/api/compiler/java2501/compile'; // jdk 25.0.1

export async function runJava(code) {
  const logs = [];
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        source: code,
        lang: 'java',
        allowStoreCodeDebug: false,
        options: {
          userArguments: '',
          filters: { execute: true },
          executeParameters: { args: [], stdin: '' },
          compilerOptions: { executorRequest: true },
        },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    for (const line of json.buildResult?.stderr ?? []) {
      if (line.text.trim() === '') continue;
      logs.push({ kind: /error/.test(line.text) ? 'crash' : 'warn', text: line.text });
    }
    if ((json.buildResult?.code ?? 0) !== 0) return { logs, netError: false };

    for (const line of json.stdout ?? []) logs.push({ kind: 'log', text: line.text });
    for (const line of json.stderr ?? []) {
      if (line.text.trim() !== '') {
        // runtime exceptions land on stderr
        logs.push({ kind: /Exception|Error/.test(line.text) ? 'crash' : 'warn', text: line.text });
      }
    }
    if (json.timedOut) logs.push({ kind: 'crash', text: 'temps d\'exécution dépassé' });
    return { logs, netError: false };
  } catch {
    return { logs, netError: true };
  }
}
