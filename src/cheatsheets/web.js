/**
 * Cheatsheet HTTP / Web — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'web',
  lang: 'bash',
  sections: [
    {
      id: 'status',
      title: { fr: 'Codes de statut', en: 'Status codes' },
      items: [
        {
          id: 'web-status-families',
          title: { fr: 'Les familles 2xx/3xx/4xx/5xx', en: 'The 2xx/3xx/4xx/5xx families' },
          code: `# 2xx : succès (200 OK, 201 Created, 204 No Content)
# 3xx : redirection (301, 302, 304 Not Modified)
# 4xx : erreur CLIENT — la requête est fautive
# 5xx : erreur SERVEUR — le serveur a planté`,
          note: {
            fr: `Le premier chiffre dit qui doit corriger : 4xx = le client doit changer sa requête, 5xx = le serveur a un bug. Réessayer un 4xx à l'identique ne sert à rien ; un 5xx, parfois oui.`,
            en: `The first digit says who must fix things: 4xx = the client must change its request, 5xx = the server has a bug. Retrying a 4xx unchanged is pointless; a 5xx, sometimes worth it.`,
          },
        },
        {
          id: 'web-status-redirects',
          title: { fr: '301 vs 302 vs 307/308', en: '301 vs 302 vs 307/308' },
          code: `# 301 : permanent — caché par le navigateur, SEO transféré
# 302 : temporaire — re-vérifié à chaque fois
# Piège : 301/302 peuvent transformer POST en GET
# 307/308 : pareil mais GARANTISSENT la méthode (POST reste POST)`,
          note: {
            fr: `Un 301 est mis en cache quasi définitivement : se tromper coûte cher (vider le cache navigateur ne suffit pas toujours). Pour rediriger un POST sans le casser, utilisez 307 (temporaire) ou 308 (permanent).`,
            en: `A 301 is cached almost forever: getting it wrong is costly (clearing the browser cache is not always enough). To redirect a POST without breaking it, use 307 (temporary) or 308 (permanent).`,
          },
        },
        {
          id: 'web-status-401-403',
          title: { fr: '401 vs 403', en: '401 vs 403' },
          code: `# 401 Unauthorized : "qui es-tu ?" — pas (ou mal) authentifié
#   => renvoyer WWW-Authenticate, le client peut réessayer avec un token
# 403 Forbidden : "je sais qui tu es, et c'est non"
#   => authentifié mais pas les droits ; réessayer ne changera rien`,
          note: {
            fr: `Le nom 401 "Unauthorized" est trompeur : il signifie en réalité "non authentifié". 403 = authentifié mais non autorisé. Certains préfèrent renvoyer 404 à la place de 403 pour ne pas révéler l'existence d'une ressource.`,
            en: `The 401 name "Unauthorized" is misleading: it actually means "not authenticated". 403 = authenticated but not allowed. Some APIs return 404 instead of 403 to avoid revealing that a resource exists.`,
          },
        },
        {
          id: 'web-status-404-410',
          title: { fr: '404 vs 410', en: '404 vs 410' },
          code: `# 404 Not Found : introuvable — peut-être temporaire, peut-être une typo
# 410 Gone : a existé, supprimé VOLONTAIREMENT, ne reviendra pas
curl -i https://api.exemple.fr/articles/supprime
# HTTP/1.1 410 Gone  => les crawlers désindexent plus vite`,
          note: {
            fr: `404 ne promet rien : la ressource peut apparaître demain. 410 est un signal fort pour le SEO et les clients : inutile de réessayer, supprimez vos liens. Utile pour les contenus retirés définitivement (RGPD, dépublication).`,
            en: `404 promises nothing: the resource may appear tomorrow. 410 is a strong signal for SEO and clients: no point retrying, drop your links. Useful for permanently removed content (GDPR, unpublishing).`,
          },
        },
        {
          id: 'web-status-429',
          title: { fr: '429 + Retry-After', en: '429 + Retry-After' },
          code: `# Trop de requêtes : le serveur dit QUAND revenir
HTTP/1.1 429 Too Many Requests
Retry-After: 30          # en secondes (ou une date HTTP)
X-RateLimit-Remaining: 0 # convention fréquente des API`,
          note: {
            fr: `Un bon client lit Retry-After et attend, au lieu de marteler le serveur (ce qui aggrave le rate limiting). Sans cet en-tête, appliquez un backoff exponentiel avec jitter.`,
            en: `A good client reads Retry-After and waits, instead of hammering the server (which makes rate limiting worse). Without this header, apply exponential backoff with jitter.`,
          },
        },
        {
          id: 'web-status-5xx',
          title: { fr: '500/502/503/504 : qui est coupable', en: '500/502/503/504: who is to blame' },
          code: `# 500 : TON code a levé une exception non gérée
# 502 Bad Gateway : le proxy a reçu une réponse invalide de l'upstream
# 503 : service indisponible (déploiement, surcharge) — temporaire
# 504 Gateway Timeout : l'upstream n'a JAMAIS répondu à temps`,
          note: {
            fr: `Devant un load balancer : 500 = bug applicatif, 502 = l'app a crashé ou répond n'importe quoi, 503 = l'app est down ou en maintenance, 504 = l'app est trop lente. Ça oriente directement le debug.`,
            en: `Behind a load balancer: 500 = application bug, 502 = the app crashed or returned garbage, 503 = the app is down or in maintenance, 504 = the app is too slow. This directly points the debugging.`,
          },
        },
        {
          id: 'web-http-methods-safety',
          title: { fr: 'Méthodes HTTP : sûres et/ou idempotentes', en: 'HTTP methods: safe and/or idempotent' },
          code: `# Sûre (safe) = ne modifie rien côté serveur : GET, HEAD, OPTIONS
# Idempotente = même résultat si rejouée 1 fois ou 100 fois
#   GET, HEAD, PUT, DELETE, OPTIONS  -> idempotentes
#   POST, PATCH                      -> PAS idempotentes
curl -X PUT https://api.exemple.fr/users/42 -d '{"nom":"Ada"}'
# Rejouer ce PUT 3 fois => même état final. Rejouer un POST 3 fois
# créerait 3 ressources (sauf si l'API gère une Idempotency-Key).`,
          note: {
            fr: `Sûre = pas d'effet de bord observable (les GET traqués par un CDN restent "sûrs"). Idempotente = rejouable sans risque, ce qui légitime les retries automatiques sur GET/PUT/DELETE. Un POST de paiement rejoué sans protection double la facture — d'où le pattern Idempotency-Key sur les API de paiement.`,
            en: `Safe = no observable side effect (a GET tracked by a CDN is still "safe"). Idempotent = replayable without risk, which is why automatic retries are safe on GET/PUT/DELETE. A replayed payment POST without protection double-charges — hence the Idempotency-Key pattern on payment APIs.`,
          },
        },
      ],
    },
    {
      id: 'req-headers',
      title: { fr: 'Headers de requête', en: 'Request headers' },
      items: [
        {
          id: 'web-req-authorization',
          title: { fr: 'Authorization: Bearer', en: 'Authorization: Bearer' },
          code: `# Le schéma standard pour les tokens (JWT, OAuth2…)
curl -H "Authorization: Bearer eyJhbGciOi..." \\
  https://api.exemple.fr/me
# Autres schémas : Basic (base64 user:pass), ApiKey…`,
          note: {
            fr: `"Bearer" = "porteur" : quiconque détient le token est considéré authentifié, d'où l'importance du HTTPS. Ne mettez jamais un token dans l'URL : il finirait dans les logs et l'historique.`,
            en: `"Bearer" means whoever holds the token is considered authenticated, hence the importance of HTTPS. Never put a token in the URL: it would end up in logs and browser history.`,
          },
        },
        {
          id: 'web-req-content-type-accept',
          title: { fr: 'Content-Type vs Accept', en: 'Content-Type vs Accept' },
          code: `# Content-Type : le format de ce que J'ENVOIE (le body)
# Accept : le format que je VEUX recevoir
curl -X POST https://api.exemple.fr/users \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"nom":"Ada"}'`,
          note: {
            fr: `Confusion classique : Content-Type décrit le body envoyé, Accept négocie la réponse. Oublier Content-Type sur un POST JSON donne souvent un 415 Unsupported Media Type ou un body vide côté serveur.`,
            en: `Classic confusion: Content-Type describes the body you send, Accept negotiates the response. Forgetting Content-Type on a JSON POST often yields 415 Unsupported Media Type or an empty body server-side.`,
          },
        },
        {
          id: 'web-req-origin-referer-ua',
          title: { fr: 'Origin, Referer, User-Agent', en: 'Origin, Referer, User-Agent' },
          code: `Origin: https://app.exemple.fr   # schéma+domaine+port, SANS chemin
Referer: https://app.exemple.fr/panier?promo=ETE  # URL complète
User-Agent: Mozilla/5.0 ... Chrome/125.0  # tous disent "Mozilla"
# Pour un script/bot, soyez identifiable :
curl -A "MonBot/1.0 (+https://exemple.fr/bot)" https://exemple.fr`,
          note: {
            fr: `Origin est envoyé sur les requêtes cross-origin (base du CORS) et ne fuite jamais le chemin ; Referer peut fuiter des données sensibles dans l'URL — d'où Referrer-Policy pour le tronquer. Ne basez aucune fonctionnalité sur le User-Agent : feature detection > UA sniffing.`,
            en: `Origin is sent on cross-origin requests (the basis of CORS) and never leaks the path; Referer can leak sensitive data in the URL — hence Referrer-Policy to trim it. Never gate a feature on the User-Agent: feature detection > UA sniffing.`,
          },
        },
        {
          id: 'web-req-conditional',
          title: { fr: 'If-None-Match / If-Modified-Since', en: 'If-None-Match / If-Modified-Since' },
          code: `# Requête conditionnelle : "donne-moi le fichier SEULEMENT s'il a changé"
curl -i -H 'If-None-Match: "abc123"' https://exemple.fr/app.js
# => 304 Not Modified (body vide) si l'ETag correspond
# If-Modified-Since: date — variante moins précise`,
          note: {
            fr: `C'est le mécanisme de revalidation du cache : le serveur répond 304 sans body si rien n'a changé, économisant la bande passante. If-None-Match (ETag) prime sur If-Modified-Since quand les deux sont présents.`,
            en: `This is cache revalidation: the server answers 304 with no body when nothing changed, saving bandwidth. If-None-Match (ETag) takes precedence over If-Modified-Since when both are present.`,
          },
        },
        {
          id: 'web-req-range',
          title: { fr: 'Range : téléchargement partiel', en: 'Range: partial download' },
          code: `# Demander seulement les octets 0 à 1023
curl -H "Range: bytes=0-1023" https://exemple.fr/video.mp4
# => 206 Partial Content + Content-Range: bytes 0-1023/889032
# Reprendre un téléchargement : curl -C - -O https://exemple.fr/gros.iso`,
          note: {
            fr: `Base du streaming vidéo et de la reprise de téléchargement. Le serveur annonce son support via Accept-Ranges: bytes. S'il l'ignore, il renvoie un 200 avec le fichier complet — gérez les deux cas.`,
            en: `The basis of video streaming and download resuming. The server advertises support via Accept-Ranges: bytes. If it ignores Range, it returns 200 with the full file — handle both cases.`,
          },
        },
      ],
    },
    {
      id: 'resp-headers',
      title: { fr: 'Headers de réponse', en: 'Response headers' },
      items: [
        {
          id: 'web-resp-content-type',
          title: { fr: 'Content-Type + charset', en: 'Content-Type + charset' },
          code: `Content-Type: text/html; charset=utf-8
Content-Type: application/json
# Sans charset, le navigateur DEVINE => accents cassés (Ã©)
# JSON est toujours UTF-8 par spécification`,
          note: {
            fr: `Si vous voyez "Ã©" à la place de "é", c'est presque toujours un charset manquant ou faux sur du text/html. Le navigateur fait confiance à ce header plus qu'à l'extension du fichier ou au contenu.`,
            en: `If you see "Ã©" instead of "é", it is almost always a missing or wrong charset on text/html. The browser trusts this header more than the file extension or the content itself.`,
          },
        },
        {
          id: 'web-resp-location',
          title: { fr: 'Location : la cible de redirection', en: 'Location: the redirect target' },
          code: `HTTP/1.1 302 Found
Location: https://exemple.fr/connexion
# Aussi utilisé avec 201 Created :
# Location: /api/users/42   <- URL de la ressource créée`,
          note: {
            fr: `Avec un 3xx, Location indique où aller ; avec un 201, elle indique l'URL de la ressource fraîchement créée — convention REST trop souvent oubliée. Une URL relative est résolue par rapport à la requête.`,
            en: `With a 3xx, Location says where to go; with a 201, it gives the URL of the freshly created resource — a REST convention too often forgotten. A relative URL is resolved against the request.`,
          },
        },
        {
          id: 'web-resp-set-cookie',
          title: { fr: 'Set-Cookie et ses attributs', en: 'Set-Cookie and its attributes' },
          code: `Set-Cookie: session=abc123; Path=/; Max-Age=3600;
  HttpOnly; Secure; SameSite=Lax
# HttpOnly : invisible pour JS (anti-XSS)
# Secure : envoyé seulement en HTTPS
# Max-Age=0 ou Expires passé : supprime le cookie`,
          note: {
            fr: `Un cookie de session doit cumuler HttpOnly + Secure + SameSite. Sans Max-Age ni Expires, c'est un cookie de session, effacé à la fermeture du navigateur. Un Set-Cookie par cookie : on ne les combine pas.`,
            en: `A session cookie should combine HttpOnly + Secure + SameSite. Without Max-Age or Expires it is a session cookie, cleared when the browser closes. One Set-Cookie per cookie: they cannot be combined.`,
          },
        },
        {
          id: 'web-resp-cors',
          title: { fr: 'Access-Control-Allow-* (CORS)', en: 'Access-Control-Allow-* (CORS)' },
          code: `Access-Control-Allow-Origin: https://app.exemple.fr
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
# Piège : Allow-Origin: * est INCOMPATIBLE avec Credentials: true`,
          note: {
            fr: `CORS est appliqué par le NAVIGATEUR, pas le serveur : curl n'est jamais bloqué. C'est le serveur cible qui doit envoyer ces headers — modifier le code front ne corrige jamais une erreur CORS.`,
            en: `CORS is enforced by the BROWSER, not the server: curl is never blocked. The target server must send these headers — changing front-end code never fixes a CORS error.`,
          },
        },
        {
          id: 'web-cors-preflight',
          title: { fr: 'Preflight CORS : la requête OPTIONS invisible', en: 'CORS preflight: the invisible OPTIONS request' },
          code: `# Le navigateur envoie OPTIONS AVANT la vraie requête si :
#  - méthode hors GET/POST/HEAD (PUT, DELETE, PATCH...)
#  - header custom (Authorization, X-Custom...)
#  - Content-Type autre que form/text/plain
OPTIONS /api/users HTTP/1.1
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: authorization
# Réponse attendue :
Access-Control-Allow-Methods: GET, POST, DELETE
Access-Control-Allow-Headers: Authorization
Access-Control-Max-Age: 86400   # met le preflight en cache 24h`,
          note: {
            fr: `Le preflight double chaque requête "non simple" d'un aller-retour OPTIONS invisible dans le code applicatif — visible seulement dans l'onglet réseau. Sans Access-Control-Max-Age, le navigateur le refait à chaque requête ; avec, il le met en cache jusqu'à la durée indiquée (plafonnée par le navigateur, souvent 2h max sur Chrome).`,
            en: `Preflight doubles every "non-simple" request with an invisible OPTIONS round trip — invisible in application code, visible only in the network tab. Without Access-Control-Max-Age, the browser repeats it every time; with it, the browser caches the result up to that duration (capped by the browser, often 2h max on Chrome).`,
          },
        },
        {
          id: 'web-resp-content-disposition',
          title: { fr: 'Content-Disposition : afficher ou télécharger', en: 'Content-Disposition: display or download' },
          code: `# Forcer le téléchargement avec un nom de fichier
Content-Disposition: attachment; filename="rapport-2026.pdf"
# Afficher dans l'onglet (comportement par défaut)
Content-Disposition: inline`,
          note: {
            fr: `attachment force la boîte de téléchargement même pour un PDF ou une image que le navigateur sait afficher. Pour les noms avec accents, utilisez filename*=UTF-8''rapport%20%C3%A9t%C3%A9.pdf.`,
            en: `attachment forces the download dialog even for a PDF or image the browser could display. For accented filenames, use the filename*=UTF-8''... encoded form.`,
          },
        },
        {
          id: 'web-resp-request-id',
          title: { fr: 'X-Request-Id : tracer une requête', en: 'X-Request-Id: trace a request' },
          code: `# Le serveur (ou le proxy) attache un identifiant unique
X-Request-Id: 7f3a9c2e-41b8-4d6a-9e21-c0ffee123456
# Côté client, on le logue ; côté support :
# "Ça a planté" -> "Donnez-moi le X-Request-Id"`,
          note: {
            fr: `Un identifiant par requête, propagé dans les logs de tous les services traversés : c'est LE fil d'Ariane pour déboguer en production. Variante standardisée : le header traceparent (W3C Trace Context).`,
            en: `One id per request, propagated through the logs of every service involved: it is THE breadcrumb for debugging in production. Standardized variant: the traceparent header (W3C Trace Context).`,
          },
        },
      ],
    },
    {
      id: 'cache',
      title: { fr: 'Cache', en: 'Caching' },
      items: [
        {
          id: 'web-cache-control-basics',
          title: { fr: 'Cache-Control : max-age, private/public', en: 'Cache-Control: max-age, private/public' },
          code: `# Réutilisable pendant 1 heure sans redemander au serveur
Cache-Control: max-age=3600
# private : cache navigateur seulement ; public : CDN/proxys aussi
Cache-Control: private, max-age=600
Cache-Control: public, s-maxage=86400  # durée dédiée aux proxys`,
          note: {
            fr: `Pendant max-age, le navigateur ne contacte même pas le serveur — le cache le plus rapide qui existe. private protège les réponses personnalisées (panier, profil) d'un cache partagé qui les servirait à d'autres utilisateurs.`,
            en: `During max-age the browser does not even contact the server — the fastest cache there is. private keeps personalized responses (cart, profile) out of shared caches that would serve them to other users.`,
          },
        },
        {
          id: 'web-cache-nocache-nostore',
          title: { fr: 'no-cache vs no-store', en: 'no-cache vs no-store' },
          code: `# no-cache : STOCKE mais REVALIDE à chaque fois (304 possible)
Cache-Control: no-cache
# no-store : ne stocke RIEN, nulle part (données sensibles)
Cache-Control: no-store`,
          note: {
            fr: `Le piège du siècle : no-cache N'EMPÊCHE PAS la mise en cache, il force juste une revalidation (souvent un 304 rapide). Pour interdire tout stockage — données bancaires, médicales — c'est no-store.`,
            en: `The classic trap: no-cache does NOT prevent caching, it only forces revalidation (often a fast 304). To forbid any storage — banking, medical data — you want no-store.`,
          },
        },
        {
          id: 'web-cache-etag-304',
          title: { fr: 'ETag + 304 Not Modified', en: 'ETag + 304 Not Modified' },
          code: `# 1re réponse : le serveur fournit une empreinte du contenu
ETag: "33a64df5"
# Requêtes suivantes : le client la renvoie
If-None-Match: "33a64df5"
# Inchangé ? => 304 sans body, le cache local est réutilisé`,
          note: {
            fr: `Le 304 économise le transfert du body mais coûte quand même un aller-retour réseau. ETag fort = octets identiques ; ETag faible (W/"…") = sémantiquement équivalent. Attention aux ETags différents entre serveurs d'un cluster.`,
            en: `A 304 saves the body transfer but still costs a network round trip. Strong ETag = identical bytes; weak ETag (W/"…") = semantically equivalent. Beware of ETags differing across servers in a cluster.`,
          },
        },
        {
          id: 'web-cache-vary',
          title: { fr: 'Vary : la clé de cache', en: 'Vary: the cache key' },
          code: `# "La réponse dépend de ces headers de requête"
Vary: Accept-Encoding          # gzip vs brotli vs identité
Vary: Accept-Language, Cookie  # version FR vs EN, etc.
# Sans Vary correct, un cache sert la MAUVAISE variante`,
          note: {
            fr: `Vary dit au cache d'indexer la réponse par certains headers. Oublier Vary: Accept-Encoding peut servir du gzip à un client qui ne le décode pas. Vary: Cookie rend en pratique la réponse incachable en partagé.`,
            en: `Vary tells caches to key the response on certain headers. Forgetting Vary: Accept-Encoding can serve gzip to a client that cannot decode it. Vary: Cookie effectively makes the response uncacheable in shared caches.`,
          },
        },
        {
          id: 'web-cache-compression',
          title: { fr: 'Compression : Content-Encoding et Accept-Encoding', en: 'Compression: Content-Encoding and Accept-Encoding' },
          code: `# Le client annonce ce qu'il sait décoder
Accept-Encoding: gzip, br, deflate
# Le serveur choisit et le déclare
Content-Encoding: br
Vary: Accept-Encoding   # sinon un cache peut servir du br à qui ne le lit pas
curl -H "Accept-Encoding: gzip" -i https://exemple.fr/app.js`,
          note: {
            fr: `br (Brotli) compresse mieux que gzip mais coûte plus de CPU serveur ; beaucoup d'infra ne l'active qu'en statique pré-compressé. Sans Vary: Accept-Encoding, un cache/CDN partagé peut mémoriser une réponse compressée et la resservir telle quelle à un client qui ne sait pas la décoder.`,
            en: `br (Brotli) compresses better than gzip but costs more server CPU; a lot of setups only enable it for pre-compressed static assets. Without Vary: Accept-Encoding, a shared cache/CDN can store a compressed response and serve it as-is to a client that can't decode it.`,
          },
        },
        {
          id: 'web-cache-hash-immutable',
          title: { fr: 'Le pattern hash + immutable', en: 'The hash + immutable pattern' },
          code: `# Les bundlers (Vite, webpack) mettent un hash dans le nom :
#   /assets/app.3f9c1b.js   <- contenu change => nom change
Cache-Control: public, max-age=31536000, immutable
# Et l'HTML qui les référence reste court ou no-cache :
Cache-Control: no-cache   # sur index.html`,
          note: {
            fr: `Le duo gagnant du web moderne : assets hashés cachés 1 an + HTML revalidé à chaque visite. Déployer = nouveaux noms de fichiers, donc jamais de cache obsolète et jamais de "videz votre cache" aux utilisateurs.`,
            en: `The winning duo of the modern web: hashed assets cached for 1 year + HTML revalidated on every visit. Deploying means new filenames, so never a stale cache and never telling users to "clear your cache".`,
          },
        },
      ],
    },
    {
      id: 'security',
      title: { fr: 'Sécurité', en: 'Security' },
      items: [
        {
          id: 'web-sec-hsts',
          title: { fr: 'HTTPS partout + HSTS', en: 'HTTPS everywhere + HSTS' },
          code: `# "Pendant 2 ans, ne me contacte QUE en HTTPS"
Strict-Transport-Security: max-age=63072000; includeSubDomains
# Le navigateur réécrit http:// en https:// AVANT toute requête
# => supprime la fenêtre d'attaque du premier hit en clair`,
          note: {
            fr: `La redirection 301 http→https laisse passer une première requête en clair, interceptable (SSL stripping). HSTS la supprime pour les visites suivantes. Prudence avec includeSubDomains : ça engage tous vos sous-domaines.`,
            en: `The 301 http→https redirect still allows one first plaintext request, which can be intercepted (SSL stripping). HSTS removes it for later visits. Be careful with includeSubDomains: it commits every subdomain.`,
          },
        },
        {
          id: 'web-sec-csp',
          title: { fr: 'CSP en 3 lignes', en: 'CSP in 3 lines' },
          code: `Content-Security-Policy: default-src 'self';
  script-src 'self' https://cdn.exemple.fr;
  img-src 'self' data:
# Bloque tout script inline / domaine non listé => anti-XSS`,
          note: {
            fr: `La CSP est la défense en profondeur contre le XSS : même si un attaquant injecte du HTML, son script ne s'exécute pas. Déployez d'abord en Content-Security-Policy-Report-Only pour mesurer la casse sans rien bloquer.`,
            en: `CSP is the defense-in-depth against XSS: even if an attacker injects HTML, their script will not run. Deploy first as Content-Security-Policy-Report-Only to measure breakage without blocking anything.`,
          },
        },
        {
          id: 'web-sec-samesite',
          title: { fr: 'SameSite (anti-CSRF) : Lax / Strict / None', en: 'SameSite (anti-CSRF): Lax / Strict / None' },
          code: `# Lax (défaut moderne) : envoyé en navigation top-level GET,
#   PAS sur les POST/fetch cross-site => bloque l'essentiel du CSRF
Set-Cookie: session=abc; SameSite=Lax; Secure; HttpOnly
# Strict : jamais en cross-site (même un lien cliqué arrive déconnecté)
# None : toujours envoyé — exige Secure (iframes, SSO tiers)`,
          note: {
            fr: `Lax est le bon défaut : il bloque les requêtes forgées tout en laissant les liens entrants fonctionner connecté. Mais SameSite raisonne par SITE : un sous-domaine compromis peut encore forger des requêtes — gardez un token CSRF pour les actions sensibles (paiement, suppression).`,
            en: `Lax is the right default: it blocks forged requests while keeping inbound links logged-in. But SameSite reasons per SITE: a compromised subdomain can still forge requests — keep a CSRF token for sensitive actions (payment, deletion).`,
          },
        },
        {
          id: 'web-sec-nosniff',
          title: { fr: 'X-Content-Type-Options: nosniff', en: 'X-Content-Type-Options: nosniff' },
          code: `X-Content-Type-Options: nosniff
# Sans : le navigateur "devine" le type d'un fichier ambigu
# => un upload .txt contenant du JS peut être exécuté comme script
# Avec : le Content-Type déclaré fait foi, point final`,
          note: {
            fr: `Le MIME sniffing transformait des uploads anodins en vecteurs XSS : le navigateur exécutait ce qui "ressemblait" à du script. nosniff coûte une ligne et ferme cette classe d'attaques — à mettre partout, toujours.`,
            en: `MIME sniffing used to turn harmless uploads into XSS vectors: the browser executed whatever "looked like" script. nosniff costs one line and closes that attack class — set it everywhere, always.`,
          },
        },
        {
          id: 'web-sec-hide-server',
          title: { fr: 'Headers à NE PAS exposer', en: 'Headers NOT to expose' },
          code: `# À supprimer de vos réponses en production :
Server: Apache/2.4.41 (Ubuntu)   # version exacte = CVE sur un plateau
X-Powered-By: PHP/7.2.1          # idem
# nginx : server_tokens off;   Express : app.disable('x-powered-by')`,
          note: {
            fr: `Annoncer "Apache 2.4.41" permet à un attaquant de chercher directement les CVE de cette version. Ce n'est pas une vraie protection (security through obscurity) mais c'est gratuit et ça élimine les scans opportunistes.`,
            en: `Advertising "Apache 2.4.41" lets an attacker look up the CVEs for that exact version. It is not real protection (security through obscurity) but it is free and weeds out opportunistic scans.`,
          },
        },
      ],
    },
    {
      id: 'curl',
      title: { fr: 'Debug avec curl', en: 'Debugging with curl' },
      items: [
        {
          id: 'web-curl-headers',
          title: { fr: '-i / -I : voir les headers', en: '-i / -I: see the headers' },
          code: `curl -i https://exemple.fr        # headers + body
curl -I https://exemple.fr        # requête HEAD : headers seuls
# Premier réflexe : statut ? Content-Type ? Cache-Control ?`,
          note: {
            fr: `-I envoie un vrai HEAD : certains serveurs y répondent différemment d'un GET (voire 405). Pour voir les headers d'un vrai GET sans le body : curl -sI peut mentir, préférez -s -D - -o /dev/null.`,
            en: `-I sends an actual HEAD: some servers answer it differently from a GET (even 405). To see the headers of a real GET without the body: -I can lie, prefer -s -D - -o /dev/null.`,
          },
        },
        {
          id: 'web-curl-post',
          title: { fr: 'POST JSON : -X, -d, -H (et httpie)', en: 'POST JSON: -X, -d, -H (and httpie)' },
          code: `curl -X POST https://api.exemple.fr/users \\
  -H "Content-Type: application/json" \\
  -d '{"nom": "Ada", "role": "admin"}'
# -d implique déjà POST ; -X PUT/-X PATCH pour les autres verbes
# Alternative httpie : JSON auto, syntaxe clé=valeur, sortie colorée
http POST api.exemple.fr/users nom=Ada role=admin`,
          note: {
            fr: `Piège n°1 : sans -H Content-Type, curl envoie application/x-www-form-urlencoded et le serveur ne parse pas votre JSON. -d @fichier.json lit le body depuis un fichier. httpie est plus agréable au quotidien, mais curl est préinstallé partout (CI, serveurs).`,
            en: `Trap #1: without -H Content-Type, curl sends application/x-www-form-urlencoded and the server fails to parse your JSON. -d @file.json reads the body from a file. httpie is nicer day to day, but curl is preinstalled everywhere (CI, servers).`,
          },
        },
        {
          id: 'web-curl-follow',
          title: { fr: '-L : suivre les redirections', en: '-L: follow redirects' },
          code: `# Sans -L, curl s'arrête au premier 301/302 (body vide)
curl -L https://exemple.fr        # suit la chaîne jusqu'au 200
# Voir toute la chaîne de redirections :
curl -sIL https://exemple.fr | grep -iE "^(HTTP|location)"`,
          note: {
            fr: `"Pourquoi curl me renvoie une page vide ?" — souvent un 301 non suivi. Notez que par défaut, en suivant un redirect, curl retransforme un POST en GET (comme un navigateur) ; --post301/--post302 pour l'éviter.`,
            en: `"Why does curl return an empty page?" — often an unfollowed 301. Note that when following a redirect, curl turns a POST into a GET by default (like a browser); use --post301/--post302 to prevent that.`,
          },
        },
        {
          id: 'web-curl-status-only',
          title: { fr: 'Récupérer juste le code de statut', en: 'Get just the status code' },
          code: `curl -s -o /dev/null -w '%{http_code}' https://exemple.fr
# -s : silencieux, -o : jette le body, -w : écrit la variable
# Autres variables : %{time_total} %{size_download} %{url_effective}
curl -s -o /dev/null -w '%{time_total}s' https://api.exemple.fr/ping`,
          note: {
            fr: `L'idiome parfait pour les health checks et les scripts CI : une seule valeur en sortie, exploitable dans un if. Combinez avec -L et %{url_effective} pour vérifier où atterrit une chaîne de redirections.`,
            en: `The perfect idiom for health checks and CI scripts: a single value as output, easy to test in an if. Combine with -L and %{url_effective} to check where a redirect chain actually lands.`,
          },
        },
        {
          id: 'web-curl-resolve-verbose',
          title: { fr: '--resolve et -v : DNS, vhost, TLS', en: '--resolve and -v: DNS, vhost, TLS' },
          code: `# Tester un NOUVEAU serveur AVANT de changer le DNS public
curl --resolve exemple.fr:443:203.0.113.7 https://exemple.fr
# => vrai Host + vrai certificat (mieux que modifier /etc/hosts)
curl -v https://exemple.fr 2>&1 | grep -E "subject|expire|SSL|TLS"
# -v : handshake TLS, certificat, headers envoyés (>) / reçus (<)`,
          note: {
            fr: `--resolve est indispensable avant une migration DNS : on vérifie SNI, vhost et certificat sans toucher au DNS public. -v est l'outil de diagnostic des erreurs de certificat (expiré, mauvais CN, chaîne incomplète).`,
            en: `--resolve is essential before a DNS migration: verify SNI, vhost and certificate without touching public DNS. -v is the diagnostic tool for certificate errors (expired, wrong CN, incomplete chain).`,
          },
        },
      ],
    },
    {
      id: 'web-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'web-bp-https-hsts-preload',
          title: { fr: 'HTTPS forcé + HSTS preload', en: 'Forced HTTPS + HSTS preload' },
          code: `# 1. Rediriger TOUT http:// vers https:// (301) au niveau du edge/LB
# 2. Puis activer HSTS pour éliminer la fenêtre de clair restante
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
# 3. Soumettre le domaine sur hstspreload.org une fois stable`,
          note: {
            fr: `Le couple redirection + HSTS laisse encore un premier hit en clair possible avant la 1re visite HSTS. preload inscrit le domaine directement dans les navigateurs, supprimant même ce premier risque. Quasi irréversible : testez sans includeSubDomains d'abord.`,
            en: `Redirect + HSTS alone still leaves a gap before the first HSTS-aware visit. preload bakes the domain into browsers themselves, closing even that first risk. Practically irreversible: test without includeSubDomains first.`,
          },
        },
        {
          id: 'web-bp-cors-strict-allowlist',
          title: { fr: 'CORS : allowlist stricte, jamais de wildcard + credentials', en: 'CORS: strict allowlist, never wildcard + credentials' },
          code: `# Ne JAMAIS refléter l'Origin sans le vérifier contre une liste explicite
# allowed = ["https://app.exemple.fr", "https://admin.exemple.fr"]
Access-Control-Allow-Origin: https://app.exemple.fr   # seulement si origin dans allowed
Vary: Origin`,
          note: {
            fr: `Access-Control-Allow-Origin: * combiné à Allow-Credentials est de toute façon rejeté par les navigateurs, mais réfléchir l'Origin sans vérifier une liste ouvre le CORS à n'importe quel site. Vary: Origin évite qu'un cache partagé serve la réponse d'un domaine à un autre.`,
            en: `Access-Control-Allow-Origin: * combined with Allow-Credentials is rejected by browsers anyway, but reflecting Origin without checking an allowlist opens CORS to any site. Vary: Origin stops a shared cache from serving one domain's response to another.`,
          },
        },
        {
          id: 'web-bp-security-headers-baseline',
          title: { fr: 'Socle de headers de sécurité par défaut', en: 'Default security headers baseline' },
          code: `Strict-Transport-Security: max-age=63072000
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=()
Content-Security-Policy: default-src 'self'; frame-ancestors 'self'`,
          note: {
            fr: `Ces headers coûtent zéro logique métier et ferment des classes entières d'attaques : frame-ancestors bloque le clickjacking, nosniff le MIME sniffing, Referrer-Policy limite la fuite d'URL, Permissions-Policy désactive les API inutilisées. À appliquer une fois au niveau du reverse proxy pour toutes les routes.`,
            en: `These headers cost zero business logic and close entire attack classes: frame-ancestors blocks clickjacking, nosniff blocks MIME sniffing, Referrer-Policy limits URL leakage, Permissions-Policy disables unused browser APIs. Apply them once at the reverse proxy level for every route.`,
          },
        },
        {
          id: 'web-bp-timeout-retry-budget',
          title: { fr: 'Timeouts + retries avec backoff, jamais en boucle infinie', en: 'Timeouts + retries with backoff, never an infinite loop' },
          code: `# --max-time : timeout total ; --retry : backoff exponentiel intégré (1s, 2s, 4s...)
curl --max-time 3 --retry 3 --retry-all-errors https://api.exemple.fr/ping`,
          note: {
            fr: `Sans timeout, un appel bloqué peut geler toute une requête entrante ; --retry de curl retente automatiquement avec un délai croissant sur les erreurs réseau et les 5xx. Ne retryez que 5xx/429/timeouts, jamais un 4xx tel quel — gardez un budget total (--retry-max-time) pour ne pas bloquer indéfiniment.`,
            en: `Without a timeout, a stuck call can freeze an entire incoming request; curl's --retry automatically retries with a growing delay on network errors and 5xx. Only retry 5xx/429/timeouts, never a 4xx as-is — keep a total budget (--retry-max-time) to avoid blocking forever.`,
          },
        },
        {
          id: 'web-bp-no-secrets-in-url-or-referer',
          title: { fr: 'Jamais de secret dans une URL (token, clé, session)', en: 'Never a secret in a URL (token, key, session)' },
          code: `# Mauvais : le token finit dans les logs serveur, l'historique, le Referer
GET /api/data?api_key=sk_live_abc123
# Bon : le secret voyage dans un header, jamais loggé par défaut
Authorization: Bearer sk_live_abc123`,
          note: {
            fr: `Une URL avec un secret est copiée dans les logs d'accès, l'historique navigateur, les proxys intermédiaires, et surtout le header Referer envoyé à un lien externe cliqué depuis cette page. Un header dédié n'a aucune de ces fuites par défaut.`,
            en: `A URL carrying a secret gets copied into access logs, browser history, intermediate proxies, and critically into the Referer header sent to any external link clicked from that page. A dedicated header has none of these leaks by default.`,
          },
        },
      ],
    },
  ],
};
