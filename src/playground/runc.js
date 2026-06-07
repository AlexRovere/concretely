/**
 * C engine: the Compiler Explorer (godbolt.org) execution API — CORS `*`,
 * the same one the site itself uses. The code is compiled (gcc, -O2,
 * warnings on) and executed on the Compiler Explorer servers.
 */
const API = 'https://godbolt.org/api/compiler/cg151/compile'; // gcc 15.1

export async function runC(code) {
  const logs = [];
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        source: code,
        lang: 'c',
        allowStoreCodeDebug: false,
        options: {
          userArguments: '-O2 -Wall -Wextra',
          filters: { execute: true },
          executeParameters: { args: [], stdin: '' },
          compilerOptions: { executorRequest: true },
        },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Compile errors/warnings live in buildResult.stderr.
    for (const line of json.buildResult?.stderr ?? []) {
      if (line.text.trim() === '') continue;
      const isError = /error|erreur/.test(line.text);
      logs.push({ kind: isError ? 'crash' : 'warn', text: line.text });
    }
    if ((json.buildResult?.code ?? 0) !== 0) return { logs, netError: false };

    for (const line of json.stdout ?? []) logs.push({ kind: 'log', text: line.text });
    for (const line of json.stderr ?? []) {
      if (line.text.trim() !== '') logs.push({ kind: 'warn', text: line.text });
    }
    if (json.timedOut) logs.push({ kind: 'crash', text: 'temps d\'exécution dépassé' });
    else if (json.code !== 0) {
      logs.push({ kind: 'crash', text: `exit code ${json.code}${json.code === 139 ? ' — segfault 💥' : ''}` });
    }
    return { logs, netError: false };
  } catch {
    return { logs, netError: true };
  }
}
