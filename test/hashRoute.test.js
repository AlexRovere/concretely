import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, formatRoute, resolveRoute } from '../src/hashRoute.js';

// Modèle de nav factice : deux catégories, chacune avec des onglets connus.
const nav = {
  categories: ['general', 'swift'],
  modes: { general: ['sorting', 'bigo'], swift: ['swiftbasics', 'arc'] },
  firstMode(cat) { return this.modes[cat]?.[0] ?? null; },
  isValidMode(cat, mode) { return !!this.modes[cat]?.includes(mode); },
};

test('parseHash: empty / "#/" / "#" → home', () => {
  for (const h of ['', '#', '#/', '/', '#//']) {
    assert.deepEqual(parseHash(h), { view: 'home' }, h);
  }
});

test('parseHash: category only and category/mode', () => {
  assert.deepEqual(parseHash('#/swift'), { view: 'panel', cat: 'swift' });
  assert.deepEqual(parseHash('#/swift/arc'), { view: 'panel', cat: 'swift', mode: 'arc' });
  assert.deepEqual(parseHash('#/swift/arc/extra'), { view: 'panel', cat: 'swift', mode: 'arc' });
});

test('formatRoute: home and panels', () => {
  assert.equal(formatRoute({ view: 'home' }), '#/');
  assert.equal(formatRoute(null), '#/');
  assert.equal(formatRoute({ view: 'panel', cat: 'swift' }), '#/swift');
  assert.equal(formatRoute({ view: 'panel', cat: 'swift', mode: 'arc' }), '#/swift/arc');
});

test('parse ∘ format round-trips a concrete route', () => {
  const r = { view: 'panel', cat: 'swift', mode: 'arc' };
  assert.deepEqual(parseHash(formatRoute(r)), r);
});

test('resolveRoute: valid, category-only → first tab, invalid → home', () => {
  assert.deepEqual(resolveRoute({ view: 'home' }, nav), { view: 'home' });
  assert.deepEqual(resolveRoute({ view: 'panel', cat: 'swift', mode: 'arc' }, nav), { view: 'panel', cat: 'swift', mode: 'arc' });
  // category only → first visible tab
  assert.deepEqual(resolveRoute({ view: 'panel', cat: 'swift' }, nav), { view: 'panel', cat: 'swift', mode: 'swiftbasics' });
  // unknown category → home
  assert.deepEqual(resolveRoute({ view: 'panel', cat: 'nope', mode: 'x' }, nav), { view: 'home' });
  // known category, unknown mode → first visible tab
  assert.deepEqual(resolveRoute({ view: 'panel', cat: 'general', mode: 'ghost' }, nav), { view: 'panel', cat: 'general', mode: 'sorting' });
});
