/**
 * Rust engine: the official Rust Playground execute API (the same one
 * play.rust-lang.org and mdBook use — CORS `*`). The code is compiled and
 * executed on the playground servers — requires network.
 * Response: { success, stdout, stderr, exitDetail }.
 */
export async function runRust(code) {
  const logs = [];
  try {
    const res = await fetch('https://play.rust-lang.org/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'stable',
        mode: 'debug',
        edition: '2024',
        crateType: 'bin',
        tests: false,
        code,
        backtrace: false,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // stderr carries cargo noise, warnings, compile errors and panics.
    for (const line of (json.stderr ?? '').split('\n')) {
      if (line.trim() === '' || /^\s*(Compiling|Finished|Running)\b/.test(line)) continue;
      logs.push({ kind: json.success ? 'warn' : 'crash', text: line });
    }
    for (const line of (json.stdout ?? '').split('\n')) {
      if (line !== '') logs.push({ kind: 'log', text: line });
    }
    return { logs, netError: false };
  } catch {
    return { logs, netError: true };
  }
}
