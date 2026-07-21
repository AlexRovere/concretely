import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES } from '../src/nav.js';
import { CATEGORY_META, GROUPS, GROUP_LABEL } from '../src/categoryMeta.js';

test('every category has a complete, well-formed meta entry', () => {
  for (const cat of CATEGORIES) {
    const m = CATEGORY_META[cat];
    assert.ok(m, `missing meta for ${cat}`);
    assert.ok(m.icon && m.icon.length > 0, `${cat}: icon`);
    assert.ok(GROUPS.includes(m.group), `${cat}: group ${m.group}`);
    assert.ok(m.tagline.fr.length > 3 && m.tagline.en.length > 3, `${cat}: tagline`);
  }
});

test('no orphan meta entry (every meta key is a real category)', () => {
  for (const key of Object.keys(CATEGORY_META)) {
    assert.ok(CATEGORIES.includes(key), `orphan meta: ${key}`);
  }
  assert.equal(Object.keys(CATEGORY_META).length, CATEGORIES.length);
});

test('every group has a bilingual label', () => {
  for (const g of GROUPS) {
    assert.ok(GROUP_LABEL[g]?.fr && GROUP_LABEL[g]?.en, `group label ${g}`);
  }
});
