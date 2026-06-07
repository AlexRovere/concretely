import general from './general.js';
import js from './js.js';
import ts from './ts.js';
import vue from './vue.js';
import swift from './swift.js';
import ruby from './ruby.js';
import kotlin from './kotlin.js';
import go from './go.js';
import rust from './rust.js';
import git from './git.js';
import linux from './linux.js';
import sql from './sql.js';

/**
 * Cheatsheet registry — one sheet per filter category.
 * Sheet shape: { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export const CHEATSHEETS = { general, js, ts, vue, swift, ruby, kotlin, go, rust, git, linux, sql };

export function cheatsheetFor(cat) {
  return CHEATSHEETS[cat] ?? null;
}

/**
 * Flat list of every item across all sheets, enriched with its sheet/section —
 * the corpus indexed by the global search palette.
 */
export function allCheatItems() {
  const out = [];
  for (const sheet of Object.values(CHEATSHEETS)) {
    for (const section of sheet.sections) {
      for (const item of section.items) {
        out.push({ cat: sheet.id, lang: item.lang ?? sheet.lang, section, item });
      }
    }
  }
  return out;
}
