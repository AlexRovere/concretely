/**
 * HTTP request anatomy, as an evaluation trace (shared evaltrace engine):
 *  - what really happens when the browser fetches a URL — DNS resolution,
 *    TCP three-way handshake, TLS handshake, then the actual request/response,
 *    and keep-alive reusing the warm connection;
 *  - status code families and the classic confusables (301 vs 302, 401 vs 403,
 *    404 vs 410, 500 vs 502 vs 503);
 *  - method semantics per RFC 9110: safe (GET) vs idempotent (PUT, DELETE)
 *    vs neither (POST) — and why that decides whether a retry is safe.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const HTTPFLOW_SCENARIOS = [
  {
    id: 'anatomy',
    code: `# Le navigateur va chercher https://api.exemple.com/users
# 1. DNS      — traduire le nom en adresse IP
# 2. TCP      — ouvrir la connexion (poignée de main en 3 temps)
# 3. TLS      — chiffrer le canal (le "s" de https)
# 4. Requête  — ligne de requête + headers
# 5. Réponse  — status line + headers + corps
# 6. Keep-alive — la connexion reste ouverte pour la suite`,
    ops: [
      { eval: 'DNS api.exemple.com', value: '93.184.216.34', note: 'résolution DNS : cache navigateur → cache OS → résolveur — souvent 0 ms si déjà en cache' },
      { log: 'TCP : SYN → SYN-ACK → ACK — la poignée de main en 3 temps, la connexion est ouverte' },
      { eval: 'TLS handshake', value: 'canal chiffré', note: 'ClientHello, le serveur prouve son identité avec son certificat, puis échange des clés de session' },
      { eval: 'GET /users HTTP/1.1', value: 'ligne de requête', note: 'méthode + chemin + version — la première ligne envoyée' },
      { log: 'Headers : Host: api.exemple.com (obligatoire), Accept: application/json, User-Agent: …' },
      { eval: 'HTTP/1.1 200 OK', value: 'status line', note: 'la première ligne de la réponse : version + code + raison' },
      { log: 'Headers de réponse : Content-Type: application/json, Content-Length: 512' },
      { eval: 'corps de la réponse', value: '[{"id":1,…}]', note: 'le corps arrive après une ligne vide — Content-Length dit où il s\'arrête' },
      { branch: 'Connection: keep-alive ?', taken: true, then: 'la connexion TCP+TLS est réutilisée — les requêtes suivantes sautent les étapes 1 à 3' },
      { log: 'Requête suivante sur la même connexion : seulement l\'étape requête/réponse — bien plus rapide' },
    ],
  },
  {
    id: 'status-codes',
    code: `# Les familles : 2xx succès, 3xx redirection, 4xx erreur client, 5xx erreur serveur
200 OK          # succès générique
201 Created     # une ressource a été créée (réponse typique d'un POST)
204 No Content  # succès, mais rien à renvoyer (DELETE, PUT…)
301 vs 302      # redirection permanente vs temporaire — le navigateur CACHE le 301 !
401 vs 403      # « qui es-tu ? » vs « c'est non »
404 vs 410      # introuvable vs parti pour toujours
500 vs 502 vs 503  # la famille du serveur`,
    ops: [
      { eval: '200 OK', value: 'succès', note: 'le verbe du succès générique — la réponse contient ce qui a été demandé' },
      { eval: '201 Created', value: 'ressource créée', note: 'réponse typique d\'un POST réussi — le header Location pointe vers la nouvelle ressource' },
      { eval: '204 No Content', value: 'succès, corps vide', note: 'tout s\'est bien passé mais il n\'y a rien à renvoyer — fréquent après DELETE ou PUT' },
      { eval: '301 vs 302', value: 'permanent vs temporaire', note: 'le navigateur CACHE le 301 — attention aux redirects ratés : impossible de revenir en arrière sans vider le cache' },
      { eval: '401 vs 403', value: 'non authentifié vs non autorisé', note: '401 = « qui es-tu ? » (réessaie avec des identifiants), 403 = « je sais qui tu es, c\'est non »' },
      { eval: '404 vs 410', value: 'introuvable vs parti pour toujours', note: '410 Gone dit explicitement « ça existait, c\'est supprimé » — utile pour le SEO et les crawlers' },
      { eval: '500 vs 502 vs 503', value: 'bug serveur vs gateway vs indisponible', note: '500 = le serveur a planté, 502 = le proxy a reçu une réponse invalide de l\'amont, 503 = surcharge ou maintenance (réessaie plus tard, voir Retry-After)' },
    ],
  },
  {
    id: 'methods',
    code: `# Safe = aucun effet de bord ; idempotent = rejouer N fois = jouer 1 fois (RFC 9110)
GET /users/42            # safe ET idempotent
PUT /users/42 (x3)       # idempotent — même état final
POST /commandes (x3)     # 💥 NI safe NI idempotent
PATCH /users/42          # modification partielle
DELETE /users/42 (x2)    # idempotent — déjà parti = même état
# → un retry automatique n'est sûr que sur les méthodes idempotentes`,
    ops: [
      { eval: 'GET', value: 'safe', note: 'jamais d\'effet de bord — cachable, prefetchable, le navigateur peut le rejouer librement' },
      { eval: 'PUT /users/42 (x3)', value: 'même état', note: 'idempotent — rejouer ne change rien ; remplace TOUTE la ressource' },
      { crash: 'POST /commandes (x3)', message: '3 commandes créées ! POST n\'est PAS idempotent — d\'où les idempotency keys' },
      { eval: 'PATCH', value: 'modif partielle', note: 'n\'envoie que les champs à changer — pas idempotent en général (dépend du patch)' },
      { eval: 'DELETE', value: 'idempotent', note: 'idempotent : déjà parti = même état final (le 2e appel peut répondre 404, l\'état serveur est identique)' },
      { branch: 'un retry automatique est-il sûr ?', taken: true, then: 'sur GET/PUT/DELETE oui (idempotents) — sur POST non, sauf idempotency key' },
    ],
  },
];

export const httpFlowScenarioById = (id) => HTTPFLOW_SCENARIOS.find((s) => s.id === id);
