import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runShell, renderFsTree } from '../src/playground/shellfs.js';

const logsOf = (r) => r.logs.filter((l) => l.kind === 'log').map((l) => l.text);
const crashesOf = (r) => r.logs.filter((l) => l.kind === 'crash').map((l) => l.text);

test('echo > file then cat reads it back; >> appends', () => {
  const r = runShell(`echo "salut" > a.txt
echo "monde" >> a.txt
cat a.txt`);
  assert.deepEqual(logsOf(r), ['salut', 'monde']);
  assert.deepEqual(crashesOf(r), []);
});

test('pipes: cat | grep | wc -l counts matches', () => {
  const r = runShell(`echo "pomme" > fruits.txt
echo "poire" >> fruits.txt
echo "banane" >> fruits.txt
cat fruits.txt | grep po | wc -l`);
  assert.deepEqual(logsOf(r), ['2']);
});

test('sort | uniq -c groups duplicates', () => {
  const r = runShell(`echo "b" > l.txt
echo "a" >> l.txt
echo "b" >> l.txt
cat l.txt | sort | uniq -c`);
  assert.deepEqual(logsOf(r), ['   1 a', '   2 b']);
});

test('rm refuses a dir without -r, accepts with it', () => {
  const r = runShell(`mkdir projet
rm projet
rm -r projet
ls`);
  assert.equal(crashesOf(r).length, 1);
  assert.match(crashesOf(r)[0], /utilise -r/);
  assert.deepEqual(logsOf(r), []); // ls of an empty dir
});

test('globbing: *.js expands sorted, unmatched glob stays literal, dotfiles hidden', () => {
  const r = runShell(`touch b.js a.js c.txt .env
echo *.js
echo *.md
ls`);
  assert.deepEqual(logsOf(r), ['a.js b.js', '*.md', 'a.js', 'b.js', 'c.txt']);
});

test('mkdir -p + cd + pwd walk the tree; cd .. climbs', () => {
  const r = runShell(`mkdir -p a/b/c
cd a/b
pwd
cd ..
pwd`);
  assert.deepEqual(logsOf(r), ['/home/dev/a/b', '/home/dev/a']);
});

test('mv renames; cp -r copies a directory deeply', () => {
  const r = runShell(`mkdir src
echo "x" > src/main.js
cp -r src backup
mv src/main.js src/app.js
ls src
ls backup`);
  assert.deepEqual(logsOf(r), ['app.js', 'main.js']);
});

test('rm -rf / wipes everything with a sandbox warning', () => {
  const r = runShell(`touch précieux.txt
rm -rf /
ls /`);
  assert.ok(r.logs.some((l) => l.kind === 'warn' && l.text.includes('bac à sable')));
  assert.deepEqual(Object.keys(r.root.children), []);
});

test('unknown command crashes with the available list', () => {
  const r = runShell('docker ps');
  assert.match(crashesOf(r)[0], /commande inconnue : docker/);
});

test('renderFsTree marks the cwd and shows files with sizes', () => {
  const r = runShell(`mkdir -p projet/src
cd projet
echo "# readme" > README.md`);
  const html = renderFsTree(r);
  assert.match(html, /fs-cwd/);
  assert.match(html, /tu es ici/);
  assert.match(html, /README\.md/);
  assert.match(html, /fs-size/);
});
