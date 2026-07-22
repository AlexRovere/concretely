/**
 * Cheatsheet Linux — les commandes essentielles, triées par usage quotidien.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'linux',
  lang: 'bash',
  sections: [
    {
      id: 'files',
      title: { fr: 'Fichiers & navigation', en: 'Files & navigation' },
      items: [
        {
          id: 'lx-ls',
          title: { fr: 'Lister avec ls -lah', en: 'List with ls -lah' },
          code: `ls -lah            # -l détails, -a fichiers cachés, -h tailles lisibles
ls -lt             # trié par date de modif (le plus récent en haut)
ls -lS             # trié par taille
ls -d */           # seulement les dossiers`,
          note: {
            fr: `Le trio -lah est le réflexe quotidien : permissions, propriétaire, taille humaine et fichiers cachés (ceux qui commencent par un point) d'un coup d'œil.`,
            en: `The -lah trio is the daily reflex: permissions, owner, human-readable size and hidden files (the ones starting with a dot) at a glance.`,
          },
        },
        {
          id: 'lx-cd',
          title: { fr: 'Naviguer avec cd', en: 'Navigate with cd' },
          code: `cd /var/log        # chemin absolu
cd ..              # remonter d'un niveau
cd -               # revenir au dossier PRÉCÉDENT (super pratique)
cd                 # sans argument = retour au home (~)
pwd                # où suis-je ?`,
          note: {
            fr: `cd - bascule entre les deux derniers dossiers visités : idéal pour faire des allers-retours entre deux projets. pwd affiche le chemin absolu courant.`,
            en: `cd - toggles between the two last visited directories: ideal for jumping back and forth between two projects. pwd prints the current absolute path.`,
          },
        },
        {
          id: 'lx-mkdir-touch',
          title: { fr: 'Créer : mkdir -p & touch', en: 'Create: mkdir -p & touch' },
          code: `mkdir -p src/components/ui   # crée TOUTE la hiérarchie d'un coup
touch notes.md               # crée un fichier vide (ou met à jour sa date)
mkdir projet && cd projet    # créer puis entrer`,
          note: {
            fr: `Sans -p, mkdir échoue si le dossier parent n'existe pas. Avec -p, il crée toute l'arborescence et ne râle pas si elle existe déjà : toujours le mettre.`,
            en: `Without -p, mkdir fails if the parent directory does not exist. With -p it creates the whole tree and stays silent if it already exists: always use it.`,
          },
        },
        {
          id: 'lx-cp-mv',
          title: { fr: 'Copier & déplacer : cp / mv', en: 'Copy & move: cp / mv' },
          code: `cp fichier.txt sauvegarde.txt   # copier un fichier
cp -r dossier/ /tmp/backup/     # -r obligatoire pour un dossier
mv ancien.txt nouveau.txt       # déplacer = aussi renommer
mv *.log archives/              # déplacer par motif
cp -i source.txt cible.txt      # -i demande avant d'écraser`,
          note: {
            fr: `mv sert à la fois à déplacer et à renommer : c'est la même opération pour le système. Attention, cp et mv écrasent la cible sans prévenir — -i ajoute une confirmation.`,
            en: `mv both moves and renames: it is the same operation for the system. Beware, cp and mv overwrite the target without warning — -i adds a confirmation prompt.`,
          },
        },
        {
          id: 'lx-rm',
          title: { fr: 'Supprimer : rm (danger)', en: 'Delete: rm (danger)' },
          code: `rm fichier.txt        # supprimer un fichier
rm -r dossier/        # supprimer un dossier et son contenu
rm -rf node_modules/  # -f = sans confirmation… AUCUN retour en arrière
rm -i *.tmp           # -i demande pour chaque fichier`,
          note: {
            fr: `Il n'y a PAS de corbeille : rm -rf supprime immédiatement et définitivement. Relisez deux fois la commande, surtout avec des variables (rm -rf $DIR/ avec $DIR vide = catastrophe).`,
            en: `There is NO trash bin: rm -rf deletes immediately and permanently. Read the command twice, especially with variables (rm -rf $DIR/ with an empty $DIR is a disaster).`,
          },
        },
        {
          id: 'lx-ln-tree',
          title: { fr: 'Liens symboliques & tree', en: 'Symlinks & tree' },
          code: `ln -s /opt/app/config.yml ~/config.yml  # lien symbolique (raccourci)
ls -l ~/config.yml                      # affiche -> la cible
readlink -f ~/config.yml                # résout le chemin réel
tree -L 2                               # arborescence, profondeur 2
tree -a -I node_modules                 # cachés inclus, ignore un dossier`,
          note: {
            fr: `Ordre de ln -s : la CIBLE d'abord, le lien ensuite (comme cp source destination). tree visualise la structure d'un projet — -L limite la profondeur pour rester lisible.`,
            en: `ln -s argument order: TARGET first, link second (like cp source destination). tree visualizes a project structure — -L limits the depth to keep it readable.`,
          },
        },
      ],
    },
    {
      id: 'lx-packages',
      title: { fr: 'Gestion de paquets', en: 'Package management' },
      items: [
        {
          id: 'lx-pkg-install-remove',
          title: { fr: 'Installer / supprimer un paquet', en: 'Install / remove a package' },
          code: `sudo apt install ripgrep      # Debian/Ubuntu
sudo dnf install ripgrep      # Fedora/RHEL récents
sudo apt remove ripgrep       # supprime le paquet, garde la config
sudo apt purge ripgrep        # supprime aussi les fichiers de config`,
          note: {
            fr: `apt (Debian/Ubuntu) et dnf (Fedora/RHEL, successeur de yum) sont les deux gestionnaires les plus courants ; les commandes se ressemblent mais les noms de paquets diffèrent parfois d'une distribution à l'autre. remove garde la config résiduelle, purge fait place nette.`,
            en: `apt (Debian/Ubuntu) and dnf (Fedora/RHEL, yum's successor) are the two most common managers; commands look similar but package names sometimes differ between distros. remove keeps leftover config, purge wipes everything.`,
          },
        },
        {
          id: 'lx-pkg-update-upgrade',
          title: { fr: 'Mettre à jour le système', en: 'Update the system' },
          code: `sudo apt update && sudo apt upgrade   # rafraîchit la liste, puis met à jour
sudo apt autoremove                   # nettoie les dépendances orphelines
sudo dnf upgrade --refresh            # équivalent dnf en une commande`,
          note: {
            fr: `apt update ne met rien à jour : il télécharge juste la liste des versions disponibles ; apt upgrade installe ensuite les nouvelles versions. Oublier update fait upgrader avec une liste périmée — le duo va toujours ensemble.`,
            en: `apt update doesn't upgrade anything: it just downloads the list of available versions; apt upgrade then installs the new versions. Forgetting update means upgrading against a stale list — the pair always goes together.`,
          },
        },
        {
          id: 'lx-pkg-query',
          title: { fr: 'Chercher et lister les paquets installés', en: 'Search and list installed packages' },
          code: `apt list --installed | grep nginx    # Debian/Ubuntu : paquets installés
dpkg -L nginx                        # quels fichiers appartiennent au paquet
rpm -qa | grep nginx                 # équivalent Red Hat/Fedora
apt show nginx                       # description, version, dépendances`,
          note: {
            fr: `dpkg/rpm répondent à « quel paquet possède ce fichier » ou « ce paquet est-il installé », en dessous du gestionnaire de haut niveau (apt/dnf) qui gère lui les dépendances et les dépôts distants. Utile pour diagnostiquer un binaire qui semble venir de nulle part.`,
            en: `dpkg/rpm answer "which package owns this file" or "is this package installed", underneath the higher-level manager (apt/dnf) that handles dependencies and remote repositories. Useful for tracking down a binary that seems to come from nowhere.`,
          },
        },
      ],
    },
    {
      id: 'search',
      title: { fr: 'Chercher', en: 'Search' },
      items: [
        {
          id: 'lx-grep',
          title: { fr: 'grep -rni : chercher dans le contenu', en: 'grep -rni: search file contents' },
          code: `grep -rni "todo" src/        # -r récursif, -n n° de ligne, -i insensible à la casse
grep -rl "import vue" src/   # -l : seulement les NOMS de fichiers
grep -v "^#" config.conf     # -v inverse : lignes SANS le motif
grep -C 2 "error" app.log    # -C 2 : 2 lignes de contexte autour`,
          note: {
            fr: `grep -rni est LA commande pour retrouver du code. -l liste juste les fichiers, -v filtre (très utilisé pour virer les commentaires), -C donne le contexte autour du match.`,
            en: `grep -rni is THE command to find code. -l only lists files, -v filters out (very common to drop comments), -C shows the context around the match.`,
          },
        },
        {
          id: 'lx-find-name',
          title: { fr: 'find : chercher des fichiers', en: 'find: search for files' },
          code: `find . -name "*.log"          # par nom (motif entre guillemets !)
find . -type d -name "test*"  # -type d dossiers, f fichiers
find /var/log -mtime -7       # modifiés il y a moins de 7 jours
find . -size +100M            # plus gros que 100 Mo`,
          note: {
            fr: `find cherche par NOM/attributs là où grep cherche dans le CONTENU. Mettez le motif entre guillemets sinon le shell l'expanse avant que find le voie. Les outils modernes fd et rg (ripgrep) font la même chose, plus vite et en ignorant .gitignore.`,
            en: `find searches by NAME/attributes while grep searches CONTENT. Quote the pattern, otherwise the shell expands it before find ever sees it. The modern tools fd and rg (ripgrep) do the same, faster and honoring .gitignore.`,
          },
        },
        {
          id: 'lx-find-exec',
          title: { fr: 'find -exec : agir sur les résultats', en: 'find -exec: act on results' },
          code: `find . -name "*.tmp" -delete                  # supprimer les matchs
find . -name "*.sh" -exec chmod +x {} \\;      # {} = le fichier, \\; termine
find . -name "*.log" -exec grep -l "ERROR" {} +  # + groupe les appels (plus rapide)`,
          note: {
            fr: `-exec lance une commande sur chaque résultat : {} est remplacé par le chemin. Terminer par \\; exécute une fois par fichier, + regroupe en un seul appel (bien plus rapide).`,
            en: `-exec runs a command on each result: {} is replaced by the path. Ending with \\; runs once per file, + batches them into a single call (much faster).`,
          },
        },
        {
          id: 'lx-which',
          title: { fr: 'Où est cette commande ? which / type', en: 'Where is that command? which / type' },
          code: `which python3        # chemin de l'exécutable trouvé dans le PATH
type ll              # révèle aussi les alias et fonctions shell
type -a python       # TOUTES les versions dans le PATH
command -v node      # version portable (scripts)`,
          note: {
            fr: `which ne voit que les exécutables du PATH ; type révèle aussi les alias et builtins — utile quand une commande ne se comporte pas comme prévu. type -a liste les doublons du PATH.`,
            en: `which only sees executables on the PATH; type also reveals aliases and builtins — useful when a command misbehaves. type -a lists PATH duplicates.`,
          },
        },
        {
          id: 'lx-man-discovery',
          title: { fr: 'man, --help, apropos : découvrir une commande', en: 'man, --help, apropos: discover a command' },
          code: `man tar                # manuel complet, / pour chercher dedans, q pour quitter
tar --help              # résumé rapide des options
apropos "compress"      # cherche une commande par MOT-CLÉ de description
man -k partition         # équivalent de apropos`,
          note: {
            fr: `man est la doc de référence (souvent longue), --help un pense-bête rapide propre à chaque outil. apropos cherche par mot-clé quand on ne connaît pas le nom exact de la commande — le réflexe avant de chercher sur le web.`,
            en: `man is the reference doc (often long), --help a quick per-tool cheat sheet. apropos searches by keyword when you don't know the exact command name — the reflex before reaching for the web.`,
          },
        },
      ],
    },
    {
      id: 'text',
      title: { fr: 'Manipuler du texte', en: 'Text manipulation' },
      items: [
        {
          id: 'lx-cat-less-tail',
          title: { fr: 'Lire : cat, less, head, tail -f', en: 'Read: cat, less, head, tail -f' },
          code: `cat config.yml          # tout afficher (petits fichiers)
less app.log            # paginer : / pour chercher, q pour quitter
head -n 20 data.csv     # les 20 premières lignes
tail -n 50 app.log      # les 50 dernières
tail -f app.log         # SUIVRE le fichier en direct (logs !)`,
          note: {
            fr: `cat pour les petits fichiers, less pour les gros (il ne charge pas tout en mémoire). tail -f est le réflexe pour regarder des logs arriver en temps réel — Ctrl-C pour arrêter.`,
            en: `cat for small files, less for big ones (it does not load everything in memory). tail -f is the go-to for watching logs arrive in real time — Ctrl-C to stop.`,
          },
        },
        {
          id: 'lx-sed',
          title: { fr: 'sed : chercher-remplacer', en: 'sed: search & replace' },
          code: `sed 's/http:/https:/' urls.txt      # remplace la 1re occurrence par ligne
sed 's/http:/https:/g' urls.txt     # g = TOUTES les occurrences
sed -i 's/v1/v2/g' config.yml       # -i modifie le fichier EN PLACE
sed -n '10,20p' gros.log            # afficher les lignes 10 à 20`,
          note: {
            fr: `La syntaxe s/motif/remplacement/ est la même que dans vim. Sans g, seule la première occurrence de chaque ligne est remplacée. -i écrit dans le fichier : testez sans -i d'abord.`,
            en: `The s/pattern/replacement/ syntax is the same as in vim. Without g only the first occurrence per line is replaced. -i writes into the file: test without -i first.`,
          },
        },
        {
          id: 'lx-awk',
          title: { fr: 'awk : extraire des colonnes', en: 'awk: extract columns' },
          code: `awk '{print $1}' access.log          # 1re colonne (séparateur = espaces)
awk -F: '{print $1}' /etc/passwd     # -F change le séparateur
ps aux | awk '$3 > 50 {print $11}'   # commandes qui mangent > 50% CPU
awk '{s+=$2} END {print s}' ventes.txt  # somme de la colonne 2`,
          note: {
            fr: `awk découpe chaque ligne en colonnes ($1, $2…, $0 = la ligne entière) et peut filtrer et calculer. Pour de l'extraction de colonnes dans un pipe, c'est l'outil de référence.`,
            en: `awk splits each line into columns ($1, $2…, $0 = the whole line) and can filter and compute. For column extraction in a pipe, it is the reference tool.`,
          },
        },
        {
          id: 'lx-sort-uniq',
          title: { fr: 'sort | uniq : compter & dédupliquer', en: 'sort | uniq: count & dedupe' },
          code: `sort noms.txt | uniq                 # dédupliquer (uniq exige du trié !)
sort noms.txt | uniq -c | sort -rn   # compter puis trier par fréquence
sort -n tailles.txt                  # -n tri NUMÉRIQUE (sinon 10 < 9)
sort -t: -k3 -n /etc/passwd          # trier sur la colonne 3, séparateur :`,
          note: {
            fr: `Piège classique : uniq ne supprime que les doublons ADJACENTS, il faut donc trier avant. Le combo sort | uniq -c | sort -rn est le "top N" instantané (IPs, erreurs, URLs…).`,
            en: `Classic gotcha: uniq only removes ADJACENT duplicates, so you must sort first. The sort | uniq -c | sort -rn combo is the instant "top N" (IPs, errors, URLs…).`,
          },
        },
        {
          id: 'lx-cut-wc-tr',
          title: { fr: 'cut, wc, tr : la boîte à outils', en: 'cut, wc, tr: the toolbox' },
          code: `cut -d, -f1,3 data.csv      # colonnes 1 et 3 d'un CSV
wc -l app.log               # compter les LIGNES
grep -c "ERROR" app.log     # (grep -c compte aussi)
tr 'a-z' 'A-Z' < notes.txt  # minuscules -> majuscules
tr -d '\\r' < windows.txt > unix.txt  # virer les retours chariot Windows`,
          note: {
            fr: `cut est un awk simplifié pour les séparateurs simples. wc -l répond à "combien ?" dans un pipe. tr -d '\\r' répare les fichiers Windows (CRLF) qui cassent les scripts.`,
            en: `cut is a simplified awk for simple delimiters. wc -l answers "how many?" in a pipe. tr -d '\\r' fixes Windows files (CRLF) that break scripts.`,
          },
        },
        {
          id: 'lx-diff',
          title: { fr: 'diff : comparer deux fichiers', en: 'diff: compare two files' },
          code: `diff config.old config.new        # différences brutes
diff -u config.old config.new     # format unifié (comme git diff)
diff -r dossier_a/ dossier_b/     # comparer deux dossiers
diff <(sort a.txt) <(sort b.txt)  # comparer des SORTIES de commandes`,
          note: {
            fr: `-u donne le format avec + et - que tout le monde connaît via git. L'astuce <(commande) (process substitution) permet de comparer des résultats de commandes sans fichiers temporaires.`,
            en: `-u gives the +/- format everyone knows from git. The <(command) trick (process substitution) lets you compare command outputs without temp files.`,
          },
        },
      ],
    },
    {
      id: 'process',
      title: { fr: 'Processus & système', en: 'Processes & system' },
      items: [
        {
          id: 'lx-ps-top',
          title: { fr: 'Voir les processus : ps & top', en: 'See processes: ps & top' },
          code: `ps aux | grep node     # trouver un processus (PID en colonne 2)
ps aux --sort=-%mem | head  # top 10 mangeurs de mémoire
top                    # vue temps réel (q pour quitter)
htop                   # version moderne : tri, recherche, kill au clavier
pgrep -f "python app"  # juste le PID, directement`,
          note: {
            fr: `ps aux liste tout ; on pipe dans grep pour retrouver un PID. htop (à installer) est bien plus confortable que top. pgrep évite le grep manuel quand on ne veut que le PID.`,
            en: `ps aux lists everything; pipe into grep to find a PID. htop (to be installed) is far more comfortable than top. pgrep skips the manual grep when you only want the PID.`,
          },
        },
        {
          id: 'lx-kill',
          title: { fr: 'kill : -15 d\'abord, -9 ensuite', en: 'kill: -15 first, -9 last' },
          code: `kill 4242          # SIGTERM (-15 par défaut) : demande poliment d'arrêter
kill -9 4242       # SIGKILL : tue NET, sans nettoyage possible
killall node       # tous les processus de ce nom
pkill -f "npm run dev"  # par motif sur la ligne de commande`,
          note: {
            fr: `Toujours essayer kill (SIGTERM) d'abord : le processus peut fermer ses fichiers et sauver son état. kill -9 est le dernier recours — le processus ne peut rien intercepter, risque de données corrompues.`,
            en: `Always try plain kill (SIGTERM) first: the process can close its files and save state. kill -9 is the last resort — the process cannot intercept it, with a risk of corrupted data.`,
          },
        },
        {
          id: 'lx-jobs',
          title: { fr: 'Jobs : Ctrl-Z, bg, fg', en: 'Jobs: Ctrl-Z, bg, fg' },
          code: `vim notes.md       # puis Ctrl-Z : suspend et rend la main
jobs               # lister les jobs suspendus/en fond
bg %1              # reprendre le job 1 EN ARRIÈRE-PLAN
fg %1              # le ramener au premier plan
sleep 60 &         # & : lancer directement en arrière-plan`,
          note: {
            fr: `Ctrl-Z suspend (il ne tue pas !) le processus courant. Le trio jobs/bg/fg permet de jongler entre un éditeur et le shell sans ouvrir un second terminal.`,
            en: `Ctrl-Z suspends (it does not kill!) the current process. The jobs/bg/fg trio lets you juggle between an editor and the shell without opening a second terminal.`,
          },
        },
        {
          id: 'lx-nohup',
          title: { fr: 'Survivre à la déconnexion : nohup', en: 'Survive logout: nohup' },
          code: `nohup ./serveur.sh &            # survit à la fermeture du terminal
nohup npm run build > build.log 2>&1 &  # avec les logs redirigés
disown %1                       # détacher un job déjà lancé
# alternative robuste : tmux ou screen (session persistante)`,
          note: {
            fr: `Un processus lancé avec & meurt quand on ferme le terminal (signal SIGHUP) ; nohup l'en protège. Pour du vrai long-terme, tmux/screen sont plus confortables : on retrouve sa session.`,
            en: `A process started with & dies when you close the terminal (SIGHUP signal); nohup shields it. For real long-running work, tmux/screen are nicer: you reattach to your session.`,
          },
        },
        {
          id: 'lx-systemctl',
          title: { fr: 'Services : systemctl & journalctl', en: 'Services: systemctl & journalctl' },
          code: `systemctl status nginx       # état, PID, dernières lignes de log
sudo systemctl restart nginx # redémarrer le service
sudo systemctl enable nginx  # lancer au démarrage de la machine
journalctl -u nginx -f       # suivre les logs du service en direct
journalctl -u nginx --since "1 hour ago"`,
          note: {
            fr: `systemctl gère les services systemd (status / start / stop / restart / enable). journalctl -u service -f est l'équivalent de tail -f pour les logs systemd — le réflexe quand un service plante.`,
            en: `systemctl manages systemd services (status / start / stop / restart / enable). journalctl -u service -f is the tail -f of systemd logs — the reflex when a service crashes.`,
          },
        },
        {
          id: 'lx-df-du-free',
          title: { fr: 'Disque & mémoire : df, du, free', en: 'Disk & memory: df, du, free' },
          code: `df -h                  # espace libre par partition (h = lisible)
du -sh node_modules/   # taille TOTALE d'un dossier
du -sh * | sort -rh | head   # les plus gros du dossier courant
free -h                # mémoire RAM utilisée / disponible
uname -a               # noyau, architecture, version`,
          note: {
            fr: `df répond à "le disque est-il plein ?", du à "qu'est-ce qui prend la place ?". Le combo du -sh * | sort -rh trouve le coupable en quelques secondes. free -h pour vérifier la RAM.`,
            en: `df answers "is the disk full?", du answers "what is taking the space?". The du -sh * | sort -rh combo finds the culprit in seconds. free -h checks the RAM.`,
          },
        },
      ],
    },
    {
      id: 'network',
      title: { fr: 'Réseau & transferts', en: 'Network & transfers' },
      items: [
        {
          id: 'lx-curl',
          title: { fr: 'curl : le couteau suisse HTTP', en: 'curl: the HTTP swiss army knife' },
          code: `curl https://api.example.com/users   # GET, affiche la réponse
curl -s https://api.example.com | jq .  # -s silencieux, parfait pour jq
curl -o fichier.zip https://exemple.com/f.zip  # -o sauvegarde dans un fichier
curl -I https://example.com          # -I : seulement les en-têtes (status !)`,
          note: {
            fr: `-s coupe la barre de progression (indispensable dans les scripts et avec jq), -I récupère juste les en-têtes pour vérifier un code 200/301/404. wget reste pratique pour télécharger (-c reprend un téléchargement coupé).`,
            en: `-s silences the progress bar (essential in scripts and with jq), -I fetches only the headers to check a 200/301/404 code. wget remains handy for downloads (-c resumes an interrupted one).`,
          },
        },
        {
          id: 'lx-curl-post',
          title: { fr: 'curl : POST & API', en: 'curl: POST & APIs' },
          code: `curl -X POST https://api.example.com/login \\
  -H "Content-Type: application/json" \\
  -d '{"user": "ada", "pass": "secret"}'
# avec un token :
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/me`,
          note: {
            fr: `-X choisit la méthode, -H ajoute un en-tête, -d envoie le corps (et implique POST). C'est l'outil de débogage d'API n°1 : reproduire une requête sans passer par le front.`,
            en: `-X picks the method, -H adds a header, -d sends the body (and implies POST). It is the #1 API debugging tool: replay a request without going through the front-end.`,
          },
        },
        {
          id: 'lx-ssh',
          title: { fr: 'ssh & clés : ssh-keygen, ssh-copy-id', en: 'ssh & keys: ssh-keygen, ssh-copy-id' },
          code: `ssh user@serveur.com            # se connecter
ssh -p 2222 user@serveur.com    # port non standard
ssh-keygen -t ed25519           # générer une paire de clés moderne
ssh-copy-id user@serveur.com    # installer sa clé publique là-bas
# ensuite : connexion sans mot de passe`,
          note: {
            fr: `Le duo ssh-keygen + ssh-copy-id supprime les mots de passe : la clé privée reste chez vous, la publique part sur le serveur. Un fichier ~/.ssh/config permet de taper juste "ssh prod" (Host, HostName, User, Port).`,
            en: `The ssh-keygen + ssh-copy-id duo kills passwords: the private key stays with you, the public one goes to the server. A ~/.ssh/config file lets you just type "ssh prod" (Host, HostName, User, Port).`,
          },
        },
        {
          id: 'lx-scp',
          title: { fr: 'scp : copier via SSH', en: 'scp: copy over SSH' },
          code: `scp rapport.pdf user@serveur:/tmp/      # local -> distant
scp user@serveur:/var/log/app.log .     # distant -> local
scp -r dossier/ user@serveur:~/backup/  # -r pour un dossier
scp -P 2222 fichier user@serveur:~/     # port : -P majuscule (piège !)`,
          note: {
            fr: `scp suit la même logique que cp : source puis destination, avec hôte:chemin pour le côté distant. Piège classique : le port est -P (majuscule) chez scp mais -p (minuscule) chez ssh.`,
            en: `scp follows the cp logic: source then destination, with host:path for the remote side. Classic gotcha: the port flag is -P (uppercase) for scp but -p (lowercase) for ssh.`,
          },
        },
        {
          id: 'lx-rsync',
          title: { fr: 'rsync -avz : la synchro intelligente', en: 'rsync -avz: smart sync' },
          code: `rsync -avz dossier/ user@serveur:/backup/   # archive, verbeux, compressé
rsync -avz --delete src/ dest/    # miroir exact (supprime en trop côté dest)
rsync -avzn src/ dest/            # -n : simulation (dry-run) d'abord !
# attention : "dossier/" copie le CONTENU, "dossier" copie le dossier`,
          note: {
            fr: `rsync ne transfère que ce qui a changé : bien plus rapide que scp pour re-synchroniser. Le slash final change tout (contenu vs dossier lui-même), et -n simule avant un --delete destructeur.`,
            en: `rsync only transfers what changed: much faster than scp for re-syncing. The trailing slash changes everything (contents vs the directory itself), and -n dry-runs before a destructive --delete.`,
          },
        },
        {
          id: 'lx-ports',
          title: { fr: 'Qui écoute sur ce port ? ss & lsof', en: 'Who listens on that port? ss & lsof' },
          code: `ss -tlnp               # ports TCP en écoute + processus
lsof -i :3000          # qui occupe le port 3000 ?
ping -c 4 example.com  # la machine répond-elle ? (-c limite à 4)
curl -I localhost:8080 # le serveur HTTP local répond-il ?`,
          note: {
            fr: `ss -tlnp (t TCP, l listening, n ports numériques, p processus) est le remplaçant moderne de netstat. lsof -i :port répond à l'éternel "address already in use" : on trouve le PID et on le tue.`,
            en: `ss -tlnp (t TCP, l listening, n numeric ports, p process) is the modern replacement for netstat. lsof -i :port answers the eternal "address already in use": find the PID and kill it.`,
          },
        },
        {
          id: 'lx-ip-addr-route',
          title: { fr: "ip addr / ip route : le remplaçant d'ifconfig", en: "ip addr / ip route: ifconfig's replacement" },
          code: `ip addr show               # (ip a) : interfaces et adresses IP
ip route show               # (ip r) : table de routage, passerelle par défaut
ip link set eth0 up         # activer une interface
ip -c a                     # coloré, plus lisible`,
          note: {
            fr: `ifconfig et route sont dépréciés depuis longtemps (paquet net-tools plus toujours installé par défaut) ; ip (paquet iproute2) fait tout en une syntaxe cohérente et gère aussi les namespaces réseau et les règles avancées.`,
            en: `ifconfig and route have long been deprecated (net-tools isn't always installed by default anymore); ip (the iproute2 package) does it all in one consistent syntax and also handles network namespaces and advanced rules.`,
          },
        },
      ],
    },
    {
      id: 'perms',
      title: { fr: 'Permissions & utilisateurs', en: 'Permissions & users' },
      items: [
        {
          id: 'lx-chmod',
          title: { fr: 'chmod : 755, u+x et compagnie', en: 'chmod: 755, u+x and friends' },
          code: `chmod +x script.sh      # rendre exécutable (le cas n°1)
chmod 755 script.sh     # rwx r-x r-x : proprio tout, les autres lisent/exécutent
chmod 600 ~/.ssh/id_ed25519  # rw- --- --- : clé privée, proprio seul
chmod u+x,g-w fichier   # symbolique : u proprio, g groupe, o autres
chmod -R 755 public/    # récursif`,
          note: {
            fr: `Chaque chiffre = r(4) + w(2) + x(1) pour proprio/groupe/autres : 755 = 7(rwx) 5(r-x) 5(r-x). SSH refuse une clé privée plus ouverte que 600 — c'est l'erreur "permissions too open".`,
            en: `Each digit = r(4) + w(2) + x(1) for owner/group/others: 755 = 7(rwx) 5(r-x) 5(r-x). SSH rejects a private key more open than 600 — that is the "permissions too open" error.`,
          },
        },
        {
          id: 'lx-chown',
          title: { fr: 'chown : changer le propriétaire', en: 'chown: change the owner' },
          code: `sudo chown ada fichier.txt         # changer le propriétaire
sudo chown ada:devs fichier.txt    # propriétaire ET groupe
sudo chown -R www-data:www-data /var/www/app  # récursif (cas serveur web)
ls -l                              # vérifier : colonne 3 = proprio, 4 = groupe`,
          note: {
            fr: `Cas typique : après un déploiement, le serveur web (www-data, nginx…) doit posséder les fichiers pour pouvoir les écrire. chown demande presque toujours sudo.`,
            en: `Typical case: after a deploy, the web server (www-data, nginx…) must own the files to write them. chown almost always requires sudo.`,
          },
        },
        {
          id: 'lx-sudo',
          title: { fr: 'sudo & le magique sudo !!', en: 'sudo & the magic sudo !!' },
          code: `sudo systemctl restart nginx   # exécuter en root
apt update                     # "Permission denied"…
sudo !!                        # rejoue la DERNIÈRE commande avec sudo
sudo -u postgres psql          # agir en tant qu'un AUTRE utilisateur
sudo -i                        # ouvrir un shell root complet`,
          note: {
            fr: `sudo !! est le réflexe quand on a oublié sudo : !! est remplacé par la commande précédente. sudo -u permet d'agir comme un utilisateur de service (postgres, www-data) sans connaître son mot de passe.`,
            en: `sudo !! is the reflex after forgetting sudo: !! expands to the previous command. sudo -u lets you act as a service user (postgres, www-data) without knowing its password.`,
          },
        },
        {
          id: 'lx-id-umask',
          title: { fr: 'id, groups, umask & setuid', en: 'id, groups, umask & setuid' },
          code: `id                  # uid, gid et tous les groupes
groups              # juste les groupes
sudo usermod -aG docker ada   # ajouter au groupe docker (-a IMPORTANT)
umask               # masque des permissions par défaut (souvent 022)
ls -l /usr/bin/passwd  # -rwsr-xr-x : le "s" = setuid (s'exécute en root)`,
          note: {
            fr: `usermod -aG : sans -a, on ÉCRASE les groupes existants ! Le changement de groupe ne prend effet qu'à la reconnexion. umask 022 explique pourquoi les fichiers naissent en 644 et les dossiers en 755. Le bit setuid (s) fait tourner un programme avec les droits de son propriétaire — c'est ainsi que passwd modifie /etc/shadow.`,
            en: `usermod -aG: without -a you OVERWRITE the existing groups! Group changes only apply after re-login. umask 022 explains why files are born 644 and directories 755. The setuid bit (s) runs a program with its owner's rights — that is how passwd edits /etc/shadow.`,
          },
        },
      ],
    },
    {
      id: 'shell',
      title: { fr: 'Pipes, redirections & astuces', en: 'Pipes, redirections & tricks' },
      items: [
        {
          id: 'lx-pipes-redirect',
          title: { fr: 'Pipes & redirections : | > >> 2>&1', en: 'Pipes & redirections: | > >> 2>&1' },
          code: `ps aux | grep node | wc -l      # | : la sortie devient l'entrée du suivant
echo "ligne" > fichier.txt      # > ÉCRASE le fichier
echo "encore" >> fichier.txt    # >> AJOUTE à la fin
npm run build > build.log 2>&1  # stdout ET stderr dans le fichier
commande 2> erreurs.log         # seulement les erreurs
commande | tee sortie.log       # afficher ET sauvegarder en même temps`,
          note: {
            fr: `Toute la philosophie Unix : de petits outils branchés par des pipes. 2>&1 redirige stderr (flux 2) vers stdout (flux 1) — sans lui, les erreurs échappent au fichier de log. tee duplique le flux : écran + fichier.`,
            en: `The whole Unix philosophy: small tools plugged together with pipes. 2>&1 redirects stderr (stream 2) to stdout (stream 1) — without it, errors escape the log file. tee duplicates the stream: screen + file.`,
          },
        },
        {
          id: 'lx-xargs',
          title: { fr: 'xargs : du texte vers des arguments', en: 'xargs: text into arguments' },
          code: `cat fichiers.txt | xargs rm           # chaque ligne devient un argument
find . -name "*.log" -print0 | xargs -0 rm  # -0 : sûr avec les espaces
echo "a b c" | xargs -n1 echo "item:" # -n1 : un appel par argument
cat urls.txt | xargs -P4 -n1 curl -sO # -P4 : 4 téléchargements en parallèle`,
          note: {
            fr: `xargs transforme un flux de texte en arguments de commande — le pont entre un pipe et une commande qui ne lit pas stdin. Le duo -print0 / -0 est obligatoire dès que des noms contiennent des espaces.`,
            en: `xargs turns a text stream into command arguments — the bridge between a pipe and a command that does not read stdin. The -print0 / -0 duo is mandatory as soon as names contain spaces.`,
          },
        },
        {
          id: 'lx-subst-chain',
          title: { fr: '$(...), && et ||', en: '$(...), && and ||' },
          code: `echo "Nous sommes le $(date +%F)"     # $() insère la sortie d'une commande
cd $(git rev-parse --show-toplevel)   # aller à la racine du repo
npm test && git push                  # push SEULEMENT si les tests passent
grep -q "TODO" src/*.js || echo "rien à faire"  # si échec, alors…
mkdir -p build && cd build            # enchaînement classique`,
          note: {
            fr: `&& exécute la suite seulement en cas de succès (code retour 0), || seulement en cas d'échec. $(...) (substitution de commande) injecte un résultat dans une autre commande — préférez-le aux backticks.`,
            en: `&& runs the next command only on success (exit code 0), || only on failure. $(...) (command substitution) injects a result into another command — prefer it over backticks.`,
          },
        },
        {
          id: 'lx-history-alias',
          title: { fr: 'history, Ctrl-R & alias', en: 'history, Ctrl-R & aliases' },
          code: `history | grep ssh     # retrouver une vieille commande
# Ctrl-R puis taper : recherche INTERACTIVE dans l'historique
!42                    # rejouer la commande n°42 de l'historique
alias ll='ls -lah'     # raccourci (à mettre dans ~/.bashrc)
alias gs='git status'
unalias ll             # supprimer un alias`,
          note: {
            fr: `Ctrl-R est probablement le raccourci le plus rentable du shell : on retape rarement une longue commande. Les alias vivent dans ~/.bashrc (ou ~/.zshrc) — rechargez avec "source ~/.bashrc".`,
            en: `Ctrl-R is probably the highest-ROI shell shortcut: you rarely retype a long command. Aliases live in ~/.bashrc (or ~/.zshrc) — reload with "source ~/.bashrc".`,
          },
        },
        {
          id: 'lx-env-vars',
          title: { fr: 'Variables d\'environnement & export', en: 'Environment variables & export' },
          code: `echo $HOME $PATH        # lire des variables
MA_VAR="test"           # variable LOCALE au shell
export API_KEY="xyz"    # exportée : visible des processus enfants
API_URL=http://localhost:3000 npm run dev  # juste pour CETTE commande
env | grep -i proxy     # lister l'environnement
printenv PATH           # une variable précise`,
          note: {
            fr: `Sans export, la variable n'est pas transmise aux programmes lancés depuis le shell. Le préfixe VAR=valeur commande définit la variable pour cette seule exécution — parfait pour tester une config.`,
            en: `Without export, the variable is not passed to programs launched from the shell. The VAR=value command prefix sets the variable for that single run — perfect for testing a config.`,
          },
        },
        {
          id: 'lx-crontab',
          title: { fr: 'crontab : planifier des tâches', en: 'crontab: schedule tasks' },
          code: `crontab -e             # éditer SES tâches planifiées
crontab -l             # les lister
# min heure jour mois jour_semaine commande
0 3 * * *  /home/ada/backup.sh        # tous les jours à 3h00
*/15 * * * * curl -s https://site.com/ping  # toutes les 15 min
0 9 * * 1  /home/ada/rapport.sh       # le lundi à 9h`,
          note: {
            fr: `Les 5 champs : minute, heure, jour du mois, mois, jour de semaine (0 = dimanche). Pièges classiques : cron a un PATH minimal (utilisez des chemins absolus) et n'affiche rien — redirigez vers un fichier de log.`,
            en: `The 5 fields: minute, hour, day of month, month, weekday (0 = Sunday). Classic gotchas: cron has a minimal PATH (use absolute paths) and shows nothing — redirect output to a log file.`,
          },
        },
        {
          id: 'lx-heredoc',
          title: { fr: 'Here-doc : injecter du texte multi-ligne', en: 'Here-doc: feed in multi-line text' },
          code: `cat <<EOF > config.yml
host: localhost
port: 8080
EOF
psql -U postgres <<SQL
SELECT COUNT(*) FROM users;
SQL`,
          note: {
            fr: `<<EOF ouvre un bloc de texte littéral jusqu'au marqueur de fin (EOF est une convention, n'importe quel mot fonctionne) : pratique pour générer un fichier ou envoyer plusieurs commandes à un programme interactif sans fichier temporaire. <<-EOF (avec un tiret) autorise l'indentation par tabulations.`,
            en: `<<EOF opens a literal text block until the end marker (EOF is just a convention, any word works): handy for generating a file or feeding several commands to an interactive program without a temp file. <<-EOF (with a dash) allows tab-indentation.`,
          },
        },
      ],
    },
    {
      id: 'archive',
      title: { fr: 'Archives & disque', en: 'Archives & disk' },
      items: [
        {
          id: 'lx-tar',
          title: { fr: 'tar : créer & extraire', en: 'tar: create & extract' },
          code: `tar -czf projet.tar.gz projet/   # Créer un Zip (gz) vers le Fichier
tar -xzf projet.tar.gz           # eXtraire Ze Files (le mnémonique !)
tar -tzf projet.tar.gz           # -t : lister SANS extraire
tar -xzf archive.tar.gz -C /tmp/ # -C : extraire AILLEURS`,
          note: {
            fr: `Mnémoniques : -czf = Compresser Ze Fichier, -xzf = eXtract Ze Files. -f doit être juste avant le nom du fichier. Toujours faire -t avant d'extraire une archive inconnue : certaines explosent leurs fichiers en vrac dans le dossier courant ("tarbomb").`,
            en: `Mnemonics: -czf = Compress Ze File, -xzf = eXtract Ze Files. -f must come right before the file name. Always run -t before extracting an unknown archive: some dump their files loose into the current directory ("tarbomb").`,
          },
        },
        {
          id: 'lx-zip-gzip',
          title: { fr: 'zip, unzip & gzip', en: 'zip, unzip & gzip' },
          code: `zip -r projet.zip projet/      # -r : récursif (sinon dossier vide !)
unzip projet.zip -d /tmp/       # -d : destination
unzip -l projet.zip             # lister sans extraire
gzip gros.log                   # -> gros.log.gz (REMPLACE l'original)
gunzip gros.log.gz              # décompresser
zcat gros.log.gz | grep ERROR   # lire sans décompresser sur disque`,
          note: {
            fr: `zip est le format d'échange avec Windows ; tar.gz le standard Unix. Attention : gzip remplace le fichier original (gzip -k le garde). zcat/zgrep lisent les .gz directement, sans toucher au disque.`,
            en: `zip is the exchange format with Windows; tar.gz is the Unix standard. Beware: gzip replaces the original file (gzip -k keeps it). zcat/zgrep read .gz files directly, without touching the disk.`,
          },
        },
        {
          id: 'lx-dd',
          title: { fr: 'dd : puissant et dangereux', en: 'dd: powerful and dangerous' },
          code: `# graver une ISO sur une clé USB (VÉRIFIER le disque avec lsblk !)
sudo dd if=debian.iso of=/dev/sdb bs=4M status=progress
# if = source, of = destination — les inverser détruit la source
dd if=/dev/zero of=test.img bs=1M count=100  # fichier de 100 Mo`,
          note: {
            fr: `dd écrit octet par octet, sans aucune confirmation : un of=/dev/sda au lieu de sdb efface votre disque système — d'où son surnom "disk destroyer". Toujours vérifier la cible avec lsblk juste avant.`,
            en: `dd writes byte by byte with zero confirmation: an of=/dev/sda instead of sdb wipes your system disk — hence its nickname "disk destroyer". Always double-check the target with lsblk right before.`,
          },
        },
        {
          id: 'lx-mount-lsblk',
          title: { fr: 'mount & lsblk : les disques', en: 'mount & lsblk: disks' },
          code: `lsblk                          # arbre des disques et partitions
sudo mount /dev/sdb1 /mnt/usb  # monter une partition sur un dossier
df -h /mnt/usb                 # vérifier qu'elle est bien montée
sudo umount /mnt/usb           # démonter AVANT de débrancher
# umount (sans n !) — "device is busy" ? lsof +D /mnt/usb`,
          note: {
            fr: `Sous Linux, un disque n'est utilisable qu'une fois monté sur un dossier. lsblk montre qui est quoi (sda, sdb1…). Démontez toujours avant de débrancher, sinon données corrompues — et c'est umount, pas unmount.`,
            en: `On Linux a disk is only usable once mounted onto a directory. lsblk shows what is what (sda, sdb1…). Always unmount before unplugging or you corrupt data — and it is umount, not unmount.`,
          },
        },
      ],
    },
    {
      id: 'lx-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'lx-bp-quote-variables',
          title: { fr: 'Toujours guillemeter les variables', en: 'Always quote your variables' },
          code: `rm -rf "$DIR/"          # ✅ sûr même si $DIR est vide ou contient des espaces
rm -rf $DIR/            # ❌ si $DIR est vide : rm -rf /  (catastrophe)
for f in "$@"; do echo "$f"; done   # idem pour les arguments de script`,
          note: {
            fr: `Une variable non guillemetée subit le word-splitting et le globbing du shell : un $DIR vide ou contenant un espace transforme une commande anodine en désastre. Guillemeter systématiquement élimine toute une classe de bugs shell.`,
            en: `An unquoted variable is subject to word-splitting and globbing: an empty or space-containing $DIR turns a harmless command into a disaster. Quoting consistently eliminates an entire class of shell bugs.`,
          },
        },
        {
          id: 'lx-bp-set-euo-pipefail',
          title: { fr: 'set -euo pipefail dans tout script', en: 'set -euo pipefail in every script' },
          code: `#!/bin/bash
set -euo pipefail
# -e : arrête au 1er échec  -u : erreur si variable non définie
# -o pipefail : un pipe échoue si UN SEUL maillon échoue`,
          note: {
            fr: `Sans ces options, un script bash continue après une erreur silencieuse et un pipe réussit même si la première commande a planté. C'est la ligne la plus rentable d'un script shell.`,
            en: `Without these options, a bash script keeps going after a silent failure, and a pipe succeeds even if the first command crashed. It's the highest-ROI line in any shell script.`,
          },
        },
        {
          id: 'lx-bp-least-privilege',
          title: { fr: 'sudo ciblé, jamais un shell root permanent', en: 'Targeted sudo, never a permanent root shell' },
          code: `sudo systemctl restart nginx     # ✅ une commande précise, le temps qu'il faut
sudo -i                          # ⚠️ shell root ouvert : à éviter en usage courant`,
          note: {
            fr: `Rester en root en permanence supprime le garde-fou qui empêche une faute de frappe (rm, mv) de toucher tout le système. Préférer sudo commande par commande.`,
            en: `Staying root permanently removes the safety net that stops a typo (rm, mv) from touching the whole system. Prefer sudo per command.`,
          },
        },
        {
          id: 'lx-bp-dry-run-destructive',
          title: { fr: 'Simuler avant toute commande destructive', en: 'Dry-run before any destructive command' },
          code: `rsync -avzn src/ dest/     # -n : simulation, aucune écriture réelle
git clean -nd               # -n : montre ce qui serait supprimé
find . -name "*.bak" -print    # vérifier AVANT d'ajouter -delete`,
          note: {
            fr: `rm, rsync --delete, git clean, dd n'ont ni corbeille ni confirmation par défaut. Systématiser un passage en mode simulation avant la version destructive coûte 5 secondes et évite des heures de restauration.`,
            en: `rm, rsync --delete, git clean, dd have no trash bin and no default confirmation. Making a dry-run pass a habit before the destructive version costs 5 seconds and saves hours of restoring backups.`,
          },
        },
        {
          id: 'lx-bp-modern-tools',
          title: { fr: 'Préférer les outils modernes qui respectent .gitignore', en: 'Prefer modern tools that respect .gitignore' },
          code: `rg "TODO" src/          # ripgrep : plus rapide que grep, ignore .gitignore
fd "\\.log$"             # fd : plus rapide et lisible que find
bat config.yml           # bat : cat avec coloration syntaxique`,
          note: {
            fr: `grep/find restent universels, mais rg et fd sont nettement plus rapides sur un gros repo et ignorent automatiquement node_modules/.git, évitant du bruit dans les résultats.`,
            en: `grep/find remain universal, but rg and fd are noticeably faster on a large repo and automatically skip node_modules/.git, cutting noise out of results.`,
          },
        },
      ],
    },
  ],
};
