/**
 * Linux/shell (bash) basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - quoting & word splitting: "$var" expands as ONE word, '$var' stays literal,
 *    bare $var splits on whitespace (touch $nom creates TWO files) — and an empty
 *    unquoted var in `rm $dossier/*` becomes `rm /*`… always quote "$var";
 *  - exit codes: $? holds the LAST command's status (0 = success), && runs the
 *    next command only on success, || only on failure, `set -e` aborts on error;
 *  - redirections: > truncates, >> appends, 2> is stderr only — and ORDER matters:
 *    `cmd > f 2>&1` sends both streams to f, `cmd 2>&1 > f` leaves stderr on the
 *    terminal; a plain pipe `|` only carries stdout (use |& for both);
 *  - globbing: globs are expanded by the SHELL (not by ls), an unmatched glob
 *    stays LITERAL (echo * in an empty dir prints *, unless nullglob), * never
 *    matches dotfiles, and `for f in $(ls)` breaks on filenames with spaces.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const LINUXBASICS_SCENARIOS = [
  {
    id: 'quoting',
    code: `nom="Ada Lovelace"
echo "$nom"      # Ada Lovelace — doubles quotes : développé, UN mot
echo '$nom'      # $nom — simples quotes : AUCUNE expansion
touch $nom       # 💥 sans quotes : DEUX fichiers « Ada » et « Lovelace »
rm $dossier/*    # 💥 si $dossier est vide → rm /* … catastrophe
# → règle d'or : toujours quoter "$var"`,
    ops: [
      { eval: 'nom="Ada Lovelace"', value: '(variable assignée)', note: 'pas d\'espaces autour du = en bash' },
      { eval: 'echo "$nom"', value: 'Ada Lovelace', note: 'doubles quotes = la variable est développée, en UN seul mot' },
      { eval: "echo '$nom'", value: '$nom', note: 'simples quotes = AUCUNE expansion, littéral' },
      { crash: 'touch $nom', message: 'sans quotes, le WORD SPLITTING découpe sur les espaces : DEUX fichiers « Ada » et « Lovelace » sont créés — toujours quoter "$var"' },
      { crash: 'rm $dossier/*', message: 'si $dossier est vide ou non définie, la commande devient rm /* — suppression à la racine ! Quoter "$dossier" (et préférer set -u) évite le désastre' },
    ],
  },
  {
    id: 'exit-codes',
    code: `false                     # échoue silencieusement
echo $?                   # 1 — code de retour de la DERNIÈRE commande
true  && echo "ok"        # ok — && n'exécute QUE si succès
false && echo "jamais"    # rien — court-circuité
false || echo "plan B"    # plan B — || est le « sinon »
set -e                    # le script s'arrête à la 1ère erreur`,
    ops: [
      { eval: 'false', value: '(code retour 1)', note: 'false ne fait rien, mais échoue (code ≠ 0)' },
      { eval: 'echo $?', value: '1', note: '$? = code de retour de la DERNIÈRE commande ; 0 = succès' },
      { branch: 'true && echo "ok"', taken: true, then: '« ok » s\'affiche — && n\'exécute la suite QUE si succès (code 0)' },
      { branch: 'false && echo "jamais"', taken: false, else: 'court-circuité — false a échoué, echo n\'est jamais exécuté' },
      { branch: 'false || echo "plan B"', taken: true, then: '|| est le « sinon » — exécuté car la commande a échoué' },
      { log: 'set -e : le script s\'arrête à la PREMIÈRE commande qui échoue — indispensable en début de script' },
    ],
  },
  {
    id: 'redirections',
    code: `ls > liste.txt              # stdout → fichier (ÉCRASÉ ; >> pour ajouter)
grep x *.log 2> erreurs.txt # 2> ne redirige QUE stderr
cmd > f 2>&1                # ✓ les DEUX flux vont dans f
cmd 2>&1 > f                # 💥 PIÈGE : stderr reste à l'écran !
cmd1 | cmd2                 # le pipe ne transporte QUE stdout`,
    ops: [
      { eval: 'ls > liste.txt', value: '(stdout écrit dans liste.txt)', note: 'stdout → fichier, ÉCRASÉ ; >> pour ajouter à la fin' },
      { eval: 'grep x *.log 2> erreurs.txt', value: '(stderr écrit dans erreurs.txt)', note: '2> redirige stderr seulement — stdout va toujours au terminal' },
      { eval: 'cmd > f 2>&1', value: '(stdout ET stderr dans f)', note: 'les DEUX flux vont dans f — stdout d\'abord redirigé vers f, puis stderr le rejoint (2>&1 = « copie stderr là où pointe stdout »)' },
      { crash: 'cmd 2>&1 > f', message: 'PIÈGE — l\'ordre compte : stderr est copié vers l\'ANCIEN stdout (le terminal) AVANT la redirection ; stderr reste à l\'écran, seul stdout va dans f' },
      { log: 'cmd1 | cmd2 : le pipe ne transporte QUE stdout — utiliser |& (ou 2>&1 |) pour transmettre aussi stderr' },
    ],
  },
  {
    id: 'globbing',
    code: `ls *.txt          # notes.txt rapport.txt — développé par le SHELL
echo *            # dans un dossier VIDE : affiche * littéralement !
ls *              # ne montre PAS .env — * ignore les dotfiles
for f in $(ls)    # 💥 cassé si un nom contient un espace
for f in *        # ✓ la bonne façon d'itérer sur des fichiers`,
    ops: [
      { eval: 'ls *.txt', value: 'notes.txt rapport.txt', note: 'le glob est développé par le SHELL, pas par ls — ls reçoit déjà la liste des noms' },
      { eval: 'echo *', value: '*', note: 'dans un dossier VIDE, le glob non-matché reste LITTÉRAL (sauf nullglob)' },
      { eval: 'ls *', value: 'notes.txt rapport.txt  (mais pas .env !)', note: '* ne matche PAS les fichiers cachés (dotfiles) — utiliser ls -A ou le glob .*' },
      { crash: 'for f in $(ls)', message: 'cassé : le résultat de $(ls) subit le word splitting — « mon fichier.txt » devient deux itérations « mon » et « fichier.txt » ; utiliser for f in *' },
    ],
  },
];

export const linuxBasicsScenarioById = (id) => LINUXBASICS_SCENARIOS.find((s) => s.id === id);
