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
];

export const quizQuestionById = (id) => QUIZ_QUESTIONS.find((q) => q.id === id);

/** Question list, optionally filtered by category. */
export const quizQuestions = (cat = 'all') =>
  cat === 'all' ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter((q) => q.cat === cat);
