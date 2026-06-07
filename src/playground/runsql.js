/**
 * SQL engine: sql.js — genuine SQLite compiled to WebAssembly, entirely in
 * the browser. The database is created fresh on every run (deterministic,
 * like every other playground engine); results are rendered as ASCII tables.
 */
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let sqlPromise = null;
let loaded = false;

function engine() {
  sqlPromise ??= import('sql.js')
    .then((m) => (m.default ?? m)({ locateFile: () => wasmUrl }))
    .then((SQL) => {
      loaded = true;
      return SQL;
    })
    .catch((e) => {
      sqlPromise = null; // a failed wasm download can be retried
      throw e;
    });
  return sqlPromise;
}

/** Format one result set as a monospace table. */
function asciiTable(columns, values) {
  const cell = (v) => (v === null ? 'NULL' : String(v));
  const widths = columns.map((c, i) =>
    Math.max(c.length, ...values.map((row) => cell(row[i]).length))
  );
  const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join(' │ ');
  return [
    line(columns),
    widths.map((w) => '─'.repeat(w)).join('─┼─'),
    ...values.map((row) => line(row.map(cell))),
  ];
}

export async function runSql(code, { onLoading } = {}) {
  if (!loaded) onLoading?.();
  let SQL;
  try {
    SQL = await engine();
  } catch {
    return { logs: [], netError: true };
  }

  const logs = [];
  const db = new SQL.Database();
  try {
    const results = db.exec(code); // runs every statement; SELECTs return result sets
    for (const res of results) {
      for (const l of asciiTable(res.columns, res.values)) logs.push({ kind: 'log', text: l });
      logs.push({ kind: 'log', text: '' });
    }
    if (results.length === 0) {
      logs.push({ kind: 'log', text: 'OK — aucune ligne à afficher (pense à un SELECT final)' });
    }
  } catch (e) {
    logs.push({ kind: 'crash', text: String(e?.message ?? e) });
  } finally {
    db.close();
  }
  return { logs, netError: false };
}
