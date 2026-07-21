/**
 * Mini-renderer Markdown → HTML, fait maison et sûr (zéro dépendance).
 * Sous-ensemble : titres (#/##/###), gras, italique, code inline + blocs,
 * listes (- et 1.), liens, paragraphes. Le HTML source est ÉCHAPPÉ d'abord,
 * puis seules nos transformations produisent des balises → pas d'injection.
 * Les liens sont restreints aux schémas sûrs (http/https/mailto/relatif).
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s) => s.replace(/[&<>"]/g, (c) => ESCAPES[c]);

function inline(text) {
  // `text` est déjà échappé — on n'ajoute que nos propres balises.
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const safe = /^(https?:|mailto:|\/|#)/i.test(url) ? url : '#';
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
}

const isBlockStart = (l) => /^(#{1,3}\s|[-*]\s|\d+\.\s|```)/.test(l);

export function renderMarkdown(src) {
  const lines = esc(String(src ?? '')).split('\n');
  const html = [];
  let listType = null; // 'ul' | 'ol' | null
  const closeList = () => {
    if (listType) { html.push(`</${listType}>`); listType = null; }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      closeList();
      const buf = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i += 1; }
      i += 1; // saute le ``` fermant
      html.push(`<pre><code>${buf.join('\n')}</code></pre>`);
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) { closeList(); html.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i += 1; continue; }

    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') { closeList(); html.push('<ul>'); listType = 'ul'; }
      html.push(`<li>${inline(ul[1])}</li>`);
      i += 1;
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') { closeList(); html.push('<ol>'); listType = 'ol'; }
      html.push(`<li>${inline(ol[1])}</li>`);
      i += 1;
      continue;
    }

    if (/^\s*$/.test(line)) { closeList(); i += 1; continue; }

    // paragraphe : agrège les lignes consécutives non-bloc
    closeList();
    const para = [line];
    i += 1;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }
  closeList();
  return html.join('\n');
}
