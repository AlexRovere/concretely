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
            fr: `Presque rien n'est vraiment perdu : tout commit référencé reste ~90 jours dans le reflog. Premier réflexe après une commande destructrice.`,
            en: `Almost nothing is truly lost: any referenced commit stays ~90 days in the reflog. First reflex after a destructive command.`,
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
  ],
};
