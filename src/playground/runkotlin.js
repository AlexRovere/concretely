/**
 * Kotlin engine: the official Kotlin Playground compiler API (the same one
 * play.kotlinlang.org and the embeddable widget use). The code is compiled
 * and executed on JetBrains' servers — requires network.
 */
const API = 'https://api.kotlinlang.org';
let versionPromise = null;

async function compilerVersion() {
  versionPromise ??= fetch(`${API}/versions`)
    .then((r) => r.json())
    .then((list) => list.find((v) => v.latestStable)?.version ?? list.at(-1)?.version ?? '2.4.0')
    .catch(() => '2.4.0');
  return versionPromise;
}

export async function runKotlin(code) {
  const logs = [];
  let version;
  try {
    version = await compilerVersion();
    const res = await fetch(`${API}/api/${version}/compiler/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        args: '',
        files: [{ name: 'File.kt', publicId: '', text: code }],
        confType: 'java',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    for (const fileErrors of Object.values(json.errors ?? {})) {
      for (const e of fileErrors) {
        if (e.severity === 'ERROR') {
          logs.push({ kind: 'crash', text: `l.${(e.interval?.start?.line ?? 0) + 1}: ${e.message}` });
        } else {
          logs.push({ kind: 'warn', text: e.message });
        }
      }
    }
    // stdout arrives wrapped in <outStream>…</outStream>
    const out = (json.text ?? '').replace(/<\/?(outStream|errStream)>/g, '');
    for (const line of out.split('\n')) if (line.trim() !== '') logs.push({ kind: 'log', text: line });
    if (json.exception) {
      logs.push({ kind: 'crash', text: `${json.exception.fullName}: ${json.exception.message ?? ''}` });
    }
    return { logs, netError: false };
  } catch {
    return { logs, netError: true };
  }
}
