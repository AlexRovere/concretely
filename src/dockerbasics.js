/**
 * Docker basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - image vs container: an image is a read-only layered recipe, a container
 *    is an instance of it with its own thin writable layer;
 *  - Dockerfile layer caching: each instruction is a cached layer, and one
 *    invalidated layer invalidates ALL the following ones — copy package*.json
 *    and run npm install BEFORE copying the whole source tree;
 *  - ENTRYPOINT vs CMD: ENTRYPOINT is the executable, CMD the default
 *    arguments — `docker run img args` replaces CMD, never ENTRYPOINT
 *    (and the shell form makes /bin/sh PID 1, eating SIGTERM);
 *  - volumes: the writable layer dies with the container — named volumes
 *    survive it, bind mounts map host files for dev hot reload.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const DOCKERBASICS_SCENARIOS = [
  {
    id: 'image-vs-container',
    code: `docker pull nginx      # image = recette figée, en couches read-only
docker run -d nginx    # conteneur a1b2c3 — une INSTANCE de l'image
docker run -d nginx    # 2e conteneur… à partir de la MÊME image
docker ps              # 2 conteneurs
docker images          # 1 seule image
# modifier un fichier DANS un conteneur ne touche jamais l'image`,
    ops: [
      { eval: 'docker pull nginx', value: 'image téléchargée (read-only)', note: 'une image = une recette figée, en couches' },
      { eval: 'docker run -d nginx', value: 'conteneur a1b2c3', note: "un conteneur = une INSTANCE de l'image + une fine couche d'écriture" },
      { eval: 'docker run -d nginx', value: 'conteneur d4e5f6 — 2e conteneur, MÊME image' },
      { eval: 'docker ps', value: '2 conteneurs' },
      { eval: 'docker images', value: '1 image', note: 'les deux conteneurs partagent les couches de l\'image' },
      { branch: "modifier un fichier dans le conteneur modifie-t-il l'image ?", taken: false, else: "non — la couche d'écriture est propre au conteneur, l'image reste intacte" },
    ],
  },
  {
    id: 'layers-cache',
    code: `# ❌ Dockerfile naïf
COPY . .                  # le code change à CHAQUE commit…
RUN npm install           # …donc npm install re-tourne à chaque build 💥

# ✓ ordre malin : du plus stable au plus volatil
COPY package*.json ./     # change rarement
RUN npm install           # mis en cache tant que package*.json ne bouge pas
COPY . .                  # seul le code re-copie
docker build .            # 2e build : CACHED partout sauf le code`,
    ops: [
      { log: 'chaque instruction = une COUCHE, mise en cache ; une couche invalidée invalide TOUTES les suivantes' },
      { crash: 'COPY . .', message: 'chaque changement de fichier invalide cette couche → npm install repart de ZÉRO à chaque build' },
      { eval: 'COPY package*.json ./  puis  RUN npm install  puis  COPY . .', value: 'npm install en cache ✓', note: 'on copie d\'abord ce qui change RAREMENT' },
      { eval: 'docker build .', value: 'CACHED sur les couches stables — seul COPY . . re-tourne', note: '2e build quasi instantané' },
    ],
  },
  {
    id: 'cmd-entrypoint',
    code: `ENTRYPOINT ["node"]        # l'exécutable (fixe)
CMD ["server.js"]          # les arguments PAR DÉFAUT (remplaçables)

docker run img             # → node server.js
docker run img --help      # → node --help (CMD remplacé, pas ENTRYPOINT)
docker run --entrypoint sh img   # le SEUL moyen de remplacer ENTRYPOINT

CMD node server.js         # 💥 forme shell : PID 1 = /bin/sh, pas node !`,
    ops: [
      { eval: 'ENTRYPOINT ["node"] + CMD ["server.js"]', value: 'node server.js', note: 'ENTRYPOINT = l\'exécutable, CMD = les arguments PAR DÉFAUT' },
      { eval: 'docker run img --help', value: 'node --help', note: 'les arguments de run REMPLACENT CMD, pas ENTRYPOINT' },
      { eval: 'docker run --entrypoint sh img', value: 'sh', note: 'le seul moyen de remplacer ENTRYPOINT' },
      { error: 'CMD node server.js', message: 'forme SHELL → PID 1 est /bin/sh, ton process ne reçoit pas SIGTERM — utiliser la forme exec ["node", "server.js"]' },
    ],
  },
  {
    id: 'volumes',
    code: `docker run -d --name db postgres   # les données vont dans la couche d'écriture…
# INSERT INTO users…                 # …du conteneur uniquement
docker rm db                         # 💥 couche d'écriture détruite → données perdues !

# ✓ le volume nommé vit indépendamment du conteneur
docker run -v pgdata:/var/lib/postgresql/data postgres
docker volume ls                     # pgdata survit aux conteneurs
# pour le dev : bind mount  -v ./src:/app  (hot reload)`,
    ops: [
      { eval: 'docker run -d --name db postgres', value: 'conteneur db démarré' },
      { eval: 'INSERT INTO users…', value: "données écrites dans la couche d'écriture du conteneur", note: 'rien ne sort du conteneur pour l\'instant' },
      { crash: 'docker rm db', message: "la couche d'écriture est DÉTRUITE avec le conteneur — toutes les données perdues" },
      { eval: 'docker run -v pgdata:/var/lib/postgresql/data postgres', value: 'les données survivent au conteneur', note: 'le volume vit indépendamment' },
      { eval: 'docker volume ls', value: 'pgdata', note: 'pour le dev : bind mount -v ./src:/app — les fichiers de l\'hôte, hot reload' },
    ],
  },
];

export const dockerBasicsScenarioById = (id) => DOCKERBASICS_SCENARIOS.find((s) => s.id === id);
