/**
 * Cheatsheet Docker — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'docker',
  lang: 'bash',
  sections: [
    {
      id: 'run',
      title: { fr: 'Lancer & gérer', en: 'Run & manage' },
      items: [
        {
          id: 'dk-run-basics',
          title: { fr: 'docker run : les flags essentiels', en: 'docker run: the essential flags' },
          code: `# -d détaché, -p hôte:conteneur, --name pour le retrouver
docker run -d -p 8080:80 --name web nginx
# -e injecte une variable d'environnement
docker run -d -e POSTGRES_PASSWORD=secret postgres:16`,
          note: {
            fr: `-p publie un port (hôte:conteneur, dans cet ordre — l'inverser est le piège classique). --name évite les noms aléatoires type "vibrant_curie" et permet docker stop web. Attention : une valeur passée en -e reste visible en clair via docker inspect et dans l'historique du shell — pour un vrai secret, préférez --env-file ou un gestionnaire de secrets.`,
            en: `-p publishes a port (host:container, in that order — swapping them is the classic trap). --name avoids random names like "vibrant_curie" and enables docker stop web. Careful: a value passed via -e stays visible in plain text via docker inspect and in shell history — for a real secret, prefer --env-file or a secrets manager.`,
          },
        },
        {
          id: 'dk-run-rm-it',
          title: { fr: '--rm et -it : conteneurs jetables', en: '--rm and -it: throwaway containers' },
          code: `# --rm supprime le conteneur à l'arrêt, -it = interactif + terminal
docker run --rm -it ubuntu:24.04 bash
# tester une commande sans polluer docker ps -a
docker run --rm alpine ping -c 3 example.com`,
          note: {
            fr: `Sans --rm, chaque run laisse un conteneur arrêté qui s'accumule. Piège : tout ce qui est écrit dans la couche d'écriture du conteneur est perdu à sa suppression — utilisez un volume pour persister.`,
            en: `Without --rm, every run leaves a stopped container piling up. Trap: anything written to the container's writable layer is lost when it's removed — use a volume to persist data.`,
          },
        },
        {
          id: 'dk-ps',
          title: { fr: 'docker ps -a : voir tous les conteneurs', en: 'docker ps -a: see all containers' },
          code: `docker ps            # conteneurs en cours seulement
docker ps -a         # + les arrêtés (et leur exit code)
# format compact : nom, statut, ports
docker ps -a --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"`,
          note: {
            fr: `docker ps seul cache les conteneurs arrêtés : un conteneur qui crashe au démarrage semble "disparu". -a montre Exited (1) et l'exit code, premier indice de debug.`,
            en: `Plain docker ps hides stopped containers: a container crashing at startup seems to "vanish". -a shows Exited (1) and the exit code, your first debugging clue.`,
          },
        },
        {
          id: 'dk-stop-kill',
          title: { fr: 'stop vs kill', en: 'stop vs kill' },
          code: `docker stop web   # SIGTERM, puis SIGKILL après 10 s
docker kill web   # SIGKILL immédiat, pas de grâce
# allonger le délai pour un arrêt propre (flush, déconnexions)
docker stop -t 30 web`,
          note: {
            fr: `stop laisse l'application terminer proprement (fermer la BDD, vider les buffers) ; kill coupe net. Si votre process ignore SIGTERM (mauvaise forme shell dans CMD), stop attend 10 s pour rien puis kill.`,
            en: `stop lets the app shut down cleanly (close DB, flush buffers); kill cuts it dead. If your process ignores SIGTERM (shell-form CMD issue), stop waits 10 s for nothing then kills.`,
          },
        },
        {
          id: 'dk-rm-rmi',
          title: { fr: 'rm (conteneur) vs rmi (image)', en: 'rm (container) vs rmi (image)' },
          code: `docker rm web          # supprime un conteneur arrêté
docker rm -f web       # force : stoppe puis supprime
docker rmi nginx:1.27  # supprime une image locale
docker container prune # tous les conteneurs arrêtés`,
          note: {
            fr: `rm agit sur les conteneurs, rmi sur les images : confusion fréquente. On ne peut pas rmi une image utilisée par un conteneur (même arrêté) — d'où l'erreur "image is being used".`,
            en: `rm targets containers, rmi targets images: a frequent mix-up. You can't rmi an image still used by a container (even a stopped one) — hence the "image is being used" error.`,
          },
        },
        {
          id: 'dk-restart-policy',
          title: { fr: 'Politiques de redémarrage', en: 'Restart policies' },
          code: `# redémarre sauf si arrêté à la main
docker run -d --restart unless-stopped --name api mon-api
# toujours, même après reboot de la machine
docker run -d --restart always redis
docker update --restart no api   # modifier après coup`,
          note: {
            fr: `Sans politique, un conteneur crashé reste mort. unless-stopped est le bon défaut en prod : il survit aux reboots mais respecte un docker stop manuel, contrairement à always qui ressuscite tout.`,
            en: `Without a policy, a crashed container stays dead. unless-stopped is the sane prod default: it survives reboots but respects a manual docker stop, unlike always which resurrects everything.`,
          },
        },
        {
          id: 'dk-exec',
          title: { fr: 'exec -it : entrer dans un conteneur', en: 'exec -it: get inside a container' },
          code: `docker exec -it web bash       # shell dans le conteneur
docker exec -it web sh         # alpine n'a pas bash
# lancer une commande ponctuelle sans shell
docker exec web cat /etc/nginx/nginx.conf`,
          note: {
            fr: `exec lance un process dans un conteneur déjà démarré — rien à voir avec run qui en crée un nouveau. Piège : les images alpine/distroless n'ont pas bash, essayez sh (ou rien du tout pour distroless).`,
            en: `exec starts a process inside an already running container — unlike run which creates a new one. Trap: alpine/distroless images have no bash, try sh (or nothing at all for distroless).`,
          },
        },
        {
          id: 'dk-logs',
          title: { fr: 'logs -f --tail : suivre les logs', en: 'logs -f --tail: follow the logs' },
          code: `docker logs web                  # tout depuis le début
docker logs -f --tail 100 web    # 100 dernières lignes puis suit
docker logs --since 10m web      # 10 dernières minutes
docker logs -t web               # avec horodatage`,
          note: {
            fr: `Docker capture stdout/stderr du PID 1. Si votre app écrit dans un fichier au lieu de la sortie standard, docker logs reste vide — c'est voulu : en conteneur, on logge sur stdout.`,
            en: `Docker captures stdout/stderr of PID 1. If your app writes to a file instead of standard output, docker logs stays empty — by design: in containers, log to stdout.`,
          },
        },
      ],
    },
    {
      id: 'build',
      title: { fr: 'Images & Dockerfile', en: 'Images & Dockerfile' },
      items: [
        {
          id: 'dk-build',
          title: { fr: 'docker build -t', en: 'docker build -t' },
          code: `# -t nomme l'image, . = contexte envoyé au démon
docker build -t mon-api:1.2 .
docker build -t mon-api:1.2 -f Dockerfile.prod .
docker build --no-cache -t mon-api:1.2 .   # ignorer le cache`,
          note: {
            fr: `Le "." est le contexte de build : tout ce dossier est envoyé au démon Docker avant la première instruction. Un contexte de 2 Go (node_modules, .git) ralentit chaque build — d'où le .dockerignore.`,
            en: `The "." is the build context: that whole folder is sent to the Docker daemon before the first instruction runs. A 2 GB context (node_modules, .git) slows every build — hence .dockerignore.`,
          },
        },
        {
          id: 'dk-layer-order',
          title: { fr: "L'ordre des couches = le cache", en: 'Layer order = the cache' },
          code: `# du moins changeant au plus changeant
COPY package.json package-lock.json ./
RUN npm ci              # couche mise en cache tant que les
COPY . .                # deps ne changent pas
RUN npm run build`,
          note: {
            fr: `Chaque instruction crée une couche ; une couche modifiée invalide toutes les suivantes. COPY . . avant npm ci force la réinstallation des deps à chaque changement de code : le piège n°1 des builds lents.`,
            en: `Each instruction creates a layer; changing one invalidates all the following ones. COPY . . before npm ci forces a dependency reinstall on every code change: the #1 cause of slow builds.`,
          },
        },
        {
          id: 'dk-multistage',
          title: { fr: 'Multi-stage build', en: 'Multi-stage build' },
          code: `FROM node:22 AS build       # étape 1 : outils lourds
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine           # étape 2 : runtime minimal
COPY --from=build /app/dist /usr/share/nginx/html`,
          note: {
            fr: `Seule la dernière étape finit dans l'image : compilateurs, deps de dev et sources restent dans l'étape build. On passe couramment de 1,2 Go à 50 Mo, et la surface d'attaque fond d'autant.`,
            en: `Only the last stage ends up in the image: compilers, dev deps and sources stay in the build stage. Going from 1.2 GB down to 50 MB is common, and the attack surface shrinks accordingly.`,
          },
        },
        {
          id: 'dk-dockerignore',
          title: { fr: '.dockerignore', en: '.dockerignore' },
          code: `# .dockerignore — exclus du contexte de build
node_modules
.git
*.log
.env             # secrets : jamais dans une image !`,
          note: {
            fr: `Sans lui, COPY . . embarque node_modules (binaire hôte incompatible) et .env (secrets gravés dans une couche, lisibles via docker history). Indispensable, pas optionnel.`,
            en: `Without it, COPY . . ships node_modules (incompatible host binaries) and .env (secrets baked into a layer, readable via docker history). Mandatory, not optional.`,
          },
        },
        {
          id: 'dk-tag-push',
          title: { fr: 'tag & push vers un registre', en: 'tag & push to a registry' },
          code: `# le nom complet inclut le registre et le namespace
docker tag mon-api:1.2 ghcr.io/equipe/mon-api:1.2
docker login ghcr.io
docker push ghcr.io/equipe/mon-api:1.2`,
          note: {
            fr: `tag ne copie rien : c'est un alias vers la même image. Piège : pousser :latest seulement rend les rollbacks impossibles — taguez toujours avec une version ou un SHA de commit.`,
            en: `tag copies nothing: it's an alias to the same image. Trap: pushing only :latest makes rollbacks impossible — always tag with a version or a commit SHA.`,
          },
        },
        {
          id: 'dk-alpine-slim',
          title: { fr: 'alpine vs slim : quelle base ?', en: 'alpine vs slim: which base?' },
          code: `FROM node:22-alpine   # ~50 Mo, musl libc
FROM node:22-slim     # ~75 Mo, glibc (Debian allégé)
FROM node:22          # ~400 Mo, tout l'outillage Debian`,
          note: {
            fr: `alpine utilise musl au lieu de glibc : certains binaires natifs (sharp, grpc…) cassent ou doivent être recompilés. slim garde glibc pour quelques Mo de plus — souvent le meilleur compromis.`,
            en: `alpine uses musl instead of glibc: some native binaries (sharp, grpc…) break or need recompiling. slim keeps glibc for a few extra MB — often the best trade-off.`,
          },
        },
        {
          id: 'dk-user-nonroot',
          title: { fr: 'USER : ne pas tourner en root', en: 'USER: do not run as root' },
          code: `RUN addgroup -S app && adduser -S app -G app
COPY --chown=app:app . /app
USER app              # tout ce qui suit tourne en non-root
CMD ["node", "server.js"]`,
          note: {
            fr: `Par défaut tout tourne en root : une faille dans l'app donne root dans le conteneur, et une évasion donne root sur l'hôte. USER en fin de Dockerfile coûte 3 lignes et coupe ce scénario.`,
            en: `By default everything runs as root: an app vulnerability gives root in the container, and an escape gives root on the host. USER at the end of the Dockerfile costs 3 lines and kills that scenario.`,
          },
        },
      ],
    },
    {
      id: 'compose',
      title: { fr: 'Docker Compose', en: 'Docker Compose' },
      items: [
        {
          id: 'dk-compose-up-down',
          title: { fr: 'compose up -d / down', en: 'compose up -d / down' },
          code: `docker compose up -d          # crée et démarre tout
docker compose up -d --build  # rebuild les images avant
docker compose down           # stoppe et supprime conteneurs
docker compose down -v        # + supprime les volumes (données !)`,
          note: {
            fr: `up est idempotent : il ne recrée que ce qui a changé. Attention à down -v : il efface aussi les volumes nommés, donc votre base de données — à réserver au reset volontaire.`,
            en: `up is idempotent: it only recreates what changed. Beware of down -v: it also deletes named volumes, hence your database — keep it for intentional resets only.`,
          },
        },
        {
          id: 'dk-compose-yaml',
          title: { fr: 'Le yaml minimal', en: 'The minimal yaml' },
          code: `# compose.yaml
services:
  api:
    build: .
    ports: ["8080:3000"]
    environment:
      DATABASE_URL: postgres://db:5432/app
    depends_on: [db]
  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:`,
          note: {
            fr: `Tout y est : build local vs image, ports, env, volume nommé déclaré en bas. L'api joint la db par son nom de service ("db"), pas par localhost — l'erreur de débutant la plus courante.`,
            en: `Everything is here: local build vs image, ports, env, named volume declared at the bottom. The api reaches the db by service name ("db"), not localhost — the most common beginner mistake.`,
          },
        },
        {
          id: 'dk-compose-depends',
          title: { fr: 'depends_on et le vrai "prêt"', en: 'depends_on and actual readiness' },
          code: `services:
  api:
    depends_on:
      db:
        condition: service_healthy   # attend le healthcheck
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 3s`,
          note: {
            fr: `depends_on seul attend que le conteneur démarre, pas que Postgres accepte des connexions : l'api crashe quand même au boot. condition: service_healthy + healthcheck règle le vrai problème.`,
            en: `Bare depends_on waits for the container to start, not for Postgres to accept connections: the api still crashes at boot. condition: service_healthy + a healthcheck fixes the real issue.`,
          },
        },
        {
          id: 'dk-compose-logs-exec',
          title: { fr: 'compose logs / exec', en: 'compose logs / exec' },
          code: `docker compose logs -f          # tous les services, mêlés
docker compose logs -f api      # un seul service
docker compose exec db psql -U postgres
docker compose ps               # état des services`,
          note: {
            fr: `Mêmes commandes que docker, mais ciblées par nom de service plutôt que par nom de conteneur : plus besoin de retrouver "projet-api-1". exec sans -it fonctionne car compose l'ajoute par défaut.`,
            en: `Same commands as plain docker, but targeted by service name instead of container name: no more hunting for "project-api-1". exec works without -it because compose adds it by default.`,
          },
        },
        {
          id: 'dk-compose-profiles',
          title: { fr: 'profiles : services optionnels', en: 'profiles: optional services' },
          code: `services:
  api:
    build: .          # toujours démarré
  pgadmin:
    image: dpage/pgadmin4
    profiles: [debug] # seulement à la demande
# docker compose --profile debug up -d`,
          note: {
            fr: `Un service avec profiles ne démarre que si son profil est activé. Parfait pour les outils lourds (pgadmin, mailhog, monitoring) qu'on ne veut pas payer à chaque up quotidien.`,
            en: `A service with profiles only starts when its profile is enabled. Perfect for heavy tooling (pgadmin, mailhog, monitoring) you don't want to pay for on every daily up.`,
          },
        },
        {
          id: 'dk-compose-watch',
          title: { fr: 'compose watch : dev à chaud', en: 'compose watch: live dev' },
          code: `services:
  api:
    build: .
    develop:
      watch:
        - action: sync      # copie les fichiers modifiés
          path: ./src
          target: /app/src
        - action: rebuild   # rebuild si les deps changent
          path: package.json
# docker compose up --watch`,
          note: {
            fr: `watch synchronise le code dans le conteneur sans bind mount (donc sans soucis de droits ou de node_modules écrasé), et rebuild seulement quand il le faut. Le mode dev moderne de compose.`,
            en: `watch syncs code into the container without a bind mount (so no permission issues or clobbered node_modules), and rebuilds only when needed. Compose's modern dev mode.`,
          },
        },
      ],
    },
    {
      id: 'data',
      title: { fr: 'Volumes & réseaux', en: 'Volumes & networks' },
      items: [
        {
          id: 'dk-volumes-vs-bind',
          title: { fr: 'Volumes nommés vs bind mounts', en: 'Named volumes vs bind mounts' },
          code: `# volume nommé : géré par Docker, idéal pour les données
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16
# bind mount : un dossier de l'hôte, idéal pour le code en dev
docker run -d -v "$(pwd)/src:/app/src" mon-api`,
          note: {
            fr: `Le volume nommé survit au conteneur et reste performant partout ; le bind mount reflète l'hôte en direct mais traîne les problèmes de droits (UID) et de perfs sur macOS/Windows. Données → volume, code dev → bind.`,
            en: `A named volume outlives the container and performs well everywhere; a bind mount mirrors the host live but drags permission (UID) and perf issues on macOS/Windows. Data → volume, dev code → bind.`,
          },
        },
        {
          id: 'dk-volume-cmds',
          title: { fr: 'volume ls / inspect / prune', en: 'volume ls / inspect / prune' },
          code: `docker volume ls                  # tous les volumes
docker volume inspect pgdata      # où vivent les données ?
docker volume prune               # supprime les volumes orphelins
docker volume rm pgdata           # suppression ciblée`,
          note: {
            fr: `inspect révèle le Mountpoint réel sur l'hôte. prune ne touche que les volumes qu'aucun conteneur ne référence — mais "orphelin" inclut le volume de la BDD dont vous venez de down le conteneur. Vérifiez avant.`,
            en: `inspect reveals the actual Mountpoint on the host. prune only removes volumes no container references — but "orphaned" includes the DB volume whose container you just took down. Check first.`,
          },
        },
        {
          id: 'dk-network-create',
          title: { fr: 'network create : réseau partagé', en: 'network create: shared network' },
          code: `docker network create backend
docker run -d --network backend --name db postgres:16
docker run -d --network backend --name api mon-api
docker network inspect backend   # qui est connecté ?`,
          note: {
            fr: `Le réseau bridge par défaut n'offre pas de DNS entre conteneurs : seuls les réseaux créés par l'utilisateur le font. Compose en crée un automatiquement par projet, d'où la magie qui "marche toute seule".`,
            en: `The default bridge network has no DNS between containers: only user-created networks do. Compose creates one per project automatically, which is why it "just works" there.`,
          },
        },
        {
          id: 'dk-dns-service-name',
          title: { fr: 'DNS : joindre un conteneur par son nom', en: 'DNS: reach a container by name' },
          code: `# sur un réseau utilisateur, le nom = l'adresse
docker exec api ping db          # résout le conteneur "db"
# dans la config de l'app :
# DATABASE_URL=postgres://db:5432/app   <- pas localhost !`,
          note: {
            fr: `Chaque conteneur a sa propre interface réseau : localhost désigne le conteneur lui-même, pas le voisin. On joint les autres services par leur nom (de conteneur ou de service compose) — Docker fait le DNS.`,
            en: `Each container has its own network stack: localhost means the container itself, not its neighbor. You reach other services by name (container or compose service name) — Docker provides the DNS.`,
          },
        },
        {
          id: 'dk-ports-expose',
          title: { fr: 'ports (publie) vs expose (documente)', en: 'ports (publishes) vs expose (documents)' },
          code: `services:
  api:
    ports: ["8080:3000"]   # accessible depuis l'hôte :8080
  db:
    expose: ["5432"]       # visible des autres conteneurs seulement`,
          note: {
            fr: `ports ouvre le port sur la machine hôte ; expose est quasi documentaire : entre conteneurs d'un même réseau, tous les ports sont déjà joignables. Ne publiez pas la BDD sur l'hôte sans raison.`,
            en: `ports opens the port on the host machine; expose is mostly documentation: between containers on the same network, every port is already reachable. Don't publish the DB on the host without a reason.`,
          },
        },
      ],
    },
    {
      id: 'debug',
      title: { fr: 'Debug & nettoyage', en: 'Debug & cleanup' },
      items: [
        {
          id: 'dk-inspect',
          title: { fr: 'inspect + --format', en: 'inspect + --format' },
          code: `docker inspect web                  # tout le JSON
# extraire une valeur précise avec un template Go
docker inspect -f '{{.State.ExitCode}}' web
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web`,
          note: {
            fr: `inspect contient tout : env, mounts, IP, exit code, raison OOM. --format évite de noyer le terminal sous 300 lignes de JSON et se scripte facilement.`,
            en: `inspect holds everything: env, mounts, IP, exit code, OOM reason. --format keeps the terminal from drowning in 300 lines of JSON and scripts nicely.`,
          },
        },
        {
          id: 'dk-stats-top',
          title: { fr: 'stats & top : CPU, RAM, process', en: 'stats & top: CPU, RAM, processes' },
          code: `docker stats              # CPU/RAM/IO en direct, tous
docker stats web          # un seul conteneur
docker top web            # les process vus de l'hôte`,
          note: {
            fr: `stats montre la conso face aux limites : un conteneur collé à 100 % de sa limite mémoire est candidat à l'OOM kill. top confirme quel process tourne vraiment (et s'il y en a 40 au lieu d'1).`,
            en: `stats shows usage against limits: a container pinned at 100% of its memory limit is an OOM-kill candidate. top confirms which process actually runs (and whether there are 40 instead of 1).`,
          },
        },
        {
          id: 'dk-system-prune',
          title: { fr: 'system df / prune -a (danger)', en: 'system df / prune -a (danger)' },
          code: `docker system df          # qui mange le disque ?
docker system prune       # conteneurs arrêtés, réseaux, cache
# -a supprime AUSSI toutes les images non utilisées !
docker system prune -a --volumes`,
          note: {
            fr: `prune est destructif et sans corbeille : -a efface toute image sans conteneur en cours (y compris celles que vous reconstruirez 20 min), --volumes efface les données. Lancez system df d'abord, prune -a en dernier recours.`,
            en: `prune is destructive with no trash bin: -a deletes every image without a running container (including ones you'll rebuild for 20 min), --volumes wipes data. Run system df first, prune -a as a last resort.`,
          },
        },
        {
          id: 'dk-cp-diff',
          title: { fr: 'cp & diff : fichiers du conteneur', en: 'cp & diff: container files' },
          code: `# copier hôte <-> conteneur (marche même arrêté)
docker cp web:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./fix.conf web:/etc/nginx/conf.d/
docker diff web    # fichiers modifiés depuis l'image (A/C/D)`,
          note: {
            fr: `diff liste ce qui a changé dans la couche d'écriture : parfait pour repérer une app qui écrit là où elle ne devrait pas (logs, uploads) — ces fichiers disparaîtront avec le conteneur.`,
            en: `diff lists what changed in the writable layer: great for spotting an app writing where it shouldn't (logs, uploads) — those files will vanish with the container.`,
          },
        },
        {
          id: 'dk-events',
          title: { fr: 'events : le journal du démon', en: 'events: the daemon journal' },
          code: `docker events                       # flux en direct
# filtrer : qui meurt, et pourquoi ?
docker events --filter event=die --filter event=oom
docker events --since 30m           # les 30 dernières minutes`,
          note: {
            fr: `Quand un conteneur redémarre en boucle ou "disparaît", events montre la séquence exacte (die, oom, kill, restart) avec horodatage — souvent plus parlant que les logs de l'app elle-même.`,
            en: `When a container restart-loops or "disappears", events shows the exact sequence (die, oom, kill, restart) with timestamps — often more telling than the app's own logs.`,
          },
        },
        {
          id: 'dk-why-container-dies',
          title: { fr: "Pourquoi mon conteneur s'arrête ?", en: 'Why does my container stop?' },
          code: `docker ps -a                              # Exited (137) ?
docker inspect -f '{{.State.OOMKilled}}' web   # tué par manque de RAM ?
docker logs --tail 50 web                 # derniers mots
# 0 = fin normale, 1 = erreur app, 137 = SIGKILL/OOM, 139 = segfault`,
          note: {
            fr: `Un conteneur vit tant que son PID 1 vit : si le process principal sort (ou si CMD lance un démon qui se met en arrière-plan), le conteneur s'arrête. Préférez la forme exec CMD ["app"] à la forme shell, qui intercale un sh et casse les signaux.`,
            en: `A container lives as long as its PID 1 lives: if the main process exits (or CMD starts a daemon that backgrounds itself), the container stops. Prefer exec form CMD ["app"] over shell form, which inserts an sh and breaks signal handling.`,
          },
        },
      ],
    },
    {
      id: 'docker-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'docker-bp-pin-base-digest',
          title: { fr: 'Épingler l\'image de base par digest, pas seulement par tag', en: 'Pin the base image by digest, not just by tag' },
          code: `FROM node:22-alpine@sha256:9d7f1b6c2e5a4f0b8c3d2e1a9f8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b`,
          note: {
            fr: `Un tag comme node:22-alpine peut être republié avec un contenu différent (rebuild upstream), cassant un build qui marchait la veille. Le digest sha256 pointe un contenu exact, garanti immuable — la seule vraie reproductibilité.`,
            en: `A tag like node:22-alpine can be republished with different content (upstream rebuild), breaking a build that worked yesterday. The sha256 digest points to exact content, guaranteed immutable — the only real reproducibility.`,
          },
        },
        {
          id: 'docker-bp-healthcheck-instruction',
          title: { fr: 'HEALTHCHECK : détecter un conteneur bloqué, pas juste planté', en: 'HEALTHCHECK: detect a hung container, not just a crashed one' },
          code: `HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD curl -f http://localhost:8080/healthz || exit 1`,
          note: {
            fr: `Sans HEALTHCHECK, docker ps affiche Up même pour une app bloquée en deadlock qui ne répond plus : le process vit, mais ne sert plus rien. Avec HEALTHCHECK, le statut passe à unhealthy et un orchestrateur peut agir (redémarrer, retirer du LB).`,
            en: `Without HEALTHCHECK, docker ps shows Up even for an app stuck in a deadlock that no longer responds: the process is alive but serves nothing. With HEALTHCHECK, status turns unhealthy and an orchestrator can act (restart, pull from the LB).`,
          },
        },
        {
          id: 'docker-bp-readonly-rootfs',
          title: { fr: 'Rootfs en lecture seule + tmpfs pour les dossiers d\'écriture', en: 'Read-only rootfs + tmpfs for writable dirs' },
          code: `docker run --read-only --tmpfs /tmp -d mon-api`,
          note: {
            fr: `Un conteneur en lecture seule ne peut pas être modifié par un attaquant qui exploite l'app (webshell, binaire déposé) : nulle part où écrire hors des tmpfs explicitement autorisés. Coûte juste d'identifier les dossiers réellement nécessaires en écriture.`,
            en: `A read-only container can't be modified by an attacker exploiting the app (webshell, dropped binary): nowhere to write outside explicitly allowed tmpfs mounts. The only cost is identifying which folders genuinely need write access.`,
          },
        },
        {
          id: 'docker-bp-resource-limits-runtime',
          title: { fr: 'Toujours plafonner --memory et --cpus en prod', en: 'Always cap --memory and --cpus in prod' },
          code: `docker run -d --memory=512m --memory-swap=512m --cpus=1.0 mon-api`,
          note: {
            fr: `Sans plafond, un conteneur qui fuit peut manger toute la RAM de l'hôte et faire tomber les autres services (bruyant voisin). --memory-swap égal à --memory désactive le swap, évitant un ralentissement silencieux avant l'OOM.`,
            en: `Without a cap, a leaking container can eat all the host's RAM and take down other services (noisy neighbor). Setting --memory-swap equal to --memory disables swap, avoiding silent slowdown before the OOM kill.`,
          },
        },
        {
          id: 'docker-bp-buildkit-secret-mount',
          title: { fr: 'Secrets de build via --secret (BuildKit), jamais via ARG/ENV', en: 'Build secrets via --secret (BuildKit), never via ARG/ENV' },
          code: `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
# côté build :
docker build --secret id=npmrc,src=$HOME/.npmrc -t mon-api .`,
          note: {
            fr: `Un ARG ou ENV contenant un secret reste gravé dans l'historique de l'image (docker history) même après un RUN qui le supprime. --mount=type=secret l'expose seulement pendant l'exécution de l'instruction, sans jamais toucher une couche.`,
            en: `An ARG or ENV holding a secret stays baked into the image history (docker history) even after a RUN that deletes it. --mount=type=secret exposes it only during that instruction's execution, never touching a layer.`,
          },
        },
      ],
    },
  ],
};
