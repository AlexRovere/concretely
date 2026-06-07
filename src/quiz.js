/**
 * "Predict the output" quiz — questions drawn from the topic scenarios. Every
 * correct answer is CROSS-CHECKED against the pure models in test/quiz.test.js
 * (the quiz can never disagree with the simulations it quizzes about).
 *
 * Question shape:
 *   { id, cat,                         filter category ('js'|'vue'|'swift'|…)
 *     lang, code,                      snippet shown (reuses scenario code)
 *     question: {fr, en},
 *     choices: [string | {fr, en}],    fixed order, `answer` = correct index
 *     answer: <index>,
 *     explain: {fr, en},
 *     goto: { mode, scenario } }       the tab that animates this very case
 *
 * `localize(v, locale)` resolves a bilingual value.
 */

import { scenarioById as elScenario } from './eventloop.js';
import { rubyBlocksScenarioById } from './rubyblocks.js';
import { swiftStateScenarioById } from './swiftstate.js';
import { composeScenarioById } from './compose.js';
import { cowScenarioById } from './cow.js';
import { rubyBasicsScenarioById } from './rubybasics.js';
import { rubyLazyScenarioById } from './rubylazy.js';
import { gitDagScenarioById } from './gitdag.js';
import { vdomScenarioById } from './vdom.js';
import { debounceScenarioById } from './debounce.js';
import { ktFlowScenarioById } from './ktflow.js';
import { viewModelScenarioById } from './viewmodel.js';
import { lifecycleScenarioById } from './lifecycle.js';
import { arcScenarioById } from './arc.js';
import { rubyGvlScenarioById } from './rubygvl.js';
import { vueReactivityScenarioById } from './vuereactivity.js';
import { bubblingScenarioById } from './bubbling.js';
import { swiftBasicsScenarioById } from './swiftbasics.js';

export const localize = (v, locale) =>
  typeof v === 'object' && v !== null && ('fr' in v || 'en' in v) ? (v[locale] ?? v.fr ?? v.en) : v;

