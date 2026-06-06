import Fuse from 'fuse.js';
import { STRINGS } from './i18n.js';
import { allCheatItems } from './cheatsheets/index.js';

/**
 * Global search corpus + Fuse index for the Ctrl+K palette.
 *
 * Two entry kinds:
 *  - 'tab'   → a topic tab    { mode }                — picking it switches tab
 *  - 'cheat' → a cheatsheet snippet { cat, query }    — picking it opens the
 *              category's cheatsheet pre-filtered on the snippet title
 *
 * Both locales are indexed so "array" finds « Tableaux » and vice versa.
 */
export function buildSearchEntries(tabs) {
  const entries = [];

  for (const tab of tabs) {
    if (tab.cat === '*') continue; // cheatsheet/quiz are reachable directly
    entries.push({
      kind: 'tab',
      mode: tab.mode,
      cat: tab.cat,
      titleFr: STRINGS.fr[tab.key],
      titleEn: STRINGS.en[tab.key],
      sectionFr: STRINGS.fr['cat.' + tab.cat],
      sectionEn: STRINGS.en['cat.' + tab.cat],
      code: '',
    });
  }

  for (const { cat, section, item } of allCheatItems()) {
    entries.push({
      kind: 'cheat',
      mode: 'cheatsheet',
      cat,
      id: item.id,
      titleFr: item.title.fr,
      titleEn: item.title.en,
      sectionFr: `${STRINGS.fr['cat.' + cat]} · ${section.title.fr}`,
      sectionEn: `${STRINGS.en['cat.' + cat]} · ${section.title.en}`,
      noteFr: item.note.fr,
      noteEn: item.note.en,
      code: item.code,
    });
  }

  return entries;
}

export function buildSearchIndex(tabs) {
  return new Fuse(buildSearchEntries(tabs), {
    keys: [
      { name: 'titleFr', weight: 3 },
      { name: 'titleEn', weight: 3 },
      { name: 'sectionFr', weight: 1.5 },
      { name: 'sectionEn', weight: 1.5 },
      { name: 'code', weight: 1 },
      { name: 'noteFr', weight: 0.5 },
      { name: 'noteEn', weight: 0.5 },
    ],
    threshold: 0.34,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}
