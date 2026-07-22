/**
 * Cheatsheet Système — comprendre et diagnostiquer (processus, mémoire, signaux).
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'os',
  lang: 'bash',
  sections: [
    {
      id: 'process',
      title: { fr: 'Processus', en: 'Processes' },
      items: [
        {
          id: 'os-proc-states',
          title: { fr: 'États : R, S, D, Z', en: 'States: R, S, D, Z' },
          code: `ps -eo pid,stat,comm | head
# R = en cours (Running), S = endormi interruptible
# D = endormi NON interruptible (attend l'I/O — kill inefficace)
# Z = zombie : terminé, mais le parent n'a pas lu son code retour
ps -eo stat,pid,comm | grep '^Z'   # lister les zombies`,
          note: {
            fr: `Un zombie ne consomme presque rien (juste une entrée dans la table) : il attend que son parent appelle wait(). On ne « tue » pas un zombie — il est déjà mort. On tue ou répare le parent.`,
            en: `A zombie consumes almost nothing (just a process-table entry): it waits for its parent to call wait(). You can't "kill" a zombie — it's already dead. Kill or fix the parent instead.`,
          },
        },
        {
          id: 'os-ps-ef-aux',
          title: { fr: 'ps -ef vs ps aux', en: 'ps -ef vs ps aux' },
          code: `ps -ef        # style System V : PID, PPID (parent), commande
ps aux        # style BSD : %CPU, %MEM, STAT, RSS
# Trier par mémoire ou CPU :
ps aux --sort=-%mem | head -5
ps aux --sort=-%cpu | head -5`,
          note: {
            fr: `Même liste, colonnes différentes : -ef montre le PPID (qui a lancé quoi), aux montre la consommation. Les deux syntaxes coexistent pour des raisons historiques (System V vs BSD).`,
            en: `Same list, different columns: -ef shows PPID (who launched what), aux shows resource usage. Both syntaxes coexist for historical reasons (System V vs BSD).`,
          },
        },
        {
          id: 'os-pstree',
          title: { fr: "pstree — l'arbre des processus", en: 'pstree — the process tree' },
          code: `pstree -p          # tout l'arbre avec les PID
pstree -p 1234     # le sous-arbre d'un processus
pstree -u utilisateur  # arbre d'un utilisateur
# Pratique pour voir quel parent a engendré quel enfant`,
          note: {
            fr: `Tout processus a un parent : pstree rend la hiérarchie visible. Indispensable pour comprendre pourquoi tuer un parent emporte (ou pas) ses enfants.`,
            en: `Every process has a parent: pstree makes the hierarchy visible. Essential to understand why killing a parent takes down (or not) its children.`,
          },
        },
        {
          id: 'os-proc-pid',
          title: { fr: '/proc/PID — radiographie', en: '/proc/PID — process X-ray' },
          code: `cat /proc/1234/cmdline | tr '\\0' ' '  # la commande exacte
grep -E 'State|VmRSS' /proc/1234/status # état + mémoire
ls -l /proc/1234/fd                     # fichiers/sockets ouverts
ls -l /proc/1234/cwd /proc/1234/exe     # répertoire courant, binaire`,
          note: {
            fr: `/proc est un pseudo-système de fichiers : le noyau y expose l'état de chaque processus en temps réel. ps, top et lsof ne font que lire ces fichiers.`,
            en: `/proc is a pseudo-filesystem: the kernel exposes each process's live state there. ps, top and lsof are just readers of these files.`,
          },
        },
        {
          id: 'os-nice',
          title: { fr: 'nice / renice — la priorité', en: 'nice / renice — priority' },
          code: `nice -n 19 ./gros_calcul.sh   # lancer en basse priorité
renice -n 10 -p 1234          # baisser un processus existant
# nice va de -20 (prioritaire) à 19 (poli)
# Monter la priorité (valeur négative) exige root`,
          note: {
            fr: `La « gentillesse » dit à l'ordonnanceur de céder le CPU aux autres. Un batch en nice 19 n'affame jamais le serveur web à côté. Sans effet sur l'I/O (voir ionice).`,
            en: `Niceness tells the scheduler to yield CPU to others. A batch job at nice 19 never starves the web server next to it. No effect on I/O (see ionice).`,
          },
        },
        {
          id: 'os-pid1-orphans',
          title: { fr: 'PID 1 et les orphelins', en: 'PID 1 and orphans' },
          code: `ps -p 1 -o comm=      # systemd (ou init) : le premier processus
# Quand un parent meurt avant son enfant, l'enfant est
# « réadopté » par le PID 1, qui fera le wait() à sa place
ps -eo pid,ppid,comm | awk '$2 == 1'  # processus adoptés par init`,
          note: {
            fr: `Le PID 1 est l'ancêtre de tout et le tuteur des orphelins : il récolte leurs codes retour, évitant les zombies. C'est pour ça qu'un mauvais PID 1 dans un conteneur accumule des zombies.`,
            en: `PID 1 is the ancestor of everything and the guardian of orphans: it reaps their exit codes, preventing zombies. That's why a bad PID 1 inside a container accumulates zombies.`,
          },
        },
      ],
    },
    {
      id: 'signals',
      title: { fr: 'Signaux', en: 'Signals' },
      items: [
        {
          id: 'os-signal-table',
          title: { fr: 'TERM, KILL, INT, HUP', en: 'TERM, KILL, INT, HUP' },
          code: `kill 1234          # SIGTERM (15) : « termine-toi proprement »
kill -INT 1234     # SIGINT (2) : équivalent de Ctrl+C
kill -HUP 1234     # SIGHUP (1) : terminal fermé / recharger la conf
kill -KILL 1234    # SIGKILL (9) : le noyau tue, pas d'appel
kill -USR1 1234    # SIGUSR1 : libre — souvent « affiche ton état »`,
          note: {
            fr: `Un signal est une notification asynchrone du noyau. TERM et INT peuvent être interceptés pour nettoyer ; KILL et STOP, jamais. Beaucoup de démons rechargent leur config sur HUP.`,
            en: `A signal is an asynchronous kernel notification. TERM and INT can be caught for cleanup; KILL and STOP never can. Many daemons reload their config on HUP.`,
          },
        },
        {
          id: 'os-trap',
          title: { fr: 'trap — intercepter dans un script', en: 'trap — catch in a script' },
          code: `#!/bin/bash
tmp=$(mktemp)
trap 'rm -f "$tmp"; echo "nettoyé"' EXIT   # toujours exécuté
trap 'echo "interrompu"; exit 130' INT TERM
# ... travail avec $tmp ...`,
          note: {
            fr: `trap exécute du code à la réception d'un signal. Le pseudo-signal EXIT garantit le nettoyage des fichiers temporaires, que le script finisse bien ou soit interrompu.`,
            en: `trap runs code when a signal arrives. The EXIT pseudo-signal guarantees temp-file cleanup whether the script finishes normally or gets interrupted.`,
          },
        },
        {
          id: 'os-kill-l',
          title: { fr: 'kill -l — la liste complète', en: 'kill -l — the full list' },
          code: `kill -l            # les ~64 signaux avec leurs numéros
kill -l 15         # TERM — traduire un numéro en nom
kill -l TERM       # 15 — et inversement
# Le code retour d'un processus tué = 128 + numéro du signal
# 137 = 128 + 9 → tué par SIGKILL (souvent l'OOM killer)`,
          note: {
            fr: `Un exit code 137 dans Docker ou CI signifie presque toujours SIGKILL — donc souvent l'OOM killer. 143 = SIGTERM, arrêt normal demandé. Savoir décoder ces codes évite des heures de débogage.`,
            en: `Exit code 137 in Docker or CI almost always means SIGKILL — hence often the OOM killer. 143 = SIGTERM, a normal shutdown request. Decoding these codes saves hours of debugging.`,
          },
        },
        {
          id: 'os-kill9-last',
          title: { fr: 'Pourquoi -9 en dernier recours', en: 'Why -9 is the last resort' },
          code: `kill 1234          # 1. TERM : laisser le temps de nettoyer
sleep 5            # 2. attendre un peu
kill -0 1234 2>/dev/null && kill -9 1234  # 3. KILL si encore là
# kill -0 n'envoie rien : teste juste si le processus existe`,
          note: {
            fr: `SIGKILL ne laisse aucune chance : fichiers non flushés, verrous non relâchés, enfants orphelins, transactions à moitié écrites. Et il est impuissant contre l'état D (attente I/O noyau).`,
            en: `SIGKILL gives no chance: unflushed files, unreleased locks, orphaned children, half-written transactions. And it's powerless against state D (kernel I/O wait).`,
          },
        },
        {
          id: 'os-nohup-disown',
          title: { fr: 'SIGHUP, nohup et disown', en: 'SIGHUP, nohup and disown' },
          code: `nohup ./long_travail.sh &   # ignore le HUP, sortie → nohup.out
./long_travail.sh &
disown -h %1                # déjà lancé : le détacher du shell
# Sans ça, fermer le terminal (SIGHUP) tue le processus`,
          note: {
            fr: `Quand le terminal se ferme, le shell envoie SIGHUP à ses jobs. nohup l'ignore dès le départ ; disown détache un job déjà lancé. tmux/screen restent la solution confortable.`,
            en: `When the terminal closes, the shell sends SIGHUP to its jobs. nohup ignores it upfront; disown detaches an already-running job. tmux/screen remain the comfortable option.`,
          },
        },
        {
          id: 'os-timeout',
          title: { fr: 'timeout — borner une commande', en: 'timeout — bound a command' },
          code: `timeout 30s curl -s https://api.example.com/health
timeout -k 10s 1m ./script.sh
# 1 min de TERM, puis KILL 10 s plus tard si toujours vivant
echo $?   # 124 = la commande a dépassé le délai`,
          note: {
            fr: `timeout envoie TERM à l'échéance, puis KILL après le délai de -k. Le code retour 124 signale le dépassement : parfait pour des scripts ou du CI qui ne doivent jamais bloquer.`,
            en: `timeout sends TERM at the deadline, then KILL after the -k grace period. Exit code 124 signals the timeout: perfect for scripts or CI that must never hang.`,
          },
        },
      ],
    },
    {
      id: 'memory',
      title: { fr: 'Mémoire', en: 'Memory' },
      items: [
        {
          id: 'os-free',
          title: { fr: 'free -h — lire « available »', en: 'free -h — read "available"' },
          code: `free -h
#               total   used   free   buff/cache   available
# La colonne à regarder : available, PAS free
# buff/cache = RAM « prêtée » au cache disque, rendue à la demande
cat /proc/meminfo | head -3   # la source brute`,
          note: {
            fr: `Linux utilise toute la RAM libre comme cache disque : « free » bas est normal et sain. « available » estime ce qu'une application peut vraiment obtenir sans swapper.`,
            en: `Linux uses all spare RAM as disk cache: a low "free" is normal and healthy. "available" estimates what an application can really get without swapping.`,
          },
        },
        {
          id: 'os-rss-vsz',
          title: { fr: 'RSS vs VSZ', en: 'RSS vs VSZ' },
          code: `ps -o pid,rss,vsz,comm -p 1234
# RSS = mémoire physique réellement utilisée (en RAM)
# VSZ = mémoire virtuelle réservée (souvent énorme, peu parlant)
ps aux --sort=-rss | head -5   # les vrais gros consommateurs`,
          note: {
            fr: `VSZ compte tout l'espace d'adressage (mappings, libs partagées, réservations jamais touchées). Pour savoir qui consomme la RAM, regarder le RSS — en gardant en tête qu'il compte les libs partagées plusieurs fois.`,
            en: `VSZ counts the whole address space (mappings, shared libs, never-touched reservations). To see who eats RAM, look at RSS — keeping in mind it counts shared libs multiple times.`,
          },
        },
        {
          id: 'os-oom-killer',
          title: { fr: "L'OOM killer", en: 'The OOM killer' },
          code: `dmesg -T | grep -i 'killed process'  # qui a été sacrifié ?
cat /proc/1234/oom_score             # score actuel (haut = visé)
# Protéger un processus critique (nécessite root si ce n'est pas le vôtre) :
sudo sh -c 'echo -1000 > /proc/1234/oom_score_adj'`,
          note: {
            fr: `Quand la RAM est épuisée, le noyau tue le processus au meilleur score (gros, récent, peu prioritaire). Un service qui « disparaît » sans log : vérifier dmesg avant tout. Écrire dans oom_score_adj d'un processus qui n'est pas le vôtre exige sudo (ou d'être root) — sans quoi c'est un simple « Permission denied ».`,
            en: `When RAM runs out, the kernel kills the highest-scoring process (big, recent, low priority). A service that "vanishes" with no log: check dmesg first. Writing to oom_score_adj for a process you don't own requires sudo (or root) — otherwise it's a plain "Permission denied".`,
          },
        },
        {
          id: 'os-swap',
          title: { fr: 'Swap & swappiness', en: 'Swap & swappiness' },
          code: `swapon --show              # quels espaces de swap, taille
cat /proc/sys/vm/swappiness   # 60 par défaut
# 0-100 : tendance à swapper plutôt qu'à réduire le cache
sudo sysctl vm.swappiness=10  # serveurs : swapper moins
vmstat 1 5    # colonnes si/so : pages swappées in/out par seconde`,
          note: {
            fr: `Du swap utilisé n'est pas un problème (pages froides garées). Du swap actif (si/so non nuls en continu dans vmstat) en est un : la machine « rame » car elle pagine.`,
            en: `Used swap is not a problem (cold pages parked away). Active swapping (nonzero si/so sustained in vmstat) is: the machine crawls because it's paging.`,
          },
        },
        {
          id: 'os-smem-pmap',
          title: { fr: 'smem / pmap — qui possède quoi', en: 'smem / pmap — who owns what' },
          code: `smem -rk | head -5    # PSS : la part « juste » de chacun
pmap -x 1234 | tail -3   # cartographie mémoire d'un processus
# PSS = RSS avec les libs partagées réparties au prorata
# → la somme des PSS ≈ la vraie RAM utilisée`,
          note: {
            fr: `RSS double-compte les bibliothèques partagées : 50 processus Apache semblent énormes alors qu'ils partagent tout. Le PSS de smem répartit équitablement — c'est la mesure honnête.`,
            en: `RSS double-counts shared libraries: 50 Apache processes look huge while sharing everything. smem's PSS splits them fairly — it's the honest metric.`,
          },
        },
      ],
    },
    {
      id: 'io-files',
      title: { fr: 'Fichiers & I/O', en: 'Files & I/O' },
      items: [
        {
          id: 'os-lsof',
          title: { fr: 'lsof — qui a ouvert quoi', en: 'lsof — who opened what' },
          code: `lsof -p 1234        # tout ce qu'un processus a ouvert
lsof -i :8080       # qui écoute / parle sur le port 8080
lsof +D /var/log    # qui tient des fichiers de ce répertoire
lsof /dev/sda1      # qui utilise cette partition (avant umount)`,
          note: {
            fr: `Sous Unix, tout est fichier : sockets, pipes, devices. lsof répond à « port déjà pris », « impossible de démonter », « qui écrit dans ce log » — le couteau suisse du diagnostic.`,
            en: `On Unix everything is a file: sockets, pipes, devices. lsof answers "port already in use", "can't unmount", "who writes to this log" — the diagnostic Swiss-army knife.`,
          },
        },
        {
          id: 'os-ulimit-fd',
          title: { fr: 'Descripteurs & ulimit -n', en: 'File descriptors & ulimit -n' },
          code: `ulimit -n                 # limite de fd du shell courant
ls /proc/1234/fd | wc -l  # combien ce processus en utilise
cat /proc/1234/limits | grep 'open files'  # SA limite à lui
ulimit -n 65536           # relever (session courante)`,
          note: {
            fr: `« Too many open files » (EMFILE) : le processus a épuisé sa limite de descripteurs — souvent des sockets ou fichiers jamais fermés. Comparer l'usage réel à la limite avant de l'augmenter aveuglément.`,
            en: `"Too many open files" (EMFILE): the process exhausted its descriptor limit — often sockets or files never closed. Compare real usage to the limit before blindly raising it.`,
          },
        },
        {
          id: 'os-inodes',
          title: { fr: 'Inodes — « plein » avec de la place', en: 'Inodes — "full" with free space' },
          code: `df -h     # espace disque : 60% utilisé, tout va bien ?
df -i     # inodes : 100% → impossible de créer un fichier !
# Trouver le coupable (des millions de petits fichiers) :
du --inodes -d 2 /var | sort -n | tail -5`,
          note: {
            fr: `Chaque fichier consomme un inode (métadonnées), alloués en nombre fini au formatage. Des millions de petits fichiers (sessions, cache, mails) saturent les inodes alors que df -h affiche de la place.`,
            en: `Each file consumes one inode (metadata), allocated in finite number at format time. Millions of tiny files (sessions, cache, mail) exhaust inodes while df -h still shows free space.`,
          },
        },
        {
          id: 'os-deleted-open',
          title: { fr: 'Supprimé mais encore ouvert', en: 'Deleted but still open' },
          code: `# rm gros.log mais df ne rend pas l'espace ?
lsof +L1            # fichiers supprimés encore ouverts
# Vider sans tuer le processus (via son fd) :
: > /proc/1234/fd/4
# Le vrai fix : tronquer (: > fichier) au lieu de rm, ou logrotate`,
          note: {
            fr: `rm supprime le nom, pas les données : tant qu'un processus garde le fichier ouvert, les blocs restent alloués. Classique : un log de 40 Go « supprimé » dont l'espace ne revient qu'au restart.`,
            en: `rm removes the name, not the data: as long as a process keeps the file open, the blocks stay allocated. Classic case: a "deleted" 40 GB log whose space only returns at restart.`,
          },
        },
        {
          id: 'os-iostat-iotop',
          title: { fr: 'iostat / iotop — qui sature le disque', en: 'iostat / iotop — who saturates the disk' },
          code: `iostat -xz 1 3      # %util proche de 100 = disque saturé
# Colonne await : latence moyenne par requête (ms)
sudo iotop -ao      # processus triés par I/O cumulée
# -o : seulement les actifs, -a : cumul depuis le lancement`,
          note: {
            fr: `Une machine « lente » avec peu de CPU utilisé est souvent bloquée sur l'I/O (processus en état D). iostat dit quel disque souffre, iotop dit quel processus en est la cause.`,
            en: `A "slow" machine with low CPU usage is often stuck on I/O (processes in state D). iostat tells which disk suffers, iotop tells which process causes it.`,
          },
        },
      ],
    },
    {
      id: 'debug',
      title: { fr: 'Diagnostic', en: 'Diagnostics' },
      items: [
        {
          id: 'os-strace',
          title: { fr: 'strace — voir les appels système', en: 'strace — watch system calls' },
          code: `strace -f -e trace=openat,connect ./mon_app
# -f : suivre aussi les processus enfants
strace -p 1234 -e trace=network   # réseau d'un processus vivant
strace -c ./mon_app               # statistiques : quel appel domine`,
          note: {
            fr: `strace montre le dialogue exact entre le programme et le noyau : quel fichier de conf il cherche (et ne trouve pas), à quoi il se connecte, sur quoi il bloque. Lent — éviter en prod chargée.`,
            en: `strace shows the exact dialogue between program and kernel: which config file it looks for (and misses), what it connects to, where it blocks. Slow — avoid on a busy production box.`,
          },
        },
        {
          id: 'os-ltrace',
          title: { fr: 'ltrace — les appels de bibliothèque', en: 'ltrace — library calls' },
          code: `ltrace ./mon_app 2>&1 | head -20
ltrace -e 'malloc+free' -p 1234   # filtrer certaines fonctions
# strace = frontière programme/noyau (syscalls)
# ltrace = frontière programme/libs (malloc, strcpy, dlopen…)`,
          note: {
            fr: `Complément de strace un cran plus haut : on voit les fonctions de la libc et des bibliothèques partagées. Utile pour comprendre un binaire sans les sources.`,
            en: `Complements strace one level up: you see libc and shared-library functions. Useful for understanding a binary without its sources.`,
          },
        },
        {
          id: 'os-loadavg',
          title: { fr: 'Load average — la vraie définition', en: 'Load average — the real definition' },
          code: `cat /proc/loadavg   # 2.13 1.80 1.55 3/642 12345
uptime              # mêmes moyennes sur 1, 5 et 15 minutes
# Load = nb moyen de processus en état R (veulent le CPU)
#        + en état D (bloqués sur l'I/O) — pas seulement le CPU !
nproc               # à comparer au nombre de cœurs`,
          note: {
            fr: `Un load de 8 sur 8 cœurs peut être sain (CPU plein) ou catastrophique (8 processus coincés en D sur un NFS mort, CPU à 0 %). Toujours croiser avec vmstat/iostat avant de conclure.`,
            en: `A load of 8 on 8 cores can be healthy (CPU fully used) or catastrophic (8 processes stuck in D on a dead NFS, CPU at 0%). Always cross-check with vmstat/iostat before concluding.`,
          },
        },
        {
          id: 'os-dmesg-journalctl',
          title: { fr: 'dmesg -T / journalctl -k', en: 'dmesg -T / journalctl -k' },
          code: `sudo dmesg -T | tail -30     # messages noyau, dates lisibles
journalctl -k --since '1 hour ago'   # pareil, via systemd
journalctl -k -p err         # seulement les erreurs noyau
# OOM kills, disques mourants, segfaults, USB : tout est là`,
          note: {
            fr: `Le journal du noyau est le premier réflexe pour les pannes « mystérieuses » : processus tué par l'OOM killer, erreurs disque (I/O error), segfaults, cartes réseau qui flanchent.`,
            en: `The kernel log is the first reflex for "mysterious" failures: OOM-killed processes, disk errors (I/O error), segfaults, flapping network cards.`,
          },
        },
        {
          id: 'os-perf-top',
          title: { fr: 'perf top — où brûle le CPU', en: 'perf top — where the CPU burns' },
          code: `sudo perf top        # top des fonctions, tout le système
sudo perf top -p 1234   # zoom sur un processus
# Plus profond : enregistrer puis analyser
sudo perf record -g -p 1234 -- sleep 10 && sudo perf report`,
          note: {
            fr: `Quand top dit « 100 % CPU » sans dire pourquoi, perf top montre les fonctions exactes (noyau et userland) qui consomment. L'outil de profilage standard de Linux, sans instrumentation.`,
            en: `When top says "100% CPU" without saying why, perf top shows the exact functions (kernel and userland) burning it. Linux's standard profiler, no instrumentation needed.`,
          },
        },
        {
          id: 'os-cgroups',
          title: { fr: 'cgroups v2 en bref', en: 'cgroups v2 in a nutshell' },
          code: `cat /proc/1234/cgroup        # à quel groupe appartient-il ?
systemd-cgtop                # consommation par groupe en direct
# Les limites lisibles dans /sys/fs/cgroup/<groupe>/ :
cat /sys/fs/cgroup/system.slice/memory.max
systemd-run --scope -p MemoryMax=512M ./gourmand.sh`,
          note: {
            fr: `Les cgroups limitent CPU, mémoire et I/O par groupe de processus : c'est la mécanique sous Docker, Kubernetes et systemd. Un conteneur « OOMKilled » a juste touché son memory.max.`,
            en: `cgroups cap CPU, memory and I/O per process group: the machinery under Docker, Kubernetes and systemd. An "OOMKilled" container simply hit its memory.max.`,
          },
        },
      ],
    },
    {
      id: 'os-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'os-bp-graceful-shutdown',
          title: { fr: 'Intercepter SIGTERM pour un arrêt propre', en: 'Trap SIGTERM for a clean shutdown' },
          code: `trap 'echo "arrêt en cours..."; cleanup; exit 0' TERM
# dans une app : fermer les connexions DB, finir les requêtes en vol,
# puis quitter — Docker/Kubernetes envoient TERM avant KILL`,
          note: {
            fr: `Docker et Kubernetes envoient SIGTERM puis SIGKILL après un délai (souvent 10-30s) : une appli qui ignore TERM se fait tuer sauvagement à chaque déploiement, avec requêtes coupées et données perdues. Gérer TERM proprement transforme chaque redémarrage en non-événement.`,
            en: `Docker and Kubernetes send SIGTERM then SIGKILL after a grace period (often 10-30s): an app that ignores TERM gets brutally killed on every deploy, dropping requests and losing data. Handling TERM cleanly turns every restart into a non-event.`,
          },
        },
        {
          id: 'os-bp-explicit-resource-limits',
          title: { fr: 'Fixer des limites de ressources explicites par service', en: 'Set explicit per-service resource limits' },
          code: `systemd-run --scope -p MemoryMax=512M -p CPUQuota=50% ./app
# ou dans un unit systemd : MemoryMax=, CPUQuota=
# ou en conteneur : --memory=512m --cpus=0.5`,
          note: {
            fr: `Sans limite, un service qui fuit la mémoire ou boucle en CPU peut affamer toute la machine et déclencher l'OOM killer sur un processus innocent à côté. Des limites explicites (cgroups) contiennent la casse à un seul service.`,
            en: `Without a limit, a service leaking memory or spinning the CPU can starve the whole machine and trigger the OOM killer on an innocent process nearby. Explicit limits (cgroups) contain the damage to a single service.`,
          },
        },
        {
          id: 'os-bp-persistent-journal',
          title: { fr: "Activer les logs noyau persistants avant d'en avoir besoin", en: 'Enable persistent kernel logs before you need them' },
          code: `sudo mkdir -p /var/log/journal
sudo systemctl restart systemd-journald
journalctl --disk-usage    # vérifier que ça persiste bien au reboot`,
          note: {
            fr: `Par défaut sur beaucoup de distributions, le journal systemd est en mémoire seule et disparaît au reboot — exactement quand on en a besoin après un crash. L'activer en persistant rend chaque incident post-mortem-able.`,
            en: `By default on many distros, the systemd journal lives in memory only and vanishes on reboot — exactly when you need it after a crash. Making it persistent turns every incident into something you can post-mortem.`,
          },
        },
        {
          id: 'os-bp-cross-check-metrics',
          title: { fr: 'Ne jamais conclure sur une seule métrique', en: 'Never conclude from a single metric' },
          code: `uptime                # load élevé...
vmstat 1 5             # ...CPU plein (us/sy) ou en attente I/O (wa) ?
iostat -xz 1 3         # confirme si un disque sature (%util, await)`,
          note: {
            fr: `Un load élevé peut venir du CPU ou de processus bloqués en I/O (état D) — la même valeur cache deux diagnostics opposés. Croiser load, vmstat et iostat évite d'optimiser la mauvaise ressource.`,
            en: `A high load can come from the CPU or from processes stuck in I/O (state D) — the same number hides two opposite diagnoses. Cross-checking load, vmstat and iostat stops you from optimizing the wrong resource.`,
          },
        },
        {
          id: 'os-bp-core-dumps-controlled',
          title: { fr: 'Contrôler les core dumps : utiles en dev, maîtrisés en prod', en: 'Control core dumps: useful in dev, tamed in prod' },
          code: `ulimit -c unlimited                       # dev : capturer le crash pour debug
cat /proc/sys/kernel/core_pattern         # prod : rediriger/limiter la taille
# ex. core_pattern vers /var/crash/%e.%p pour ne pas remplir /`,
          note: {
            fr: `Un core dump non maîtrisé en prod peut remplir le disque à chaque crash ou exposer des secrets tenus en mémoire. En dev, l'activer donne un post-mortem exact ; en prod, taille et destination doivent être choisies volontairement.`,
            en: `An unmanaged core dump in prod can fill the disk on every crash or leak secrets held in memory. In dev, enabling it gives an exact post-mortem; in prod, size and destination must be chosen deliberately.`,
          },
        },
      ],
    },
  ],
};