export const QUIZ_QUESTIONS = [
  {
    id: 'el-basics', cat: 'js', lang: 'js',
    code: elScenario('basics').code,
    question: { fr: 'Dans quel ordre la console affiche-t-elle ?', en: 'In what order does the console log?' },
    choices: ['A, B, C, D', 'A, D, C, B', 'A, D, B, C', 'A, C, D, B'],
    answer: 1,
    explain: {
      fr: 'Le synchrone d’abord (A, D), puis TOUTES les microtâches (C), puis la macrotâche (B).',
      en: 'Sync first (A, D), then ALL microtasks (C), then the macrotask (B).',
    },
    goto: { mode: 'eventloop', scenario: 'basics' },
  },
  {
    id: 'el-chained', cat: 'js', lang: 'js',
    code: elScenario('chained').code,
    question: { fr: 'Et ici, quel ordre ?', en: 'And here, what order?' },
    choices: ['1, 5, 3, 4, 2', '1, 2, 3, 4, 5', '1, 5, 3, 2, 4', '1, 3, 4, 5, 2'],
    answer: 0,
    explain: {
      fr: 'Les .then chaînés sont des microtâches successives : 3 puis 4 passent AVANT le setTimeout (2).',
      en: 'Chained .then are successive microtasks: 3 then 4 run BEFORE the setTimeout (2).',
    },
    goto: { mode: 'eventloop', scenario: 'chained' },
  },
  {
    id: 'vy-computed', cat: 'vue', lang: 'js',
    code: vueReactivityScenarioById('computed-cache').code,
    question: { fr: 'Combien de fois le computed est-il réellement CALCULÉ ?', en: 'How many times is the computed actually COMPUTED?' },
    choices: ['3', '2', '1', '4'],
    answer: 1,
    explain: {
      fr: '1ʳᵉ lecture → calcul ; 2ᵉ → cache ; l’écriture le marque juste dirty ; 3ᵉ lecture → recalcul. Total : 2.',
      en: '1st read → compute; 2nd → cache; the write only marks dirty; 3rd read → recompute. Total: 2.',
    },
    goto: { mode: 'vuereactivity', scenario: 'computed-cache' },
  },
  {
    id: 'vd-unkeyed', cat: 'vue', lang: 'js',
    code: vdomScenarioById('prepend-unkeyed').code,
    question: { fr: 'Sans :key, quel travail DOM pour passer de [B, C] à [A, B, C] ?', en: 'Without :key, what DOM work to go from [B, C] to [A, B, C]?' },
    choices: [
      { fr: '1 insertion seulement', en: '1 insert only' },
      { fr: '2 patchs + 1 insertion', en: '2 patches + 1 insert' },
      { fr: '3 nœuds conservés', en: '3 nodes kept' },
      { fr: 'tout est détruit et recréé', en: 'everything destroyed and rebuilt' },
    ],
    answer: 1,
    explain: {
      fr: 'Comparé PAR POSITION : B→A patché, C→B patché, C inséré. Avec :key : 1 seule insertion.',
      en: 'Compared BY POSITION: B→A patched, C→B patched, C inserted. With :key: a single insert.',
    },
    goto: { mode: 'vdom', scenario: 'prepend-unkeyed' },
  },
  {
    id: 'bb-order', cat: 'vue', lang: 'js',
    code: bubblingScenarioById('trois-phases').code,
    question: { fr: 'Dans quel ordre f, g et h se déclenchent-ils ?', en: 'In what order do f, g and h fire?' },
    choices: ['g, f, h', 'f, g, h', 'h, g, f', 'f, h, g'],
    answer: 1,
    explain: {
      fr: 'Capture descend d’abord (f), puis la cible (g), puis le bubble remonte (h).',
      en: 'Capture walks down first (f), then the target (g), then bubble walks up (h).',
    },
    goto: { mode: 'bubbling', scenario: 'trois-phases' },
  },
  {
    id: 'db-count', cat: 'vue', lang: 'js',
    code: debounceScenarioById('recherche').code,
    question: { fr: '6 événements en 3 rafales : combien d’appels via debounce ?', en: '6 events in 3 bursts: how many calls through debounce?' },
    choices: ['6', '3', '1', '0'],
    answer: 1,
    explain: {
      fr: 'Debounce attend le silence : UN appel par rafale, à la fin. (Throttle : 3 aussi ici, mais au DÉBUT de chaque fenêtre.)',
      en: 'Debounce waits for silence: ONE call per burst, at the end. (Throttle: also 3 here, but at the START of each window.)',
    },
    goto: { mode: 'debounce', scenario: 'recherche' },
  },
  {
    id: 'ss-observed', cat: 'swift', lang: 'swift',
    code: swiftStateScenarioById('observed-reset').code,
    question: { fr: '2 taps sur +1, puis le parent re-render. Le Text affiche ?', en: '2 taps on +1, then the parent re-renders. The Text shows?' },
    choices: ['2', '1', '0', { fr: 'crash', en: 'crash' }],
    answer: 2,
    explain: {
      fr: 'CounterVM() est recréé à CHAQUE body du parent : @ObservedObject perd tout. @StateObject aurait gardé 2.',
      en: 'CounterVM() is recreated on EVERY parent body: @ObservedObject loses everything. @StateObject would have kept 2.',
    },
    goto: { mode: 'swiftstate', scenario: 'observed-reset' },
  },
  {
    id: 'cw-struct', cat: 'swift', lang: 'swift',
    code: cowScenarioById('struct-vs-class').code,
    question: { fr: 'Après s2.x = 99, que vaut s1.x ?', en: 'After s2.x = 99, what is s1.x?' },
    choices: ['99', '1', '0', { fr: 'indéfini', en: 'undefined' }],
    answer: 1,
    explain: {
      fr: 'Une struct est COPIÉE à l’affectation : s2 est indépendante. (c1.x, lui, vaut bien 99 — référence partagée.)',
      en: 'A struct is COPIED on assignment: s2 is independent. (c1.x however IS 99 — shared reference.)',
    },
    goto: { mode: 'cow', scenario: 'struct-vs-class' },
  },
  {
    id: 'arc-cycle', cat: 'swift', lang: 'swift',
    code: arcScenarioById('cycle-leak').code,
    question: { fr: 'Après p = nil et a = nil, que deviennent les deux objets ?', en: 'After p = nil and a = nil, what happens to the two objects?' },
    choices: [
      { fr: 'les deux sont libérés (deinit)', en: 'both are freed (deinit)' },
      { fr: 'fuite : rc = 1 chacun, inaccessibles', en: 'leak: rc = 1 each, unreachable' },
      { fr: 'seul Person est libéré', en: 'only Person is freed' },
      { fr: 'crash à l’exécution', en: 'runtime crash' },
    ],
    answer: 1,
    explain: {
      fr: 'Ils se retiennent fortement l’un l’autre : rc ne tombe jamais à 0. `weak var tenant` casse le cycle.',
      en: 'They strongly retain each other: rc never reaches 0. `weak var tenant` breaks the cycle.',
    },
    goto: { mode: 'arc', scenario: 'cycle-leak' },
  },
  {
    id: 'rbk-proc', cat: 'ruby', lang: 'ruby',
    code: rubyBlocksScenarioById('proc-return').code,
    question: { fr: 'Qu’affiche demo_proc ?', en: 'What does demo_proc print?' },
    choices: [
      { fr: '"dans le proc" puis "après le call"', en: '"dans le proc" then "après le call"' },
      { fr: 'seulement "dans le proc"', en: 'only "dans le proc"' },
      { fr: 'seulement "après le call"', en: 'only "après le call"' },
      { fr: 'rien — erreur', en: 'nothing — error' },
    ],
    answer: 1,
    explain: {
      fr: 'Le return d’un PROC sort de la méthode englobante : le puts d’après ne s’exécute jamais. Une lambda aurait continué.',
      en: 'A PROC’s return exits the enclosing method: the next puts never runs. A lambda would have continued.',
    },
    goto: { mode: 'rubyblocks', scenario: 'proc-return' },
  },
  {
    id: 'rb-truthy', cat: 'ruby', lang: 'ruby',
    code: `if 0
  puts "le bloc s'exécute"
else
  puts "le bloc est sauté"
end`,
    question: { fr: 'En Ruby, que fait `if 0` ?', en: 'In Ruby, what does `if 0` do?' },
    choices: [
      { fr: 'le bloc s’exécute — 0 est truthy', en: 'the block runs — 0 is truthy' },
      { fr: 'le bloc est sauté — 0 est falsy', en: 'the block is skipped — 0 is falsy' },
    ],
    answer: 0,
    explain: {
      fr: 'Seuls nil et false sont falsy en Ruby. 0, "" et [] sont tous truthy — contrairement à JavaScript !',
      en: 'Only nil and false are falsy in Ruby. 0, "" and [] are all truthy — unlike JavaScript!',
    },
    goto: { mode: 'rubybasics', scenario: 'truthiness' },
  },
  {
    id: 'rz-lazy', cat: 'ruby', lang: 'ruby',
    code: rubyLazyScenarioById('lazy').code,
    question: { fr: 'Combien d’appels de bloc avec .lazy (au lieu de 20 en eager) ?', en: 'How many block calls with .lazy (instead of 20 eager)?' },
    choices: ['20', '8', '2', '10'],
    answer: 1,
    explain: {
      fr: 'Les éléments coulent un à un : 1, 2, 3, 4 traversent map+select (8 appels) puis first(2) est satisfait — stop.',
      en: 'Elements flow one at a time: 1, 2, 3, 4 cross map+select (8 calls), then first(2) is satisfied — stop.',
    },
    goto: { mode: 'rubylazy', scenario: 'lazy' },
  },
  {
    id: 'rg-gvl', cat: 'ruby', lang: 'ruby',
    code: rubyGvlScenarioById('cpu-bound').code,
    question: { fr: '2 threads CPU de 3 ticks, 2 cœurs : durée totale ?', en: '2 CPU threads of 3 ticks, 2 cores: total time?' },
    choices: [
      { fr: '~3 ticks (parallèle)', en: '~3 ticks (parallel)' },
      { fr: '6 ticks (sérialisé par le GVL)', en: '6 ticks (serialized by the GVL)' },
      { fr: '12 ticks', en: '12 ticks' },
      { fr: '2 ticks', en: '2 ticks' },
    ],
    answer: 1,
    explain: {
      fr: 'Le GVL ne laisse qu’UN thread exécuter du Ruby à la fois : aucun gain malgré 2 cœurs. (L’I/O, elle, se recouvre.)',
      en: 'The GVL lets only ONE thread run Ruby at a time: zero speedup despite 2 cores. (I/O does overlap.)',
    },
    goto: { mode: 'rubygvl', scenario: 'cpu-bound' },
  },
  {
    id: 'cp-noremember', cat: 'kotlin', lang: 'kotlin',
    code: composeScenarioById('no-remember').code,
    question: { fr: 'Après 2 clics, le Text affiche ?', en: 'After 2 taps, the Text shows?' },
    choices: ['2', '1', '0', { fr: 'ne compile pas', en: 'does not compile' }],
    answer: 2,
    explain: {
      fr: 'Sans remember, l’état est reconstruit à 0 par chaque recomposition — que le clic lui-même déclenche.',
      en: 'Without remember, the state is rebuilt at 0 by every recomposition — which the tap itself triggers.',
    },
    goto: { mode: 'compose', scenario: 'no-remember' },
  },
  {
    id: 'kf-late', cat: 'kotlin', lang: 'kotlin',
    code: ktFlowScenarioById('stateflow').code,
    question: { fr: 'B se met à collecter après l’émission de 2. Il reçoit ?', en: 'B starts collecting after 2 was emitted. It receives?' },
    choices: ['[0, 1, 2, 3]', '[2, 3]', '[3]', { fr: 'rien', en: 'nothing' }],
    answer: 1,
    explain: {
      fr: 'Un StateFlow REJOUE sa dernière valeur (2) à tout nouveau collecteur, puis partage la suite (3).',
      en: 'A StateFlow REPLAYS its latest value (2) to any new collector, then shares what follows (3).',
    },
    goto: { mode: 'ktflow', scenario: 'stateflow' },
  },
  {
    id: 'vm-rotation', cat: 'kotlin', lang: 'kotlin',
    code: viewModelScenarioById('rotation-bug').code,
    question: { fr: '2 clics (count = 2), puis rotation. count vaut ?', en: '2 taps (count = 2), then rotation. count is?' },
    choices: ['2', { fr: '0 — perdu, l’Activity est recréée', en: '0 — lost, the Activity is recreated' }, { fr: 'crash', en: 'crash' }, { fr: '2, mais 0 au prochain démarrage', en: '2, but 0 on next launch' }],
    answer: 1,
    explain: {
      fr: 'La rotation détruit l’Activity : tout champ simple repart de zéro. ViewModel ou SavedStateHandle pour survivre.',
      en: 'Rotation destroys the Activity: any plain field starts over. Use ViewModel or SavedStateHandle to survive.',
    },
    goto: { mode: 'viewmodel', scenario: 'rotation-bug' },
  },
  {
    id: 'lc-home', cat: 'kotlin', lang: 'kotlin',
    code: lifecycleScenarioById('home-return').code,
    question: { fr: 'Bouton Home : onDestroy est-il appelé ?', en: 'Home button: is onDestroy called?' },
    choices: [
      { fr: 'oui — comme la rotation', en: 'yes — like rotation' },
      { fr: 'non — juste onPause puis onStop', en: 'no — just onPause then onStop' },
    ],
    answer: 1,
    explain: {
      fr: 'Home met l’app en arrière-plan : l’instance survit (onRestart au retour). La rotation, elle, détruit vraiment.',
      en: 'Home backgrounds the app: the instance survives (onRestart on return). Rotation really destroys it.',
    },
    goto: { mode: 'lifecycle', scenario: 'home-return' },
  },
  {
    id: 'gd-rebase', cat: 'git', lang: 'ruby',
    code: gitDagScenarioById('rebase').code,
    question: { fr: 'Après le rebase, feature pointe sur…', en: 'After the rebase, feature points to…' },
    choices: [
      { fr: 'C3 — le même commit', en: 'C3 — the same commit' },
      { fr: "C3' — un NOUVEAU commit", en: "C3' — a NEW commit" },
      { fr: 'C4', en: 'C4' },
      { fr: 'un commit de merge', en: 'a merge commit' },
    ],
    answer: 1,
    explain: {
      fr: 'Le rebase REJOUE le commit : nouvel id, ancien orphelin. C’est pour ça qu’on ne rebase pas une branche partagée.',
      en: 'Rebase REPLAYS the commit: new id, old one orphaned. That is why you never rebase a shared branch.',
    },
    goto: { mode: 'gitdag', scenario: 'rebase' },
  },
  {
    id: 'jb-nontransitif', cat: 'js', lang: 'js',
    code: `0 == ''      // true
0 == '0'     // true
'' == '0'    // … ?`,
    question: { fr: 'Si 0 == \'\' et 0 == \'0\' sont true, que vaut \'\' == \'0\' ?', en: "If 0 == '' and 0 == '0' are true, what is '' == '0'?" },
    choices: ['true', 'false'],
    answer: 1,
    explain: {
      fr: 'false ! Chaque == coerce différemment — l’égalité lâche n’est même pas transitive. D’où la règle : ===.',
      en: 'false! Each == coerces differently — loose equality is not even transitive. Hence the rule: ===.',
    },
    goto: { mode: 'jsbasics', scenario: 'egalite' },
  },
  {
    id: 'jb-typeof', cat: 'js', lang: 'js',
    code: `typeof null`,
    question: { fr: 'Que renvoie typeof null ?', en: 'What does typeof null return?' },
    choices: ['"null"', '"object"', '"undefined"', { fr: 'une erreur', en: 'an error' }],
    answer: 1,
    explain: {
      fr: '"object" — un bug de 1995 jamais corrigé pour ne pas casser le web. Utilise x === null.',
      en: '"object" — a 1995 bug never fixed to avoid breaking the web. Use x === null.',
    },
    goto: { mode: 'jsbasics', scenario: 'nombres' },
  },
  {
    id: 'jb-truthy-array', cat: 'js', lang: 'js',
    code: `if ([]) console.log('exécuté')
console.log([] == false)`,
    question: { fr: 'Que se passe-t-il avec le tableau vide [] ?', en: 'What happens with the empty array []?' },
    choices: [
      { fr: 'le if est sauté, et [] == false vaut true', en: 'the if is skipped, and [] == false is true' },
      { fr: 'le if s’exécute, et [] == false vaut true 🤯', en: 'the if runs, and [] == false is true 🤯' },
      { fr: 'le if s’exécute, et [] == false vaut false', en: 'the if runs, and [] == false is false' },
      { fr: 'le if est sauté, et [] == false vaut false', en: 'the if is skipped, and [] == false is false' },
    ],
    answer: 1,
    explain: {
      fr: '[] est truthy (c’est un objet) MAIS [] == false est true ([] → \'\' → 0). Truthiness et coercion == sont deux mécanismes différents.',
      en: "[] is truthy (it's an object) BUT [] == false is true ([] → '' → 0). Truthiness and == coercion are two different mechanisms.",
    },
    goto: { mode: 'jsbasics', scenario: 'truthiness-js' },
  },
  {
    id: 'jb-hoisting', cat: 'js', lang: 'js',
    code: `console.log(a)
var a = 1`,
    question: { fr: 'Qu’affiche ce code ?', en: 'What does this code print?' },
    choices: ['undefined', '1', 'ReferenceError', 'null'],
    answer: 0,
    explain: {
      fr: 'var est hissée et initialisée à undefined — avec let, ce serait une ReferenceError (TDZ).',
      en: 'var is hoisted and initialized to undefined — with let it would be a ReferenceError (TDZ).',
    },
    goto: { mode: 'jsbasics', scenario: 'hoisting' },
  },
  {
    id: 'sb-if0', cat: 'swift', lang: 'swift',
    code: `if 0 {
    print("…")
}`,
    question: { fr: 'Que fait `if 0` en Swift ?', en: 'What does `if 0` do in Swift?' },
    choices: [
      { fr: 'le bloc s’exécute (0 est truthy)', en: 'the block runs (0 is truthy)' },
      { fr: 'le bloc est sauté (0 est falsy)', en: 'the block is skipped (0 is falsy)' },
      { fr: '❌ ça ne compile pas', en: '❌ it does not compile' },
      { fr: 'crash à l’exécution', en: 'runtime crash' },
    ],
    answer: 2,
    explain: {
      fr: 'Swift n’a AUCUNE truthiness : if exige un Bool. Le compilateur refuse Int, String, Optional…',
      en: 'Swift has ZERO truthiness: if requires a Bool. The compiler rejects Int, String, Optional…',
    },
    goto: { mode: 'swiftbasics', scenario: 'pas-de-truthiness' },
  },
  {
    id: 'sb-defer', cat: 'swift', lang: 'swift',
    code: swiftBasicsScenarioById('defer').code,
    question: { fr: 'Dans quel ordre les prints sortent-ils ?', en: 'In what order do the prints come out?' },
    choices: [
      'ouverture, defer A, defer B, travail',
      'ouverture, travail, defer A, defer B',
      'ouverture, travail, defer B, defer A',
      'defer A, defer B, ouverture, travail',
    ],
    answer: 2,
    explain: {
      fr: 'Les defer partent à la SORTIE du scope, en ordre INVERSE de déclaration (LIFO) : B puis A.',
      en: 'defer blocks run at scope EXIT, in REVERSE declaration order (LIFO): B then A.',
    },
    goto: { mode: 'swiftbasics', scenario: 'defer' },
  },
  {
    id: 'sb-force', cat: 'swift', lang: 'swift',
    code: `var name: String? = nil
name!`,
    question: { fr: 'Que fait `name!` sur un Optional nil ?', en: 'What does `name!` do on a nil Optional?' },
    choices: [
      { fr: 'renvoie nil', en: 'returns nil' },
      { fr: 'renvoie ""', en: 'returns ""' },
      { fr: '💥 crash (fatal error)', en: '💥 crash (fatal error)' },
      { fr: '❌ ne compile pas', en: '❌ does not compile' },
    ],
    answer: 2,
    explain: {
      fr: 'Le force unwrap compile… et crashe à l’exécution sur nil. Préfère ?., ?? ou if let.',
      en: 'Force unwrap compiles… and crashes at runtime on nil. Prefer ?., ?? or if let.',
    },
    goto: { mode: 'swiftbasics', scenario: 'optionals' },
  },
  {
    id: 'kb-equality', cat: 'kotlin', lang: 'kotlin',
    code: `data class User(val id: Int)
val a = User(1)
val b = User(1)
a == b   // … ?`,
    question: { fr: 'Deux instances distinctes de User(1) : que vaut a == b ?', en: 'Two distinct User(1) instances: what is a == b?' },
    choices: [
      { fr: 'true — == est STRUCTURELLE en Kotlin', en: 'true — == is STRUCTURAL in Kotlin' },
      { fr: 'false — deux objets distincts', en: 'false — two distinct objects' },
    ],
    answer: 0,
    explain: {
      fr: 'En Kotlin == appelle equals() (généré par la data class) : true. C’est === qui compare les références (false ici) — l’inverse du piège Java.',
      en: 'In Kotlin == calls equals() (generated by the data class): true. === compares references (false here) — the inverse of the Java trap.',
    },
    goto: { mode: 'kotlinbasics', scenario: 'equality' },
  },
  {
    id: 'kb-bangbang', cat: 'kotlin', lang: 'kotlin',
    code: `var name: String? = null
name!!.length`,
    question: { fr: 'Que fait `name!!` sur un null ?', en: 'What does `name!!` do on a null?' },
    choices: [
      { fr: 'renvoie null', en: 'returns null' },
      { fr: '💥 NullPointerException', en: '💥 NullPointerException' },
      { fr: '❌ ne compile pas', en: '❌ does not compile' },
      { fr: 'renvoie 0', en: 'returns 0' },
    ],
    answer: 1,
    explain: {
      fr: '!! troque la garantie compile-time contre un NPE assumé. Le combo idiomatique : ?. avec ?: en repli.',
      en: '!! trades the compile-time guarantee for a deliberate NPE. The idiomatic combo: ?. with ?: as fallback.',
    },
    goto: { mode: 'kotlinbasics', scenario: 'null-safety' },
  },
  {
    id: 'rb-symbols', cat: 'ruby', lang: 'ruby',
    code: `"foo".object_id
"foo".object_id   // même id ?
:foo.object_id
:foo.object_id    // même id ?`,
    question: { fr: 'Mêmes object_id pour les strings ? Pour les symboles ?', en: 'Same object_ids for the strings? For the symbols?' },
    choices: [
      { fr: 'strings : mêmes ids · symboles : mêmes ids', en: 'strings: same ids · symbols: same ids' },
      { fr: 'strings : ids différents · symboles : même id', en: 'strings: different ids · symbols: same id' },
      { fr: 'strings : mêmes ids · symboles : ids différents', en: 'strings: same ids · symbols: different ids' },
      { fr: 'tout est différent', en: 'all different' },
    ],
    answer: 1,
    explain: {
      fr: 'Chaque littéral "foo" alloue un NOUVEL objet ; :foo est interné une fois pour toutes — d’où les symboles comme clés de hash.',
      en: 'Every "foo" literal allocates a NEW object; :foo is interned once and forever — hence symbols as hash keys.',
    },
    goto: { mode: 'rubybasics', scenario: 'symbols' },
  },
  {
    id: 'ts-erasure', cat: 'ts', lang: 'js',
    code: `interface User { name: string }
const u: User = { name: 'Ada' }
if (u instanceof User) { … }   // … ?`,
    question: { fr: 'Que fait `u instanceof User` quand User est une interface ?', en: 'What does `u instanceof User` do when User is an interface?' },
    choices: [
      { fr: 'true — u implémente User', en: 'true — u implements User' },
      { fr: 'false', en: 'false' },
      { fr: '❌ ça ne compile pas — les interfaces sont EFFACÉES', en: '❌ it does not compile — interfaces are ERASED' },
      { fr: '💥 crash à l\'exécution', en: '💥 runtime crash' },
    ],
    answer: 2,
    explain: {
      fr: 'Les types n\'existent qu\'à la compilation : à l\'exécution, User a disparu. Pour tester une forme, écris un type guard (`"name" in u`).',
      en: 'Types only exist at compile time: at runtime, User is gone. To test a shape, write a type guard (`"name" in u`).',
    },
    goto: { mode: 'tsbasics', scenario: 'erasure' },
  },
  {
    id: 'ts-excess', cat: 'ts', lang: 'js',
    code: `interface Point { x: number; y: number }
function salue(p: Point) { … }

salue({ x: 1, y: 2, z: 3 })   // … ?
const p = { x: 1, y: 2, z: 3 }
salue(p)                      // … ?`,
    question: { fr: 'Littéral direct vs variable : lesquels compilent ?', en: 'Direct literal vs variable: which ones compile?' },
    choices: [
      { fr: 'les deux compilent', en: 'both compile' },
      { fr: 'aucun ne compile (z est en trop)', en: 'neither compiles (z is extra)' },
      { fr: 'le littéral est refusé, la variable passe', en: 'the literal is rejected, the variable passes' },
      { fr: 'le littéral passe, la variable est refusée', en: 'the literal passes, the variable is rejected' },
    ],
    answer: 2,
    explain: {
      fr: 'Un LITTÉRAL direct subit l\'excess-property check (z refusé). Via une variable, le typage structurel accepte : p a au moins x et y.',
      en: 'A direct LITERAL gets the excess-property check (z rejected). Through a variable, structural typing accepts: p has at least x and y.',
    },
    goto: { mode: 'tsbasics', scenario: 'structural' },
  },
  {
    id: 'ts-any', cat: 'ts', lang: 'js',
    code: `const nimporte: any = 42
nimporte.toUpperCase()   // … ?`,
    question: { fr: 'Que fait `.toUpperCase()` sur un `any` qui contient 42 ?', en: 'What does `.toUpperCase()` do on an `any` holding 42?' },
    choices: [
      { fr: '❌ ne compile pas', en: '❌ does not compile' },
      { fr: '💥 compile… et TypeError à l\'exécution', en: '💥 compiles… then TypeError at runtime' },
      { fr: 'renvoie "42"', en: 'returns "42"' },
      { fr: 'renvoie undefined', en: 'returns undefined' },
    ],
    answer: 1,
    explain: {
      fr: 'any désactive TOUTE vérification : le compilateur laisse passer, le runtime crashe. unknown, lui, aurait refusé de compiler sans narrowing.',
      en: 'any turns off ALL checking: the compiler lets it through, the runtime crashes. unknown would have refused to compile without narrowing.',
    },
    goto: { mode: 'tsbasics', scenario: 'any-unknown' },
  },
  {
    id: 'go-nilmap', cat: 'go', lang: 'go',
    code: `var m map[string]int
fmt.Println(m["go"])   // … ?
m["go"] = 1            // … ?`,
    question: { fr: 'Lire puis écrire dans une map nil : que se passe-t-il ?', en: 'Reading then writing a nil map: what happens?' },
    choices: [
      { fr: 'lecture : 0 · écriture : 💥 panic', en: 'read: 0 · write: 💥 panic' },
      { fr: 'les deux paniquent', en: 'both panic' },
      { fr: 'les deux marchent (map auto-créée)', en: 'both work (map auto-created)' },
      { fr: '❌ ne compile pas', en: '❌ does not compile' },
    ],
    answer: 0,
    explain: {
      fr: 'Lire une map nil renvoie la zero value (0) — mais y ÉCRIRE panique. Il faut make(map[string]int) d\'abord.',
      en: 'Reading a nil map returns the zero value (0) — but WRITING to it panics. You need make(map[string]int) first.',
    },
    goto: { mode: 'gobasics', scenario: 'zero-values' },
  },
  {
    id: 'go-slice', cat: 'go', lang: 'go',
    code: `a := []int{1, 2, 3}
b := a[:2]
b[0] = 99
fmt.Println(a[0])   // … ?`,
    question: { fr: 'Après b[0] = 99, que vaut a[0] ?', en: 'After b[0] = 99, what is a[0]?' },
    choices: ['1', '99', '0', { fr: '💥 panic', en: '💥 panic' }],
    answer: 1,
    explain: {
      fr: 'Un slicing ne copie RIEN : a et b partagent le même backing array. Pour une vraie copie : copy(dst, src).',
      en: 'Slicing copies NOTHING: a and b share the same backing array. For a real copy: copy(dst, src).',
    },
    goto: { mode: 'gobasics', scenario: 'slices' },
  },
  {
    id: 'go-defer', cat: 'go', lang: 'go',
    code: `fmt.Println("ouverture")
defer fmt.Println("defer A")
defer fmt.Println("defer B")
fmt.Println("travail")`,
    question: { fr: 'Dans quel ordre les lignes sortent-elles ?', en: 'In what order do the lines come out?' },
    choices: [
      'ouverture, defer A, defer B, travail',
      'ouverture, travail, defer A, defer B',
      'ouverture, travail, defer B, defer A',
      'defer A, defer B, ouverture, travail',
    ],
    answer: 2,
    explain: {
      fr: 'Les defer partent à la sortie de la fonction, en ordre INVERSE (LIFO) : B puis A — exactement comme en Swift.',
      en: 'defer calls run at function exit, in REVERSE order (LIFO): B then A — exactly like Swift.',
    },
    goto: { mode: 'gobasics', scenario: 'defer' },
  },
  {
    id: 'rust-move', cat: 'rust', lang: 'rust',
    code: `let s = String::from("salut");
let t = s;
println!("{}", s);   // … ?`,
    question: { fr: 'Utiliser s après `let t = s` : que se passe-t-il ?', en: 'Using s after `let t = s`: what happens?' },
    choices: [
      { fr: 'affiche "salut" — s et t pointent dessus', en: 'prints "salut" — s and t both point to it' },
      { fr: '❌ erreur de COMPILATION — s a été déplacée', en: '❌ COMPILE error — s was moved' },
      { fr: '💥 panique à l\'exécution', en: '💥 runtime panic' },
      { fr: 'affiche une chaîne vide', en: 'prints an empty string' },
    ],
    answer: 1,
    explain: {
      fr: 'L\'affectation DÉPLACE la String (un seul propriétaire). Le borrow checker refuse "value borrowed here after move". Un i32, lui, serait copié.',
      en: 'Assignment MOVES the String (single owner). The borrow checker refuses: "value borrowed here after move". An i32 would be copied instead.',
    },
    goto: { mode: 'rustbasics', scenario: 'ownership' },
  },
  {
    id: 'rust-unwrap', cat: 'rust', lang: 'rust',
    code: `let rien: Option<i32> = None;
rien.unwrap();   // … ?`,
    question: { fr: 'Que fait `.unwrap()` sur None ?', en: 'What does `.unwrap()` do on None?' },
    choices: [
      { fr: 'renvoie 0', en: 'returns 0' },
      { fr: 'renvoie null', en: 'returns null' },
      { fr: '❌ ne compile pas', en: '❌ does not compile' },
      { fr: '💥 panic à l\'exécution', en: '💥 runtime panic' },
    ],
    answer: 3,
    explain: {
      fr: 'unwrap est le pari Rust : ça compile, mais None → panic. Préfère unwrap_or, match ou l\'opérateur ?.',
      en: 'unwrap is the Rust bet: it compiles, but None → panic. Prefer unwrap_or, match or the ? operator.',
    },
    goto: { mode: 'rustbasics', scenario: 'no-null' },
  },
  {
    id: 'rust-mut', cat: 'rust', lang: 'rust',
    code: `let x = 5;
x = 6;           // … ?
let x = x + 1;   // … ?`,
    question: { fr: '`x = 6` puis `let x = x + 1` : que dit le compilateur ?', en: '`x = 6` then `let x = x + 1`: what does the compiler say?' },
    choices: [
      { fr: 'les deux passent', en: 'both pass' },
      { fr: 'x = 6 refusé (immuable) · let x = x + 1 OK (shadowing)', en: 'x = 6 rejected (immutable) · let x = x + 1 OK (shadowing)' },
      { fr: 'les deux sont refusés', en: 'both rejected' },
      { fr: 'x = 6 OK · le shadowing est interdit', en: 'x = 6 OK · shadowing is forbidden' },
    ],
    answer: 1,
    explain: {
      fr: 'Sans mut, réaffecter est une erreur ("cannot assign twice"). Mais RE-DÉCLARER avec let (shadowing) est idiomatique.',
      en: 'Without mut, reassigning is an error ("cannot assign twice"). But RE-DECLARING with let (shadowing) is idiomatic.',
    },
    goto: { mode: 'rustbasics', scenario: 'mutability' },
  },
  {
    id: 'gen-bst', cat: 'general', lang: 'js',
    code: `//        50
//      /    \\
//    30      70
//   /  \\    /  \\
//  20   40 60   80
// Quel parcours sort 20, 30, 40, 50, 60, 70, 80 ?`,
    question: { fr: 'Quel parcours d’un arbre binaire de recherche donne les valeurs TRIÉES ?', en: 'Which binary-search-tree traversal yields the values SORTED?' },
    choices: [
      { fr: 'in-order (infixe : gauche, nœud, droite)', en: 'in-order (left, node, right)' },
      { fr: 'pre-order (préfixe)', en: 'pre-order' },
      { fr: 'post-order (suffixe)', en: 'post-order' },
      { fr: 'BFS (par niveaux)', en: 'BFS (level order)' },
    ],
    answer: 0,
    explain: {
      fr: 'L’invariant gauche < nœud < droite fait du parcours infixe un tri gratuit — c’est LA propriété de l’ABR.',
      en: 'The left < node < right invariant makes the in-order walk a free sort — THE defining BST property.',
    },
    goto: { mode: 'bst', scenario: 'in' },
  },
  {
    id: 'gen-bogo', cat: 'general', lang: 'js',
    code: `function bogosort(a) {
  while (!estTrie(a)) {
    melanger(a)        // au hasard, et on re-vérifie…
  }
}`,
    question: { fr: 'Complexité moyenne du bogosort ?', en: 'Average complexity of bogosort?' },
    choices: ['O(n log n)', 'O(n²)', 'O(n × n!)', 'O(2ⁿ)'],
    answer: 2,
    explain: {
      fr: 'n! permutations possibles, ~une seule triée : en moyenne O(n × n!) — et le pire cas ne termine jamais. Correct ≠ utilisable.',
      en: 'n! possible permutations, ~one sorted: O(n × n!) on average — and the worst case never ends. Correct ≠ usable.',
    },
    goto: { mode: 'sorting', scenario: 'bogo' },
  },
];

export const quizQuestionById = (id) => QUIZ_QUESTIONS.find((q) => q.id === id);

/** Question list, optionally filtered by category. */
export const quizQuestions = (cat = 'all') =>
  cat === 'all' ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter((q) => q.cat === cat);
