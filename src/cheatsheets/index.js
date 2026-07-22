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
import web from './web.js';
import docker from './docker.js';
import python from './python.js';
import c from './c.js';
import os from './os.js';
import k8s from './k8s.js';
import java from './java.js';
import patterns from './patterns.js';
import ml from './ml.js';
import cicd from './cicd.js';

/**
 * Cheatsheet registry — one sheet per filter category.
 * Sheet shape: { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export const CHEATSHEETS = { general, js, ts, vue, swift, ruby, kotlin, go, rust, git, linux, sql, web, docker, python, c, os, k8s, java, patterns, ml, cicd };

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
