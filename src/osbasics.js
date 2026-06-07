/**
 * OS concepts, as an evaluation trace (shared evaltrace engine):
 *  - processes vs threads: isolated memory (fork, copy-on-write, exec) vs
 *    shared memory of one process (data races, mutexes);
 *  - deadlock: two locks taken in opposite orders — the Coffman conditions,
 *    fixed by a global lock ordering (or timeouts / try_lock);
 *  - virtual memory: page tables, TLB hits, page faults, overcommit and the
 *    OOM killer, shared physical pages (shared libs, CoW, mmap);
 *  - signals: SIGTERM vs SIGKILL, SIGINT/SIGTSTP from the terminal,
 *    SIGSEGV from the kernel, and trap handlers in shell scripts.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const OSBASICS_SCENARIOS = [
  {
    id: 'processus-threads',
    code: `pid = fork()        # 1 processus → 2 (le fils est une COPIE)
exec('ls')          # remplace le programme — fork + exec = le shell
# processus : mémoire ISOLÉE → un crash reste local
# threads   : mémoire PARTAGÉE → rapide… et data races
# un thread segfault ? TOUT le processus tombe`,
    ops: [
      { eval: 'fork()', value: '2 processus', note: 'le fils est une COPIE — copy-on-write : les pages ne sont dupliquées qu\'à l\'écriture' },
      { eval: 'mémoire', value: 'processus : ISOLÉE — threads : PARTAGÉE (même processus)', note: 'la mémoire partagée des threads est la source des data races' },
      { eval: 'exec()', value: 'remplace le programme du processus', note: 'fork + exec = comment le shell lance tout' },
      { branch: 'un thread plante (segfault) — les autres survivent ?', taken: false, else: 'non — tout le processus tombe ; des processus isolés, eux, survivent' },
      { eval: 'communication', value: 'processus : pipes/sockets — threads : mémoire (+ mutex)', note: 'l\'isolation se paie en communication, le partage en synchronisation' },
    ],
  },
  {
    id: 'deadlock',
    code: `# les philosophes : 2 verrous (A, B), 2 threads, ordres opposés
T1: lock(A); lock(B)   # T1 prend A puis veut B
T2: lock(B); lock(A)   # T2 prend B puis veut A
# T1 tient A et attend B — T2 tient B et attend A → 💀
# le fix : un ORDRE GLOBAL — toujours A puis B`,
    ops: [
      { log: 'T1 prend le verrou A ✓' },
      { log: 'T2 prend le verrou B ✓' },
      { log: 'T1 attend B…' },
      { log: 'T2 attend A…' },
      { crash: 'T1 ⇄ T2', message: 'interblocage (deadlock) : chacun attend l\'autre, pour toujours — les 4 conditions de Coffman sont réunies' },
      { eval: 'ordre global : toujours A puis B', value: 'plus de cycle possible', note: 'casser l\'attente circulaire suffit' },
      { log: 'alternative défensive : timeout ou try_lock — on échoue proprement au lieu d\'attendre à jamais' },
    ],
  },
  {
    id: 'pagination',
    code: `# chaque processus voit un espace d'adressage VIRTUEL continu
adresse virtuelle ──table des pages──▶ RAM physique
accès 0x7f3a…       # page présente → TLB, ~1 cycle
accès (page absente) # 💥 page fault → le noyau charge, puis REPREND
malloc(1 To)         # réussit ?! — l'overcommit de Linux`,
    ops: [
      { eval: 'espace d\'adressage', value: 'VIRTUEL et continu pour chaque processus', note: 'la table des pages traduit chaque adresse virtuelle vers la RAM physique' },
      { eval: 'accès 0x7f3a… (page présente)', value: 'traduction TLB, ~1 cycle', note: 'le TLB cache les traductions' },
      { eval: 'accès (page absente)', value: 'page fault', note: 'le noyau charge la page depuis le disque (swap/fichier), met à jour la table, et REPREND l\'instruction — transparent mais ~100 000× plus lent' },
      { crash: 'malloc(1 To) réussit ?!', message: 'l\'overcommit — Linux promet de la mémoire virtuelle qu\'il n\'a pas ; c\'est à l\'ÉCRITURE que l\'OOM killer frappe' },
      { branch: 'deux processus peuvent-ils partager une page physique ?', taken: true, then: 'oui — bibliothèques partagées, fork copy-on-write, mmap' },
    ],
  },
  {
    id: 'signaux',
    code: `kill -TERM 1234   # SIGTERM — la demande polie (nettoyage possible)
kill -9 1234      # SIGKILL — ni capté ni ignoré : le noyau tue
Ctrl+C            # SIGINT  — interruption depuis le terminal
Ctrl+Z            # SIGTSTP — pause (fg/bg pour reprendre)
trap 'cleanup' TERM INT   # le handler dans un script shell`,
    ops: [
      { eval: 'kill -TERM 1234', value: 'SIGTERM', note: 'la demande POLIE — le processus peut nettoyer (handler) ou l\'ignorer' },
      { eval: 'kill -9 1234', value: 'SIGKILL', note: 'ne peut être NI capté NI ignoré — le noyau tue directement ; aucun nettoyage possible. D\'où : -TERM d\'abord, -9 en dernier recours' },
      { eval: 'Ctrl+C', value: 'SIGINT' },
      { eval: 'Ctrl+Z', value: 'SIGTSTP (pause — fg/bg pour reprendre)' },
      { crash: 'segfault', message: 'SIGSEGV — le signal que le noyau t\'envoie quand tu touches une page interdite' },
      { log: "trap 'cleanup' TERM INT — le handler de nettoyage dans un script shell" },
    ],
  },
];

export const osBasicsScenarioById = (id) => OSBASICS_SCENARIOS.find((s) => s.id === id);
