/**
 * Ruby basics & quirks, as a step-by-step evaluation trace:
 *  - everything is an object (1.class, nil.class) and everything is an
 *    EXPRESSION (if returns a value, methods return their last expression);
 *  - truthiness: ONLY nil and false are falsy — 0 and "" are truthy
 *    (unlike JavaScript!);
 *  - every "string" literal allocates a NEW object (fresh object_id each
 *    time); a :symbol is interned — same object_id forever;
 *  - nil-safety: `&.` navigates without crashing, `||=` assigns only if
 *    nil/false.
 *
 * Identity and truthiness are really simulated (interning table, falsy rule);
 * plain evaluations carry their displayed value. Ops:
 *   { eval: 'code', value: 'shown result', note? }
 *   { str: '"foo"' }                       new string → fresh object_id
 *   { sym: ':foo' }                        symbol → interned object_id
 *   { if: <value>, cond: 'shown cond', then: 'log', else?: 'log' }
 *
 * Step shapes:
 *   { type:'eval',   code, value, note? }
 *   { type:'alloc',  code, kind:'string'|'symbol', objectId, reused }
 *   { type:'branch', cond, truthy }
 *   { type:'log',    value }
 * The generator returns { logs, stringIds, symbolIds }.
 */

/** Ruby's falsy rule: only nil (modelled as null) and false. */
export const truthy = (v) => v !== null && v !== false;

export function* simulate(ops) {
  const logs = [];
  const stringIds = [];
  const symbolIds = {};
  let nextStrId = 1024;
  let nextSymId = 9001;

  for (const op of ops) {
    if ('eval' in op) {
      const step = { type: 'eval', code: op.eval, value: op.value };
      if (op.note) step.note = op.note;
      yield step;
    } else if ('str' in op) {
      const objectId = nextStrId;
      nextStrId += 16;
      stringIds.push(objectId);
      yield { type: 'alloc', code: `${op.str}.object_id`, kind: 'string', objectId, reused: false };
    } else if ('sym' in op) {
      const reused = op.sym in symbolIds;
      if (!reused) { symbolIds[op.sym] = nextSymId; nextSymId += 8; }
      yield { type: 'alloc', code: `${op.sym}.object_id`, kind: 'symbol', objectId: symbolIds[op.sym], reused };
    } else if ('if' in op) {
      const isTruthy = truthy(op.if);
      yield { type: 'branch', cond: op.cond, truthy: isTruthy };
      const taken = isTruthy ? op.then : op.else;
      if (taken !== undefined) { logs.push(taken); yield { type: 'log', value: taken }; }
    }
  }

  return { logs, stringIds, symbolIds };
}

/** Run to completion and return { logs, stringIds, symbolIds }. */
export function summaryOf(ops) {
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const RUBYBASICS_SCENARIOS = [
  {
    id: 'tout-est-objet',
    code: `1.class            # => Integer — même les entiers sont des objets
"a".upcase         # => "A"
nil.class          # => NilClass — nil aussi est un objet !

x = if 3 > 2 then "oui" else "non" end
# tout est EXPRESSION : le if RENVOIE une valeur
puts x             # => oui

def carre(n)
  n * n            # pas de return : la DERNIÈRE expression est renvoyée
end
carre(4)           # => 16`,
    ops: [
      { eval: '1.class', value: 'Integer', note: 'même les entiers sont des objets' },
      { eval: '"a".upcase', value: '"A"' },
      { eval: 'nil.class', value: 'NilClass', note: 'nil aussi est un objet !' },
      { if: true, cond: '3 > 2', then: 'x = "oui"' },
      { eval: 'x', value: '"oui"', note: 'le if a RENVOYÉ une valeur' },
      { eval: 'carre(4)', value: '16', note: 'return implicite : dernière expression' },
    ],
  },
  {
    id: 'truthiness',
    code: `if 0 then puts "0 est VRAI en Ruby !" end        # ✓ s'affiche
if "" then puts '"" est VRAI aussi' end           # ✓ s'affiche
if nil then puts "jamais" else puts "nil → falsy" end
if false then puts "jamais" else puts "false → falsy" end
# Seuls nil et false sont falsy.
# (En JS : 0, "", NaN… sont falsy — d'où les surprises !)`,
    ops: [
      { if: 0, cond: 'if 0', then: '0 est VRAI en Ruby !' },
      { if: '', cond: 'if ""', then: '"" est VRAI aussi' },
      { if: null, cond: 'if nil', then: 'jamais', else: 'nil → falsy' },
      { if: false, cond: 'if false', then: 'jamais', else: 'false → falsy' },
    ],
  },
  {
    id: 'symbols',
    code: `"foo".object_id    # => 1024  (nouvel objet…)
"foo".object_id    # => 1040  (…alloué à CHAQUE fois)
:foo.object_id     # => 9001  (un symbole…)
:foo.object_id     # => 9001  (…est unique et RÉUTILISÉ)
# D'où :symbol comme clés de hash : zéro allocation.`,
    ops: [
      { str: '"foo"' },
      { str: '"foo"' },
      { sym: ':foo' },
      { sym: ':foo' },
    ],
  },
  {
    id: 'nil-safe',
    code: `user = nil
user&.name         # => nil — pas de NoMethodError (safe navigation)

prenom = nil
prenom ||= "Anna"  # nil → on affecte
prenom ||= "Bob"   # déjà défini → INCHANGÉ
prenom             # => "Anna"`,
    ops: [
      { eval: 'user = nil', value: 'nil' },
      { eval: 'user&.name', value: 'nil', note: 'pas de NoMethodError : &. court-circuite' },
      { eval: 'prenom ||= "Anna"', value: '"Anna"', note: 'prenom était nil → affecté' },
      { eval: 'prenom ||= "Bob"', value: '"Anna"', note: 'déjà défini → inchangé' },
    ],
  },
];

export const rubyBasicsScenarioById = (id) => RUBYBASICS_SCENARIOS.find((s) => s.id === id);
