import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CODE_THEMES, CODE_FONTS, APP_THEMES, codeThemeById, codeFontById } from '../src/themes.js';

const HEX = /^#[0-9a-f]{6}$/i;
const TOKENS = ['comment', 'string', 'number', 'keyword', 'literal', 'type', 'func'];

test('every code theme is complete (surfaces + all 7 token colors, valid hex)', () => {
  const ids = new Set();
  for (const th of CODE_THEMES) {
    assert.ok(!ids.has(th.id), `duplicate ${th.id}`);
    ids.add(th.id);
    assert.ok(th.name.length > 2, th.id);
    assert.equal(typeof th.dark, 'boolean', th.id);
    for (const k of ['bg', 'head', 'ink', 'border']) assert.match(th[k], HEX, `${th.id}.${k}`);
    for (const k of TOKENS) assert.match(th.tok[k], HEX, `${th.id}.tok.${k}`);
  }
  // both flavors are on offer
  assert.ok(CODE_THEMES.some((th) => th.dark) && CODE_THEMES.some((th) => !th.dark));
});

test('every code font has a monospace-terminated stack', () => {
  const ids = new Set();
  for (const f of CODE_FONTS) {
    assert.ok(!ids.has(f.id), `duplicate ${f.id}`);
    ids.add(f.id);
    assert.ok(f.name.length > 2, f.id);
    assert.match(f.stack, /monospace$/, `${f.id}: stack must fall back to monospace`);
  }
});

test('lookups + defaults used by useTheme exist', () => {
  assert.deepEqual(APP_THEMES, ['dark', 'light']);
  assert.ok(codeThemeById('tokyo'), 'default code theme');
  assert.ok(codeFontById('cascadia'), 'default font');
  assert.equal(codeThemeById('nope'), undefined);
});
