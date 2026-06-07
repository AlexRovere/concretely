/**
 * HTTP caching (RFC 9111), as an evaluation trace (shared evaltrace engine):
 *  - `max-age` freshness: while age < max-age the browser serves the disk copy
 *    without ANY network request (200 from disk cache, zero bytes transferred);
 *  - ETag / If-None-Match conditional revalidation: a stale copy costs one
 *    round-trip but a 304 Not Modified has an empty body (saves the transfer,
 *    not the latency); Last-Modified is the 1-second-precision fallback;
 *  - the misnamed duo: `no-cache` DOES store but revalidates on every use,
 *    `no-store` never writes anything; no Cache-Control at all triggers
 *    heuristic caching (typically 10% of the Last-Modified age);
 *  - the bundler pattern: content-hashed filenames + `max-age=31536000,
 *    immutable` for assets, `no-cache` for the index.html that names them —
 *    cache busting by construction, never by purging.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const HTTPCACHE_SCENARIOS = [
  {
    id: 'max-age',
    code: `GET /app.css                  # 1re fois — le serveur répond :
# 200 OK
# Cache-Control: max-age=3600   → "fraîche pendant 3600 s"

GET /app.css                  # 2e fois (10 min plus tard)
# 200 (from disk cache) — AUCUNE requête réseau !

# … 1 h 01 plus tard : la copie est PÉRIMÉE (stale)
GET /app.css                  # → revalidation auprès du serveur`,
    ops: [
      { eval: 'GET /app.css (1re fois)', value: '200 OK + Cache-Control: max-age=3600', note: 'le serveur déclare la réponse fraîche pendant 3600 s — le navigateur la stocke' },
      { eval: 'GET /app.css (2e fois)', value: '200 (from disk cache)', note: 'ZÉRO octet réseau — le navigateur ne demande même pas' },
      { branch: 'âge < max-age ?', taken: true, then: 'la copie est FRAÎCHE — servie sans réseau' },
      { eval: 'GET /app.css (après 3600 s)', value: 'copie périmée (stale) → revalidation nécessaire', note: 'périmé ≠ supprimé — le cache garde la copie et demande au serveur si elle est encore bonne' },
    ],
  },
  {
    id: 'etag',
    code: `GET /api/articles             # 1re réponse :
# 200 OK
# ETag: "abc123"               → l'empreinte du contenu

# Copie périmée → revalidation CONDITIONNELLE :
GET /api/articles
# If-None-Match: "abc123"      → "j'ai déjà la version abc123"

# Le fichier n'a pas changé côté serveur :
# 304 Not Modified — corps VIDE, on garde la copie locale
# (s'il avait changé : 200 + nouveau contenu + nouveau ETag)`,
    ops: [
      { eval: 'ETag: "abc123"', value: "l'empreinte du contenu", note: 'le serveur étiquette chaque version de la ressource' },
      { eval: 'If-None-Match: "abc123"', value: 'requête conditionnelle — « envoie le corps seulement si ça a changé »', note: 'le navigateur renvoie l\'ETag de sa copie périmée' },
      { branch: 'le fichier a changé côté serveur ?', taken: false, else: 'même ETag → le serveur répond 304 sans corps' },
      { eval: '304 Not Modified', value: 'corps VIDE — la copie locale redevient fraîche', note: '« ta copie est bonne » — on économise le transfert, pas la latence' },
      { eval: "s'il AVAIT changé", value: '200 + nouveau contenu + nouveau ETag', note: 'Last-Modified joue le même rôle en version pauvre (précision 1 s) — l\'ETag gagne s\'il y a les deux' },
    ],
  },
  {
    id: 'no-store-no-cache',
    code: `Cache-Control: no-cache       # nom TROMPEUR : ça cache quand même !
# → stocké sur disque, mais revalidé à chaque utilisation (304 possible)

Cache-Control: no-store       # le VRAI "ne cache pas"
# → jamais écrit nulle part (mots de passe, données médicales…)

# … et sans Cache-Control du tout ?
# → caching HEURISTIQUE : le navigateur décide TOUT SEUL 💥`,
    ops: [
      { eval: 'Cache-Control: no-cache', value: 'stocké, mais revalidé À CHAQUE FOIS', note: 'nom trompeur — ça CACHE, mais ça ne sert jamais sans demander (304 possible)' },
      { eval: 'Cache-Control: no-store', value: 'jamais écrit nulle part', note: 'le vrai « ne cache pas » — pour les données sensibles (mots de passe, santé…)' },
      { crash: 'pas de Cache-Control du tout', message: 'caching HEURISTIQUE — le navigateur décide tout seul (10 % de l\'âge Last-Modified), comportements surprises garantis' },
    ],
  },
  {
    id: 'immutable-hash',
    code: `# Le pattern des bundlers (Vite, webpack…) :
app.BqK3x9.js                 # hash du CONTENU dans le nom
# Cache-Control: max-age=31536000, immutable
# → caché UN AN, jamais revalidé

index.html                    # le point d'entrée, lui…
# Cache-Control: no-cache
# → toujours revalidé : c'est lui qui pointe vers les hashes

# Déployer = publier de NOUVEAUX fichiers (nouveaux hashes),
# jamais écraser les anciens. "Vider le cache" ? Jamais utile.`,
    ops: [
      { eval: 'app.BqK3x9.js + Cache-Control: max-age=31536000, immutable', value: 'caché un an, jamais revalidé', note: "le HASH dans le nom change quand le contenu change — l'URL est immuable par construction" },
      { eval: 'index.html + Cache-Control: no-cache', value: 'toujours revalidé (304 si inchangé)', note: "c'est LUI qui pointe vers les nouveaux hashes" },
      { log: 'déployer = publier de nouveaux fichiers, jamais écraser les anciens' },
      { branch: 'faut-il « vider le cache » des utilisateurs ?', taken: false, else: 'jamais nécessaire avec ce pattern — les nouvelles URLs contournent le cache naturellement' },
    ],
  },
];

export const httpCacheScenarioById = (id) => HTTPCACHE_SCENARIOS.find((s) => s.id === id);
