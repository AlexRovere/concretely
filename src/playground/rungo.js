/**
 * Go engine: the official Go Playground compile API (the same one
 * play.golang.org uses — CORS `*`). The code is compiled and executed on
 * Google's servers — requires network. Response: { Errors, Events:
 * [{ Message, Kind, Delay }], Status, VetErrors? }.
 */
export async function runGo(code) {
  const logs = [];
  try {
    const res = await fetch('https://play.golang.org/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ version: '2', withVet: 'true', body: code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.Errors) {
      for (const line of json.Errors.split('\n')) {
        if (line.trim() !== '') logs.push({ kind: 'crash', text: line });
      }
      return { logs, netError: false };
    }
    for (const ev of json.Events ?? []) {
      for (const line of (ev.Message ?? '').split('\n')) {
        if (line.trim() !== '') logs.push({ kind: ev.Kind === 'stderr' ? 'warn' : 'log', text: line });
      }
    }
    if (json.VetErrors) {
      for (const line of json.VetErrors.split('\n')) {
        if (line.trim() !== '') logs.push({ kind: 'warn', text: `vet : ${line}` });
      }
    }
    if (json.Status && json.Status !== 0) {
      logs.push({ kind: 'crash', text: `exit status ${json.Status}` });
    }
    return { logs, netError: false };
  } catch {
    return { logs, netError: true };
  }
}
