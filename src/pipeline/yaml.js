/**
 * Mini-parseur YAML — sous-ensemble suffisant pour les fichiers CI (GitLab /
 * GitHub). Fait maison, zéro dépendance. Gère :
 *   - maps indentées (clé: valeur)
 *   - listes de blocs (- item)
 *   - flow inline { a: 1 } et [ 1, 2 ]
 *   - scalaires : nombres, booléens, null, chaînes quotées ('…' / "…") ou nues
 *   - commentaires # et lignes vides
 * NON géré (→ erreur claire) : tabulations d'indentation, ancres &/*, multi-docs.
 *
 * parseYaml(text) → { value } | { error: { line, message } }
 */

function scalar(raw) {
  const s = raw.trim();
  if (s === '' || s === '~' || s === 'null') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'")) {
    return s.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

/** Découpe une chaîne flow en éléments de premier niveau (respecte {}/[]/quotes). */
function splitFlow(body) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = '';
  for (const ch of body) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === '{' || ch === '[') { depth += 1; cur += ch; continue; }
    if (ch === '}' || ch === ']') { depth -= 1; cur += ch; continue; }
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim() !== '') parts.push(cur);
  return parts;
}

// Parse une valeur flow inline ({…} ou […]) ou un scalaire. Lève sur flow mal fermé.
function parseFlow(raw) {
  const s = raw.trim();
  if (s[0] === '{') {
    if (s.at(-1) !== '}') throw new Error('unclosed flow map');
    const obj = {};
    for (const part of splitFlow(s.slice(1, -1))) {
      const idx = splitKeyColon(part);
      if (idx === -1) throw new Error('invalid flow map entry');
      obj[scalarKey(part.slice(0, idx))] = parseFlow(part.slice(idx + 1));
    }
    return obj;
  }
  if (s[0] === '[') {
    if (s.at(-1) !== ']') throw new Error('unclosed flow list');
    const inner = s.slice(1, -1).trim();
    return inner === '' ? [] : splitFlow(inner).map(parseFlow);
  }
  return scalar(s);
}

const scalarKey = (raw) => {
  const s = raw.trim();
  if ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'")) return s.slice(1, -1);
  return s;
};

/** Index du `:` qui sépare clé/valeur au niveau flow (ignore quotes/imbrication). */
function splitKeyColon(str) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ']') depth -= 1;
    else if (ch === ':' && depth === 0 && (str[i + 1] === ' ' || i === str.length - 1)) return i;
  }
  return -1;
}

// Retire un commentaire # de fin de ligne (hors chaîne quotée).
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '#' && (i === 0 || line[i - 1] === ' ')) return line.slice(0, i);
  }
  return line;
}

export function parseYaml(text) {
  // Pré-traitement : numérote, retire commentaires et lignes vides, rejette les tabs.
  const rows = [];
  const raw = String(text ?? '').split('\n');
  for (let i = 0; i < raw.length; i++) {
    const noComment = stripComment(raw[i]);
    if (noComment.trim() === '') continue;
    const indentPart = noComment.match(/^ */)[0];
    if (/\t/.test(noComment.slice(0, indentPart.length + 1)) || /^\s*\t/.test(noComment)) {
      return { error: { line: i + 1, message: 'YAML indentation must use spaces, not tabs' } };
    }
    rows.push({ indent: indentPart.length, content: noComment.trim(), line: i + 1 });
  }
  if (!rows.length) return { value: {} };

  let pos = 0;
  // Parse un bloc à l'indentation `minIndent`. Renvoie un objet, un tableau ou un scalaire.
  function parseBlock(minIndent) {
    const first = rows[pos];
    if (first.content.startsWith('- ') || first.content === '-') return parseList(minIndent);
    return parseMap(minIndent);
  }

  function parseMap(indent) {
    const obj = {};
    while (pos < rows.length && rows[pos].indent === indent) {
      const row = rows[pos];
      const idx = splitKeyColon(row.content);
      if (idx === -1) throw Object.assign(new Error(`expected "key: value" near "${row.content}"`), { line: row.line });
      const key = scalarKey(row.content.slice(0, idx));
      const rest = row.content.slice(idx + 1).trim();
      pos += 1;
      if (rest !== '') {
        try {
          obj[key] = parseFlow(rest);
        } catch (e) {
          throw Object.assign(new Error(e.message), { line: row.line });
        }
      } else if (pos < rows.length && rows[pos].indent > indent) {
        obj[key] = parseBlock(rows[pos].indent);
      } else {
        obj[key] = null;
      }
    }
    return obj;
  }

  function parseList(indent) {
    const arr = [];
    while (pos < rows.length && rows[pos].indent === indent && (rows[pos].content.startsWith('- ') || rows[pos].content === '-')) {
      const row = rows[pos];
      const after = row.content === '-' ? '' : row.content.slice(2).trim();
      pos += 1;
      if (after === '') {
        if (pos < rows.length && rows[pos].indent > indent) arr.push(parseBlock(rows[pos].indent));
        else arr.push(null);
      } else if (splitKeyColon(after) !== -1 && after[0] !== '{' && after[0] !== '[') {
        // « - clé: valeur » : une map dont la 1re paire est inline, la suite indentée à +2.
        const idx = splitKeyColon(after);
        const item = {};
        try {
          const v = after.slice(idx + 1).trim();
          item[scalarKey(after.slice(0, idx))] = v === '' ? null : parseFlow(v);
        } catch (e) {
          throw Object.assign(new Error(e.message), { line: row.line });
        }
        const childIndent = indent + 2;
        while (pos < rows.length && rows[pos].indent >= childIndent && !rows[pos].content.startsWith('- ')) {
          Object.assign(item, parseMap(rows[pos].indent));
        }
        arr.push(item);
      } else {
        try {
          arr.push(parseFlow(after));
        } catch (e) {
          throw Object.assign(new Error(e.message), { line: row.line });
        }
      }
    }
    return arr;
  }

  try {
    const value = parseBlock(rows[0].indent);
    return { value };
  } catch (e) {
    return { error: { line: e.line ?? rows[Math.min(pos, rows.length - 1)]?.line ?? 1, message: e.message } };
  }
}
