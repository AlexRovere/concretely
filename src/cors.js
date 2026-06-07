/**
 * CORS step by step, as an evaluation trace (shared evaltrace engine).
 * The running example: a page on https://app.exemple.com calls https://api.autre.com.
 *
 *  - simple requests (GET, no custom headers) are SENT — only the *response*
 *    is blocked from JS when Access-Control-Allow-Origin is missing;
 *  - non-simple requests (PUT, application/json…) trigger an OPTIONS preflight,
 *    whose verdict is cached via Access-Control-Max-Age;
 *  - credentials: 'include' is needed for cross-origin cookies, and then the
 *    wildcard `*` origin is rejected — the origin must be explicit;
 *  - CORS only exists in browsers: it protects the USER (their cookies),
 *    not the API — curl and servers ignore it entirely.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const CORS_SCENARIOS = [
  {
    id: 'simple-request',
    code: `# Page : https://app.exemple.com — appel vers https://api.autre.com
fetch('https://api.autre.com/users')   # GET, sans header custom
# → requête « simple » : elle PART, mais le navigateur
#   exige Access-Control-Allow-Origin pour livrer la réponse au JS`,
    ops: [
      { log: 'requête « simple » (GET, pas de header custom) → PAS de preflight, elle PART directement' },
      { eval: 'Origin: https://app.exemple.com', value: 'ajouté par le navigateur', note: 'le navigateur l\'ajoute lui-même — non falsifiable en JS' },
      { branch: 'Access-Control-Allow-Origin présent ?', taken: false, else: 'réponse BLOQUÉE en LECTURE par le navigateur — mais la requête a bien EU LIEU côté serveur !' },
      { crash: 'fetch(...)', message: 'TypeError: Failed to fetch — le JS ne voit RIEN de la réponse (ni status, ni body)' },
      { eval: 'Access-Control-Allow-Origin: https://app.exemple.com', value: 'lecture autorisée ✓', note: 'le serveur DOIT renvoyer ce header pour que le JS lise la réponse' },
    ],
  },
  {
    id: 'preflight',
    code: `# Qu'est-ce qui déclenche un preflight OPTIONS ?
fetch('https://api.autre.com/users/42', {
  method: 'PUT',                                    # méthode non simple
  headers: { 'Content-Type': 'application/json' },  # header non simple
  body: JSON.stringify({ name: 'Léa' }),
})`,
    ops: [
      { branch: 'méthode simple (GET/HEAD/POST) + headers simples ?', taken: false, else: 'un PUT avec Content-Type: application/json → preflight obligatoire' },
      { eval: 'OPTIONS /api/users', value: 'preflight', note: 'le navigateur demande la PERMISSION avant d\'envoyer la vraie requête' },
      { eval: 'Access-Control-Request-Method: PUT', value: 'envoyé dans le preflight', note: 'le navigateur annonce la méthode qu\'il VEUT utiliser' },
      { eval: 'Access-Control-Allow-Methods: GET, PUT', value: 'PUT autorisé ✓', note: 'le serveur répond : ces méthodes sont permises pour cette origine' },
      { eval: 'Access-Control-Max-Age: 86400', value: 'verdict mis en cache 24 h', note: 'le verdict du preflight est mis en cache — pas un OPTIONS par requête' },
      { log: 'la vraie requête PUT part enfin' },
    ],
  },
  {
    id: 'credentials',
    code: `# Cookies en cross-origin : rien ne part par défaut
fetch('https://api.autre.com/me', { credentials: 'include' })
# côté serveur, le joker * devient INTERDIT :
#   Access-Control-Allow-Origin: https://app.exemple.com
#   Access-Control-Allow-Credentials: true
# et le cookie doit être SameSite=None; Secure`,
    ops: [
      { eval: "fetch(url, { credentials: 'include' })", value: 'cookies joints à la requête', note: 'sans ça, AUCUN cookie ne part en cross-origin' },
      { error: 'Access-Control-Allow-Origin: *', message: 'avec credentials, le joker * est REFUSÉ — l\'origine doit être explicite, plus Access-Control-Allow-Credentials: true' },
      { eval: 'Allow-Origin: https://app.exemple.com + Allow-Credentials: true', value: 'cookies acceptés ✓', note: 'et le cookie lui-même doit être SameSite=None; Secure pour partir en cross-site' },
    ],
  },
  {
    id: 'misconceptions',
    code: `# Ce que CORS n'est PAS : une protection de ton API
curl https://api.autre.com/users    # 200 OK — aucun CORS ici !
# CORS ne vit QUE dans le navigateur ; pour protéger l'API,
# il faut de l'authentification (tokens, sessions…)`,
    ops: [
      { eval: 'curl https://api.autre.com/users', value: '200 OK', note: 'CORS n\'existe QUE dans le navigateur — curl, Postman, un serveur s\'en fichent' },
      { log: 'CORS ne protège PAS ton API — c\'est une protection de l\'UTILISATEUR (son navigateur, ses cookies) contre les sites malveillants' },
      { eval: 'pour protéger l\'API', value: 'authentification, pas CORS', note: 'tokens, sessions, clés API — CORS ne filtre rien côté serveur' },
      { branch: 'le header Origin peut-il être forgé par du JS ?', taken: false, else: 'non — le navigateur le contrôle ; c\'est toute la base du modèle' },
    ],
  },
];

export const corsScenarioById = (id) => CORS_SCENARIOS.find((s) => s.id === id);
