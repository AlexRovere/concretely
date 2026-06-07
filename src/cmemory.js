/**
 * C memory model: stack frames vs heap blocks, as small hand-authored
 * scenarios replayed step by step. Each scenario is { id, code, steps }
 * where `code` is the displayed C snippet (French comments) and `steps`
 * is a flat array the panel renders directly — no execution logic.
 *
 * Step vocabulary:
 *   { type:'call',   fn, vars:[{ name, value, addr }] }  push a stack frame
 *   { type:'set',    fn, name, value }                   update a var in frame `fn`
 *   { type:'ret',    fn }                                pop the frame — its vars die
 *   { type:'malloc', id, size, label, addr }             a heap block appears
 *   { type:'free',   id }                                the heap block is freed
 *   { type:'point',  fn, name, to }                      var now points to `to`:
 *       { kind:'heap', id } | { kind:'stack', fn, name } | { kind:'dead' }
 *   { type:'note',   text }                              French annotation line
 *   { type:'crash',  code, message }                     💥 undefined behavior (French)
 *
 * simulate(scenario) yields each step in order and returns a summary:
 *   { crashes, leaks, finalHeap } — crashes = `code` of every crash step,
 *   leaks = heap block ids still allocated at the end, finalHeap = their count.
 */

export const CMEMORY_SCENARIOS = [
  {
    id: 'stack-lifetime',
    code: `int* compteur() {
  int n = 42;        // n vit sur la PILE de compteur()
  return &n;         // ⚠ on renvoie l'adresse d'une locale
}

int main() {
  int* ptr = compteur();  // la frame de compteur() a disparu
  printf("%d", *ptr);     // 💥 comportement indéfini
}`,
    steps: [
      { type: 'call', fn: 'main', vars: [{ name: 'ptr', value: '?', addr: '0x7ffe…a0' }] },
      { type: 'call', fn: 'compteur', vars: [{ name: 'n', value: 42, addr: '0x7ffe…7c' }] },
      { type: 'note', text: 'n vit dans la frame de compteur() — sur la pile.' },
      { type: 'point', fn: 'main', name: 'ptr', to: { kind: 'stack', fn: 'compteur', name: 'n' } },
      { type: 'ret', fn: 'compteur' },
      { type: 'point', fn: 'main', name: 'ptr', to: { kind: 'dead' } },
      { type: 'note', text: 'Le pointeur regarde une variable morte : la frame de compteur() n’existe plus.' },
      { type: 'crash', code: '*ptr', message: 'La pile a été réutilisée — valeur poubelle ou segfault ; comportement indéfini.' },
      { type: 'ret', fn: 'main' },
    ],
  },
  {
    id: 'heap-malloc',
    code: `struct point* creer() {
  struct point* p = malloc(sizeof(struct point));
  return p;          // le bloc du TAS survit au retour ✓
}

int main() {
  struct point* pt = creer();
  pt->x = 7;                  // utilisable après le retour ✓
  char* buf = malloc(64);     // … mais jamais libéré
  free(pt);                   // pt libéré : c'est VOTRE travail
}                             // 💧 buf fuit`,
    steps: [
      { type: 'call', fn: 'main', vars: [{ name: 'pt', value: '?', addr: '0x7ffe…a0' }, { name: 'buf', value: '?', addr: '0x7ffe…98' }] },
      { type: 'call', fn: 'creer', vars: [{ name: 'p', value: '?', addr: '0x7ffe…70' }] },
      { type: 'malloc', id: 'b1', size: 16, label: 'struct point', addr: '0x55aa…10' },
      { type: 'point', fn: 'creer', name: 'p', to: { kind: 'heap', id: 'b1' } },
      { type: 'ret', fn: 'creer' },
      { type: 'note', text: 'La frame de creer() disparaît, mais le BLOC SURVIT : le tas ne dépend pas des fonctions.' },
      { type: 'point', fn: 'main', name: 'pt', to: { kind: 'heap', id: 'b1' } },
      { type: 'set', fn: 'main', name: 'pt', value: 'pt->x = 7 ✓' },
      { type: 'malloc', id: 'b2', size: 64, label: 'buffer oublié', addr: '0x55aa…60' },
      { type: 'free', id: 'b1' },
      { type: 'ret', fn: 'main' },
      { type: 'note', text: 'b2 n’a jamais été free() → fuite mémoire. Chaque malloc doit avoir son free.' },
    ],
  },
  {
    id: 'use-after-free',
    code: `int main() {
  int* p = malloc(4 * sizeof(int));
  free(p);           // le bloc est rendu à l'allocateur
                     // p garde l'ANCIENNE adresse (dangling)
  *p = 1;            // 💥 use-after-free
}`,
    steps: [
      { type: 'call', fn: 'main', vars: [{ name: 'p', value: '?', addr: '0x7ffe…a0' }] },
      { type: 'malloc', id: 'b1', size: 16, label: 'int[4]', addr: '0x55aa…10' },
      { type: 'point', fn: 'main', name: 'p', to: { kind: 'heap', id: 'b1' } },
      { type: 'free', id: 'b1' },
      { type: 'point', fn: 'main', name: 'p', to: { kind: 'dead' } },
      { type: 'note', text: 'p est un dangling pointer : free() ne change pas p. Le mettre à NULL après free.' },
      { type: 'crash', code: '*p', message: 'Use-after-free — le bloc a pu être réalloué à quelqu’un d’autre ; corruption silencieuse possible.' },
      { type: 'ret', fn: 'main' },
    ],
  },
];

/** Yields each step of `scenario.steps`, returns { crashes, leaks, finalHeap }. */
export function* simulate(scenario) {
  const crashes = [];
  const live = new Set();
  for (const step of scenario.steps) {
    yield step;
    if (step.type === 'malloc') live.add(step.id);
    else if (step.type === 'free') live.delete(step.id);
    else if (step.type === 'crash') crashes.push(step.code);
  }
  const leaks = [...live];
  return { crashes, leaks, finalHeap: leaks.length };
}

/** Runs the scenario to completion and returns its summary. */
export function summaryOf(scenario) {
  const it = simulate(scenario);
  let r = it.next();
  while (!r.done) r = it.next();
  return r.value;
}

export const cMemoryScenarioById = (id) => CMEMORY_SCENARIOS.find((s) => s.id === id);
