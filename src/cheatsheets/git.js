/**
 * Cheatsheet Git — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'git',
  lang: 'git',
  sections: [
    {
      id: 'daily',
      title: { fr: 'Quotidien', en: 'Daily workflow' },
      items: [
        {
          id: 'git-status',
          title: { fr: 'Où en suis-je ?', en: 'Where am I?' },
          code: `git status            # vue complète : staged, modifié, non suivi\ngit status -sb        # version courte + branche courante`,
          note: {
            fr: `Le réflexe avant toute commande. -sb donne l'essentiel en 2 lignes : branche, avance/retard sur le remote, fichiers touchés.`,
            en: `The reflex before any command. -sb gives the essentials in 2 lines: branch, ahead/behind the remote, touched files.`,
          },
        },
        {
          id: 'git-diff',
          title: { fr: 'Voir ce qui a changé', en: 'See what changed' },
          code: `git diff              # modifié mais PAS encore stagé\ngit diff --staged     # ce qui partira dans le prochain commit\ngit diff --stat       # résumé par fichier`,
          note: {
            fr: `Deux zones, deux diffs : sans option on compare le répertoire de travail à l'index ; --staged compare l'index au dernier commit.`,
            en: `Two areas, two diffs: with no option you compare the working directory to the index; --staged compares the index to the last commit.`,
          },
        },
        {
          id: 'git-add-p',
          title: { fr: 'Stager par morceaux (hunks)', en: 'Stage by hunks' },
          code: `git add -p            # passe en revue chaque hunk : y/n/s/q\n# y = stager, n = sauter, s = découper plus fin, q = quitter`,
          note: {
            fr: `Permet de séparer deux changements mélangés dans un même fichier en commits distincts. Le secret des historiques propres.`,
            en: `Lets you split two changes mixed in the same file into separate commits. The secret behind clean histories.`,
          },
        },
        {
          id: 'git-commit',
          title: { fr: 'Commiter avec un bon message', en: 'Commit with a good message' },
          code: `git commit -m "feat: ajoute le filtre par date"\n# convention courte : type(scope): résumé à l'impératif, < 72 caractères\n# types courants : feat, fix, refactor, docs, test, chore`,
          note: {
            fr: `Un message décrit l'intention, pas le diff (le diff est déjà dans le commit). Le format "type: résumé" rend le log scannable.`,
            en: `A message describes the intent, not the diff (the diff is already in the commit). The "type: summary" format makes the log scannable.`,
          },
        },
        {
          id: 'git-pull-rebase',
          title: { fr: 'pull --rebase vs pull', en: 'pull --rebase vs pull' },
          code: `git pull --rebase     # rejoue tes commits locaux APRÈS ceux du remote\ngit pull              # crée un commit de merge si divergence\ngit config pull.rebase true   # en faire le défaut`,
          note: {
            fr: `--rebase évite les commits de merge parasites "Merge branch 'main'..." et garde un historique linéaire. À préférer pour le travail quotidien.`,
            en: `--rebase avoids noisy "Merge branch 'main'..." merge commits and keeps a linear history. Prefer it for daily work.`,
          },
        },
        {
          id: 'git-push-u',
          title: { fr: 'Pousser (et lier la branche)', en: 'Push (and link the branch)' },
          code: `git push -u origin ma-branche   # la 1re fois : crée le lien de suivi\ngit push                        # ensuite, ça suffit`,
          note: {
            fr: `-u (--set-upstream) lie la branche locale à la distante : les push/pull suivants n'ont plus besoin d'arguments.`,
            en: `-u (--set-upstream) links the local branch to the remote one: later push/pull calls need no arguments.`,
          },
        },
        {
          id: 'git-fetch-vs-pull',
          title: { fr: 'fetch vs pull', en: 'fetch vs pull' },
          code: `git fetch             # télécharge le remote SANS toucher ton travail\ngit log HEAD..origin/main --oneline   # voir ce qui arrive avant d'intégrer\ngit pull              # = fetch + merge (ou rebase)`,
          note: {
            fr: `fetch est toujours sûr : il met à jour origin/* sans modifier tes branches. pull intègre tout de suite — fetch d'abord pour inspecter.`,
            en: `fetch is always safe: it updates origin/* without modifying your branches. pull integrates immediately — fetch first to inspect.`,
          },
        },
      ],
    },
    {
      id: 'branches',
      title: { fr: 'Branches', en: 'Branches' },
      items: [
        {
          id: 'git-switch-c',
          title: { fr: 'Créer / changer de branche', en: 'Create / switch branches' },
          code: `git switch -c feature/login   # créer + basculer\ngit switch main               # revenir sur main\ngit switch -                  # branche précédente (comme cd -)`,
          note: {
            fr: `switch (Git 2.23+) remplace checkout pour les branches : une commande, un seul rôle, moins d'accidents qu'avec checkout qui fait tout.`,
            en: `switch (Git 2.23+) replaces checkout for branches: one command, one job, fewer accidents than checkout which does everything.`,
          },
        },
        {
          id: 'git-branch-list-delete',
          title: { fr: 'Lister et supprimer', en: 'List and delete' },
          code: `git branch -vv        # branches locales + suivi + dernier commit\ngit branch -d vieille-branche   # supprime si fusionnée (sûr)\ngit branch -D vieille-branche   # force, même non fusionnée`,
          note: {
            fr: `-d refuse de supprimer une branche non fusionnée — c'est un garde-fou. -D force : vérifie d'abord avec git log que rien d'important ne part.`,
            en: `-d refuses to delete an unmerged branch — that's a safety net. -D forces it: check with git log first that nothing important is lost.`,
          },
        },
        {
          id: 'git-branch-rename',
          title: { fr: 'Renommer une branche', en: 'Rename a branch' },
          code: `git branch -m nouveau-nom        # renomme la branche courante\ngit push origin -u nouveau-nom   # pousse sous le nouveau nom\ngit push origin --delete ancien-nom   # supprime l'ancienne distante`,
          note: {
            fr: `Le renommage local est instantané, mais le remote garde l'ancien nom : il faut pousser le nouveau puis supprimer l'ancien.`,
            en: `The local rename is instant, but the remote keeps the old name: push the new one then delete the old.`,
          },
        },
        {
          id: 'git-merge',
          title: { fr: 'Merger (ff vs --no-ff)', en: 'Merge (ff vs --no-ff)' },
          code: `git switch main\ngit merge feature/login           # fast-forward si possible (pas de commit)\ngit merge --no-ff feature/login   # force un commit de merge (trace la feature)`,
          note: {
            fr: `Le fast-forward avance juste le pointeur : historique linéaire mais la feature disparaît du graphe. --no-ff garde une trace visible de la branche.`,
            en: `Fast-forward just moves the pointer: linear history but the feature vanishes from the graph. --no-ff keeps a visible trace of the branch.`,
          },
        },
        {
          id: 'git-rebase',
          title: { fr: 'Rebase (et sa règle d\'or)', en: 'Rebase (and its golden rule)' },
          code: `git switch feature/login\ngit rebase main       # rejoue tes commits sur la pointe de main\n# conflit ? corriger, puis : git add . && git rebase --continue\n# ⚠ règle d'or : jamais rebaser une branche partagée/poussée`,
          note: {
            fr: `Le rebase réécrit les SHA : sur une branche que d'autres utilisent, ça casse leur historique. Réserve-le à tes branches locales.`,
            en: `Rebase rewrites SHAs: on a branch others use, it breaks their history. Keep it for your local branches.`,
          },
        },
        {
          id: 'git-rebase-i',
          title: { fr: 'Rebase interactif (nettoyer avant PR)', en: 'Interactive rebase (clean up before PR)' },
          code: `git rebase -i HEAD~4   # rééditer les 4 derniers commits\n# dans l'éditeur : pick = garder, squash = fusionner avec le précédent,\n# reword = changer le message, drop = supprimer`,
          note: {
            fr: `Idéal pour transformer 4 commits "wip" en 1 commit propre avant la PR. Même règle d'or : uniquement sur des commits non poussés.`,
            en: `Perfect for turning 4 "wip" commits into 1 clean commit before the PR. Same golden rule: only on unpushed commits.`,
          },
        },
      ],
    },
    {
      id: 'undo',
      title: { fr: 'Réparer', en: 'Undo & repair' },
      items: [
        {
          id: 'git-restore-file',
          title: { fr: 'Annuler les modifs d\'un fichier', en: 'Discard changes in a file' },
          code: `git restore app.js          # ⚠ écrase les modifs non commitées (perdu !)\ngit restore .               # tout le répertoire courant\ngit restore --source HEAD~2 app.js   # reprendre la version d'il y a 2 commits`,
          note: {
            fr: `restore ramène le fichier à sa version dans l'index (ou ailleurs avec --source). Les modifications non commitées sont irrécupérables.`,
            en: `restore brings the file back to its index version (or elsewhere with --source). Uncommitted changes are unrecoverable.`,
          },
        },
        {
          id: 'git-restore-staged',
          title: { fr: 'Dé-stager (sans rien perdre)', en: 'Unstage (without losing anything)' },
          code: `git restore --staged app.js   # sort du staging, garde les modifs\ngit restore --staged .        # tout dé-stager`,
          note: {
            fr: `L'inverse de git add : le fichier sort du prochain commit mais tes modifications restent intactes dans le répertoire de travail. Toujours sûr.`,
            en: `The opposite of git add: the file leaves the next commit but your changes stay intact in the working directory. Always safe.`,
          },
        },
        {
          id: 'git-reset',
          title: { fr: 'reset --soft / --mixed / --hard', en: 'reset --soft / --mixed / --hard' },
          code: `git reset --soft HEAD~1    # annule le commit, garde index + fichiers\ngit reset HEAD~1           # (--mixed) annule commit + staging, garde fichiers\ngit reset --hard HEAD~1    # ⚠ annule TOUT, modifs perdues\n#               commit | index | fichiers\n# --soft   :   défait | garde | garde\n# --mixed  :   défait | défait| garde\n# --hard   :   défait | défait| défait`,
          note: {
            fr: `Les trois modes défont de plus en plus : --soft pour refaire un commit, --mixed pour re-trier, --hard pour tout jeter. --hard ne pardonne pas.`,
            en: `The three modes undo more and more: --soft to redo a commit, --mixed to re-sort, --hard to throw everything away. --hard is unforgiving.`,
          },
        },
        {
          id: 'git-revert',
          title: { fr: 'Revert (sûr sur du partagé)', en: 'Revert (safe on shared history)' },
          code: `git revert abc1234        # crée un commit qui annule abc1234\ngit revert HEAD           # annule le dernier commit\ngit revert --no-commit HEAD~3..HEAD   # annule 3 commits en un seul`,
          note: {
            fr: `Contrairement à reset, revert n'efface rien : il ajoute un commit inverse. C'est LA façon d'annuler sur une branche partagée.`,
            en: `Unlike reset, revert erases nothing: it adds an inverse commit. It's THE way to undo on a shared branch.`,
          },
        },
        {
          id: 'git-reflog',
          title: { fr: 'Reflog : le filet de sécurité', en: 'Reflog: the safety net' },
          code: `git reflog                # journal de TOUS les déplacements de HEAD\n# retrouver un commit "perdu" après un reset --hard ou un rebase raté :\ngit reset --hard HEAD@{2}   # revenir où on était il y a 2 mouvements`,
          note: {
            fr: `Presque rien n'est vraiment perdu : un commit encore atteignable reste ~90 jours dans le reflog, mais un commit devenu orphelin (après un reset --hard par exemple) n'a plus que ~30 jours (gc.reflogExpireUnreachable). Premier réflexe après une commande destructrice.`,
            en: `Almost nothing is truly lost: a still-reachable commit stays ~90 days in the reflog, but a commit that became orphaned (e.g. after a reset --hard) only has ~30 days left (gc.reflogExpireUnreachable). First reflex after a destructive command.`,
          },
        },
        {
          id: 'git-amend',
          title: { fr: 'Corriger le dernier commit', en: 'Fix the last commit' },
          code: `git add fichier-oublié.js\ngit commit --amend --no-edit  # même message\ngit commit --amend            # ou rééditer le message\n# ⚠ réécrit l'historique : jamais après un push partagé`,
          note: {
            fr: `--amend remplace le dernier commit (nouveau SHA). Sûr tant que le commit n'est pas poussé ; après, il faudra un force-with-lease.`,
            en: `--amend replaces the last commit (new SHA). Safe as long as the commit isn't pushed; afterwards you'd need a force-with-lease.`,
          },
        },
      ],
    },
    {
      id: 'inspect',
      title: { fr: 'Inspecter', en: 'Inspect' },
      items: [
        {
          id: 'git-log-graph',
          title: { fr: 'Visualiser l\'historique', en: 'Visualize history' },
          code: `git log --oneline --graph --all   # graphe ASCII de toutes les branches\ngit log --oneline -10             # les 10 derniers, compact\ngit log --since="2 weeks" --author=alex   # filtrer`,
          note: {
            fr: `--graph --all montre où chaque branche se trouve et où elles divergent — indispensable avant un merge ou un rebase.`,
            en: `--graph --all shows where each branch sits and where they diverge — essential before a merge or rebase.`,
          },
        },
        {
          id: 'git-log-pickaxe',
          title: { fr: 'Chercher dans l\'historique', en: 'Search history' },
          code: `git log -p app.js            # historique d'un fichier avec les diffs\ngit log -S "fetchUsers"      # pickaxe : commits qui ajoutent/retirent ce texte\ngit log -G "fetch.*Users"    # idem avec une regex`,
          note: {
            fr: `-S retrouve quand une fonction est apparue ou a disparu, même si le fichier a été renommé entre-temps. Bien plus puissant que grep sur le log.`,
            en: `-S finds when a function appeared or vanished, even if the file was renamed in between. Far more powerful than grepping the log.`,
          },
        },
        {
          id: 'git-show',
          title: { fr: 'Examiner un commit', en: 'Examine a commit' },
          code: `git show abc1234            # message + diff complet du commit\ngit show abc1234 --stat     # juste les fichiers touchés\ngit show abc1234:src/app.js # contenu d'un fichier À ce commit`,
          note: {
            fr: `La syntaxe commit:chemin affiche un fichier tel qu'il était à ce moment-là, sans rien changer dans ton répertoire de travail.`,
            en: `The commit:path syntax shows a file as it was at that point, without changing anything in your working directory.`,
          },
        },
        {
          id: 'git-blame',
          title: { fr: 'Qui a écrit cette ligne ?', en: 'Who wrote this line?' },
          code: `git blame -L 40,60 app.js    # auteur + commit pour les lignes 40 à 60\ngit blame -w app.js          # ignore les changements d'espaces\n# puis : git show <sha> pour lire le commit en entier`,
          note: {
            fr: `Le but n'est pas de trouver un coupable mais le commit — et donc le contexte et le pourquoi — derrière une ligne étrange.`,
            en: `The goal isn't to find a culprit but the commit — and therefore the context and the why — behind a strange line.`,
          },
        },
        {
          id: 'git-bisect',
          title: { fr: 'Bisect : trouver le commit fautif', en: 'Bisect: find the guilty commit' },
          code: `git bisect start\ngit bisect bad               # le HEAD actuel est cassé\ngit bisect good v2.1         # cette version marchait\n# git teste par dichotomie : répondre good/bad à chaque étape\ngit bisect reset             # terminer et revenir`,
          note: {
            fr: `Recherche dichotomique : 1000 commits = ~10 étapes pour isoler la régression. Avec un test auto : git bisect run npm test.`,
            en: `Binary search: 1000 commits = ~10 steps to isolate the regression. With an automated test: git bisect run npm test.`,
          },
        },
        {
          id: 'git-diff-branches',
          title: { fr: 'Comparer deux branches', en: 'Compare two branches' },
          code: `git diff main..feature        # tout ce que feature change vs main\ngit diff main...feature       # idem depuis leur ancêtre commun (pour les PR)\ngit log main..feature --oneline   # les commits propres à feature`,
          note: {
            fr: `Deux points = différence brute entre les deux pointes ; trois points = ce que la branche apporte depuis la divergence (c'est la vue des PR).`,
            en: `Two dots = raw difference between the two tips; three dots = what the branch adds since the divergence (that's the PR view).`,
          },
        },
      ],
    },
    {
      id: 'sync',
      title: { fr: 'Remotes & sync', en: 'Remotes & sync' },
      items: [
        {
          id: 'git-remote',
          title: { fr: 'Gérer les remotes', en: 'Manage remotes' },
          code: `git remote -v                 # lister les remotes et leurs URL\ngit remote add upstream https://github.com/org/projet.git\ngit fetch upstream            # récupérer le dépôt d'origine (fork)`,
          note: {
            fr: `Convention : origin = ton dépôt (souvent un fork), upstream = le dépôt d'origine. fetch upstream pour rester à jour sur un fork.`,
            en: `Convention: origin = your repo (often a fork), upstream = the original repo. fetch upstream to stay current on a fork.`,
          },
        },
        {
          id: 'git-force-with-lease',
          title: { fr: 'Forcer un push sans écraser les autres', en: 'Force-push without crushing others' },
          code: `git push --force-with-lease   # refuse si quelqu'un a poussé entre-temps\n# ⚠ jamais --force seul : il écrase aveuglément le travail des autres`,
          note: {
            fr: `Nécessaire après un rebase ou un amend déjà poussé. --force-with-lease vérifie que le remote n'a pas bougé depuis ton dernier fetch.`,
            en: `Needed after a rebase or amend that was already pushed. --force-with-lease checks the remote hasn't moved since your last fetch.`,
          },
        },
        {
          id: 'git-fetch-prune',
          title: { fr: 'Nettoyer les branches distantes mortes', en: 'Clean up dead remote branches' },
          code: `git fetch --prune             # supprime les origin/* qui n'existent plus\ngit config fetch.prune true   # le faire automatiquement à chaque fetch`,
          note: {
            fr: `Quand une branche est supprimée sur GitHub, ta copie origin/branche reste localement. --prune la fait disparaître et garde la liste propre.`,
            en: `When a branch is deleted on GitHub, your origin/branch copy stays locally. --prune removes it and keeps the list clean.`,
          },
        },
        {
          id: 'git-tags',
          title: { fr: 'Tags (versions)', en: 'Tags (releases)' },
          code: `git tag -a v2.1.0 -m "Version 2.1.0"   # tag annoté (auteur, date, message)\ngit push origin v2.1.0        # les tags ne partent PAS avec git push\ngit push --tags               # ou pousser tous les tags\ngit tag -l "v2.*"             # lister`,
          note: {
            fr: `Préfère les tags annotés (-a) aux légers : ils portent auteur, date et message — c'est ce qu'attendent les outils de release. Et pense à les pousser explicitement.`,
            en: `Prefer annotated tags (-a) over lightweight ones: they carry author, date and message — what release tooling expects. And remember to push them explicitly.`,
          },
        },
        {
          id: 'git-track-remote',
          title: { fr: 'Suivre une branche distante', en: 'Track a remote branch' },
          code: `git switch feature/login      # crée la locale depuis origin/feature/login\n# (si elle n'existe pas localement, switch la crée et la lie tout seul)\ngit branch -u origin/main     # (re)lier une branche existante`,
          note: {
            fr: `Depuis Git 2.23, switch vers une branche qui n'existe que sur le remote crée automatiquement la locale avec le suivi configuré.`,
            en: `Since Git 2.23, switching to a branch that only exists on the remote automatically creates the local one with tracking set up.`,
          },
        },
      ],
    },
    {
      id: 'stash',
      title: { fr: 'Stash & déplacer du travail', en: 'Stash & moving work around' },
      items: [
        {
          id: 'git-stash-basics',
          title: { fr: 'Mettre de côté / récupérer', en: 'Set aside / retrieve' },
          code: `git stash push -m "wip: formulaire login"   # toujours nommer !\ngit stash list                # voir la pile\ngit stash pop                 # réapplique le dernier ET le supprime\ngit stash apply stash@{1}     # réapplique SANS supprimer (plus sûr)`,
          note: {
            fr: `pop supprime le stash même en cas de conflit partiel — apply le garde, tu le drop quand tout est bon. Sans -m, la liste devient illisible.`,
            en: `pop drops the stash even on a partial conflict — apply keeps it, you drop it once everything is fine. Without -m, the list becomes unreadable.`,
          },
        },
        {
          id: 'git-stash-p',
          title: { fr: 'Stasher seulement certains hunks', en: 'Stash only some hunks' },
          code: `git stash push -p -m "juste le debug"   # choisir hunk par hunk (y/n)\ngit stash push -m "ce fichier" app.js   # ou stasher un fichier précis`,
          note: {
            fr: `Comme add -p mais pour le stash : utile pour écarter du code de debug tout en gardant le vrai travail dans le répertoire.`,
            en: `Like add -p but for stash: handy to set aside debug code while keeping the real work in the directory.`,
          },
        },
        {
          id: 'git-cherry-pick',
          title: { fr: 'Cherry-pick : copier un commit', en: 'Cherry-pick: copy a commit' },
          code: `git switch release/2.1\ngit cherry-pick abc1234       # applique ce commit ici (nouveau SHA)\ngit cherry-pick abc1234 def5678   # plusieurs d'un coup\ngit cherry-pick --abort       # en cas de conflit ingérable`,
          note: {
            fr: `Typique pour reporter un hotfix de main vers une branche de release. C'est une copie : le commit existe alors en double dans l'historique.`,
            en: `Typical for porting a hotfix from main to a release branch. It's a copy: the commit then exists twice in history.`,
          },
        },
        {
          id: 'git-worktree',
          title: { fr: 'Worktree : 2 branches en parallèle', en: 'Worktree: 2 branches side by side' },
          code: `git worktree add ../projet-hotfix hotfix/crash   # 2e dossier, 2e branche\n# corriger dans ../projet-hotfix sans toucher au travail en cours\ngit worktree remove ../projet-hotfix   # nettoyer ensuite\ngit worktree list`,
          note: {
            fr: `Évite le cycle stash → switch → switch → pop : chaque worktree est un répertoire de travail indépendant sur le même dépôt.`,
            en: `Avoids the stash → switch → switch → pop cycle: each worktree is an independent working directory on the same repository.`,
          },
        },
        {
          id: 'git-clean',
          title: { fr: 'Supprimer les fichiers non suivis', en: 'Delete untracked files' },
          code: `git clean -nd     # -n : DRY RUN, montre ce qui serait supprimé\ngit clean -fd     # ⚠ supprime fichiers ET dossiers non suivis (définitif)\ngit clean -fdx    # ⚠⚠ inclut aussi les fichiers ignorés (node_modules...)`,
          note: {
            fr: `Toujours -nd d'abord : clean supprime sans passer par la corbeille ni le reflog. -x est radical, il efface aussi ce que .gitignore protège.`,
            en: `Always -nd first: clean deletes with no trash bin and no reflog. -x is radical, it also wipes what .gitignore protects.`,
          },
        },
        {
          id: 'git-stash-branch',
          title: { fr: 'Transformer un stash en branche', en: 'Turn a stash into a branch' },
          code: `git stash branch fix/oubli stash@{0}   # crée la branche au bon commit\n# et y réapplique le stash (puis le supprime si tout passe)`,
          note: {
            fr: `Le remède quand un stash ne s'applique plus proprement parce que la branche a trop avancé : il repart du commit où le stash a été créé.`,
            en: `The remedy when a stash no longer applies cleanly because the branch moved too far: it restarts from the commit where the stash was created.`,
          },
        },
      ],
    },
    {
      id: 'config',
      title: { fr: 'Config & hygiène', en: 'Config & hygiene' },
      items: [
        {
          id: 'git-config-basics',
          title: { fr: 'Identité : global vs local', en: 'Identity: global vs local' },
          code: `git config --global user.name "Alex"          # pour tous les dépôts\ngit config --global user.email alex@perso.dev\ngit config user.email alex@boulot.com          # ce dépôt SEULEMENT (prioritaire)\ngit config --list --show-origin               # qui définit quoi, et dans quel fichier`,
          note: {
            fr: `Le local (.git/config) gagne toujours sur le global (~/.gitconfig) : pratique pour un email pro sur les dépôts du boulot. --show-origin révèle d'où vient chaque valeur quand un réglage surprend.`,
            en: `Local (.git/config) always wins over global (~/.gitconfig): handy for a work email on work repos. --show-origin reveals where each value comes from when a setting surprises you.`,
          },
        },
        {
          id: 'git-aliases',
          title: { fr: 'Les alias indispensables', en: 'The essential aliases' },
          code: `git config --global alias.st "status -sb"\ngit config --global alias.lg "log --oneline --graph --all"\ngit config --global alias.undo "reset --soft HEAD~1"   # défait le commit, garde tout\n# ensuite : git st, git lg, git undo`,
          note: {
            fr: `Les alias vivent dans ~/.gitconfig : trois lettres pour les commandes tapées 50 fois par jour. git undo est le plus rentable — il annule un commit raté sans rien perdre.`,
            en: `Aliases live in ~/.gitconfig: three letters for commands typed 50 times a day. git undo pays off the most — it cancels a botched commit without losing anything.`,
          },
        },
        {
          id: 'git-ignore-debug',
          title: { fr: '.gitignore qui ne marche pas', en: '.gitignore not working' },
          code: `git check-ignore -v dist/app.js   # quelle règle (et quel fichier) ignore — ou pas\ngit rm --cached dist/app.js       # désindexe SANS supprimer du disque\ngit rm -r --cached dist/          # idem pour tout un dossier\ngit commit -m "chore: retire dist du suivi"`,
          note: {
            fr: `Le piège classique : .gitignore n'agit que sur les fichiers NON suivis. Un fichier déjà commité reste suivi — il faut le désindexer avec rm --cached pour que la règle s'applique enfin.`,
            en: `The classic trap: .gitignore only affects UNtracked files. A file already committed stays tracked — you must unindex it with rm --cached for the rule to finally apply.`,
          },
        },
        {
          id: 'git-ignore-global',
          title: { fr: 'Le .gitignore global', en: 'The global .gitignore' },
          code: `git config --global core.excludesFile ~/.gitignore_global\n# dans ~/.gitignore_global : le bruit de TA machine, pas du projet\n# .DS_Store\n# .idea/\n# *.swp`,
          note: {
            fr: `Les fichiers de ton OS ou de ton éditeur (.DS_Store, .idea) n'ont rien à faire dans le .gitignore de chaque projet : c'est ton problème, pas celui de l'équipe. Le global les filtre partout, une fois pour toutes.`,
            en: `Your OS or editor files (.DS_Store, .idea) don't belong in every project's .gitignore: that's your problem, not the team's. The global one filters them everywhere, once and for all.`,
          },
        },
        {
          id: 'git-autosquash',
          title: { fr: 'fixup + autosquash : reviews propres', en: 'fixup + autosquash: clean reviews' },
          code: `git commit --fixup abc1234        # "ce commit corrige abc1234"\n# ... d'autres commits, d'autres fixups ...\ngit rebase -i --autosquash main   # Git range les fixup! au bon endroit, déjà en squash\ngit config --global rebase.autoSquash true   # en faire le défaut`,
          note: {
            fr: `Pendant une review, on corrige des commits déjà poussés : --fixup cible le commit fautif, et --autosquash réordonne et fusionne tout automatiquement au rebase final. Zéro tri manuel dans l'éditeur.`,
            en: `During a review you fix commits already pushed: --fixup targets the guilty commit, and --autosquash reorders and merges everything automatically at the final rebase. Zero manual sorting in the editor.`,
          },
        },
        {
          id: 'git-conventional',
          title: { fr: 'Conventional commits', en: 'Conventional commits' },
          code: `git commit -m "feat(auth): ajoute la connexion par SSO"\ngit commit -m "fix(api): timeout sur les requêtes lentes"\ngit commit -m "chore: met à jour les dépendances"\n# breaking change : un ! avant les deux-points\ngit commit -m "feat(api)!: supprime l'endpoint v1"`,
          note: {
            fr: `Un format machine-lisible : feat déclenche une version mineure, fix un patch, ! une majeure — les changelogs et le versioning (semantic-release) se génèrent tout seuls. Le scope entre parenthèses situe la zone touchée.`,
            en: `A machine-readable format: feat triggers a minor version, fix a patch, ! a major — changelogs and versioning (semantic-release) generate themselves. The scope in parentheses pins down the touched area.`,
          },
        },
      ],
    },
    {
      id: 'collab',
      title: { fr: 'Collaboration & PR', en: 'Collaboration & PRs' },
      items: [
        {
          id: 'git-pr-update',
          title: { fr: 'Mettre à jour sa branche de PR', en: 'Update your PR branch' },
          code: `git fetch origin\ngit rebase origin/main            # rejoue ta branche sur le main à jour\n# conflits ? corriger, git add ., git rebase --continue\ngit push --force-with-lease       # le rebase a réécrit les SHA : push forcé obligatoire`,
          note: {
            fr: `Rebaser plutôt que merger main dans la PR garde un historique linéaire et une review lisible. Le force-with-lease est inévitable après rebase — mais jamais --force seul.`,
            en: `Rebasing instead of merging main into the PR keeps a linear history and a readable review. force-with-lease is unavoidable after a rebase — but never plain --force.`,
          },
        },
        {
          id: 'git-conflits',
          title: { fr: 'Résoudre un conflit pas à pas', en: 'Resolve a conflict step by step' },
          code: `git status                # liste les fichiers "both modified"\n# dans le fichier : <<<<<<< HEAD (ta version) ... ======= ... >>>>>>> (la leur)\n# garder/combiner ce qu'il faut, supprimer les marqueurs\ngit add fichier-resolu.js\ngit rebase --continue     # (ou git merge --continue)\ngit rebase --abort        # en secours : tout annuler et repartir de zéro`,
          note: {
            fr: `Un conflit n'est pas une erreur : Git demande juste un arbitrage humain entre deux versions. --abort est toujours là — on ne reste jamais coincé au milieu d'un rebase.`,
            en: `A conflict isn't an error: Git just asks for a human call between two versions. --abort is always there — you're never stuck in the middle of a rebase.`,
          },
        },
        {
          id: 'git-rerere',
          title: { fr: 'rerere : Git rejoue tes résolutions', en: 'rerere: Git replays your resolutions' },
          code: `git config --global rerere.enabled true\n# REuse REcorded REsolution : Git mémorise chaque conflit résolu\n# et le résout TOUT SEUL s'il réapparaît (rebase répétés, branches longues)`,
          note: {
            fr: `Sur une branche longue rebasée plusieurs fois, les mêmes conflits reviennent à chaque fois. rerere les enregistre la première fois et les rejoue ensuite — à activer une fois et oublier.`,
            en: `On a long-lived branch rebased several times, the same conflicts come back every time. rerere records them the first time and replays them afterwards — enable once and forget.`,
          },
        },
        {
          id: 'git-range-diff',
          title: { fr: 'Comparer deux versions d\'une branche', en: 'Compare two versions of a branch' },
          code: `git range-diff main feature@{1} feature   # avant vs après le rebase\n# = quels commits ont changé, lesquels sont identiques (=), modifiés (!)\ngit range-diff main..v2-old main..v2-new  # ou entre deux branches explicites`,
          note: {
            fr: `Après un rebase, diff classique ne sait plus comparer : les SHA ont tous changé. range-diff apparie les commits deux à deux et montre ce qui a VRAIMENT changé — l'outil rêvé pour re-reviewer une PR rebasée.`,
            en: `After a rebase, a classic diff can't compare anymore: all SHAs changed. range-diff pairs commits two by two and shows what REALLY changed — the dream tool for re-reviewing a rebased PR.`,
          },
        },
        {
          id: 'git-blame-ignore',
          title: { fr: 'Blame sans le bruit du reformatage', en: 'Blame without reformatting noise' },
          code: `# lister les SHA des commits "prettier sur tout le repo" :\necho abc1234def... >> .git-blame-ignore-revs\ngit blame --ignore-revs-file .git-blame-ignore-revs app.js\ngit config blame.ignoreRevsFile .git-blame-ignore-revs   # l'appliquer par défaut`,
          note: {
            fr: `Un commit de reformatage massif "écrase" le blame : chaque ligne pointe vers lui au lieu du vrai auteur. Le fichier d'exclusion rend le blame à nouveau utile — GitHub le lit aussi automatiquement.`,
            en: `A massive reformatting commit "smashes" blame: every line points to it instead of the real author. The ignore file makes blame useful again — GitHub also reads it automatically.`,
          },
        },
      ],
    },
    {
      id: 'internals',
      title: { fr: 'Sous le capot', en: 'Under the hood' },
      items: [
        {
          id: 'git-objects',
          title: { fr: 'Les 4 objets de Git', en: 'Git\'s 4 object types' },
          code: `git cat-file -p HEAD          # le commit : tree + parent + auteur + message\ngit cat-file -p HEAD^{tree}   # le tree : la liste des fichiers (blobs) et dossiers\ngit cat-file -t abc1234       # le type d'un objet : blob, tree, commit ou tag`,
          note: {
            fr: `Tout Git tient en 4 objets : blob (contenu d'un fichier), tree (un dossier), commit (un instantané + métadonnées), tag (une étiquette annotée). Un commit ne stocke PAS un diff mais un instantané complet — les diffs sont calculés à la volée.`,
            en: `All of Git fits in 4 objects: blob (file content), tree (a directory), commit (a snapshot + metadata), tag (an annotated label). A commit does NOT store a diff but a full snapshot — diffs are computed on the fly.`,
          },
        },
        {
          id: 'git-refs',
          title: { fr: 'HEAD, refs et la grammaire des révisions', en: 'HEAD, refs and revision grammar' },
          code: `cat .git/HEAD                 # ref: refs/heads/main → HEAD pointe une branche\ngit rev-parse HEAD~2          # ~2 : 2 commits en arrière (1er parent à chaque fois)\ngit rev-parse HEAD^2          # ^2 : le 2e PARENT (d'un commit de merge)\ngit log @{u}..                # @{u} = la branche distante suivie (upstream)`,
          note: {
            fr: `Une branche n'est qu'un fichier de 41 octets contenant un SHA ; HEAD est un pointeur vers cette branche. ~ remonte la lignée, ^ choisit entre les parents d'un merge — HEAD~2 et HEAD^2 sont des commits très différents.`,
            en: `A branch is just a 41-byte file containing a SHA; HEAD is a pointer to that branch. ~ walks up the lineage, ^ picks between a merge's parents — HEAD~2 and HEAD^2 are very different commits.`,
          },
        },
        {
          id: 'git-detached',
          title: { fr: 'Le detached HEAD démystifié', en: 'Detached HEAD demystified' },
          code: `git checkout abc1234          # HEAD pointe un commit, plus une branche → "detached"\n# explorer, compiler, tester : aucun risque tant qu'on ne commite pas\ngit switch -c fix/depuis-ici  # garder d'éventuels commits : créer une branche ICI\ngit switch -                  # ou repartir simplement sur la branche précédente`,
          note: {
            fr: `Ce n'est pas une erreur : HEAD pointe directement un commit au lieu d'une branche, parfait pour inspecter le passé. Seul danger : commiter puis partir — ces commits sans branche sont orphelins et finiront ramassés après ~30 jours (le reflog les garde ce temps-là, pas 90 jours comme les commits encore atteignables).`,
            en: `It's not an error: HEAD points directly at a commit instead of a branch, perfect for inspecting the past. Only danger: committing then leaving — those branchless commits are orphaned and will get collected after ~30 days (the reflog keeps them that long, not 90 days like still-reachable commits).`,
          },
        },
        {
          id: 'git-gc-prune',
          title: { fr: 'Ce que ramasse le garbage collector', en: 'What the garbage collector reaps' },
          code: `git gc                # compacte les objets en packfiles, nettoie le superflu\ngit count-objects -vH # combien d'objets, quelle taille\n# un objet n'est supprimé que s'il est ORPHELIN (aucune ref, aucun reflog)\n# ET expiré du reflog (~30 jours pour un objet inatteignable, ~90 s'il l'est encore)`,
          note: {
            fr: `gc tourne déjà tout seul lors des commandes courantes : le lancer à la main est rarement nécessaire. Tant qu'un commit est dans le reflog, il est protégé — c'est pour ça que reflog sauve des reset --hard, mais la fenêtre n'est que de ~30 jours (gc.reflogExpireUnreachable) une fois le commit orphelin.`,
            en: `gc already runs by itself during common commands: running it manually is rarely needed. As long as a commit is in the reflog it's protected — that's why reflog rescues you from reset --hard, but the window is only ~30 days (gc.reflogExpireUnreachable) once the commit is orphaned.`,
          },
        },
        {
          id: 'git-maintenance',
          title: { fr: 'git maintenance : l\'entretien automatique', en: 'git maintenance: automatic upkeep' },
          code: `git maintenance start    # planifie l'entretien en arrière-plan (cron/scheduler)\n# tâches : prefetch (fetch horaire silencieux), commit-graph (accélère log/merge),\n# gc incrémental, repack — sans jamais bloquer ton travail\ngit maintenance unregister   # désactiver pour ce dépôt`,
          note: {
            fr: `Sur les gros dépôts, log --graph et fetch deviennent lents. maintenance start (Git 2.31+) délègue l'optimisation au système : le prefetch horaire rend aussi les git fetch quasi instantanés.`,
            en: `On large repos, log --graph and fetch get slow. maintenance start (Git 2.31+) delegates optimization to the system: the hourly prefetch also makes git fetch nearly instant.`,
          },
        },
      ],
    },
    {
      id: 'git-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'git-bp-atomic-commits',
          title: { fr: 'Un commit = un changement logique', en: 'One commit = one logical change' },
          code: `git add -p                     # stage seulement le changement A
git commit -m "fix: corrige le calcul de TVA"
git add -p                     # puis le changement B, séparément
git commit -m "refactor: extrait calculTVA()"`,
          note: {
            fr: `Un commit qui mélange un fix et un refactor est impossible à reverter proprement et illisible en review. Des commits atomiques rendent bisect, revert et cherry-pick fiables.`,
            en: `A commit mixing a fix and a refactor is impossible to revert cleanly and unreadable in review. Atomic commits make bisect, revert and cherry-pick reliable.`,
          },
        },
        {
          id: 'git-bp-no-secrets',
          title: { fr: 'Jamais de secret commité (et rotation si ça arrive)', en: 'Never commit a secret (and rotate if it happens)' },
          code: `echo ".env" >> .gitignore
git rm --cached .env                     # si déjà suivi par erreur
# secret déjà commité par le passé : le rotater IMMÉDIATEMENT
# (retirer du dernier commit ne suffit pas : il reste dans l'historique)`,
          note: {
            fr: `Un secret dans l'historique Git reste récupérable même après suppression du fichier, tant que l'historique n'est pas réécrit (BFG, filter-repo) — et tout clone existant garde sa propre copie. La rotation immédiate est la seule protection fiable.`,
            en: `A secret in Git history stays recoverable even after the file is removed, unless history itself is rewritten (BFG, filter-repo) — and any existing clone keeps its own copy. Immediate rotation is the only reliable protection.`,
          },
        },
        {
          id: 'git-bp-branch-protection',
          title: { fr: 'Protéger main : review obligatoire, jamais de push direct', en: 'Protect main: required review, never push directly' },
          code: `# GitHub/GitLab : règle de protection sur main
# - require pull request before merging
# - require 1+ approving review
# - require status checks (CI) to pass`,
          note: {
            fr: `Un push direct sur main court-circuite la review et la CI : c'est le chemin le plus court vers une régression en production. La protection de branche force le passage par une PR.`,
            en: `A direct push to main bypasses review and CI: it's the shortest path to a production regression. Branch protection forces every change through a PR.`,
          },
        },
        {
          id: 'git-bp-descriptive-messages',
          title: { fr: 'Message de commit qui explique le pourquoi', en: 'Commit message that explains the why' },
          code: `git commit -m "fix(cache): invalide le cache après un update

Le cache gardait l'ancienne valeur car l'invalidation
n'était déclenchée que sur delete, pas sur update."`,
          note: {
            fr: `Le diff dit déjà CE QUI a changé ; le message doit dire POURQUOI. Six mois plus tard, c'est ce message qui explique une décision qui semble bizarre a posteriori.`,
            en: `The diff already shows WHAT changed; the message must say WHY. Six months later, that message is what explains a decision that otherwise looks strange in hindsight.`,
          },
        },
        {
          id: 'git-bp-small-prs',
          title: { fr: 'PR petites et focalisées, pas un mega-diff', en: 'Small, focused PRs, not a mega-diff' },
          code: `# ❌ une PR de 2000 lignes qui mélange refactor + feature + fix
# ✅ 3 PR distinctes, chacune reviewable en < 15 minutes
git switch -c refactor/extract-service
git switch -c feat/add-endpoint`,
          note: {
            fr: `Une PR de 2000 lignes ne se review pas vraiment : le relecteur approuve par fatigue, pas par conviction. Des PR petites se relisent en profondeur et isolent les régressions.`,
            en: `A 2000-line PR doesn't really get reviewed: the reviewer approves out of fatigue, not conviction. Small PRs get read in depth and isolate regressions.`,
          },
        },
      ],
    },
  ],
};
