/**
 * Cheatsheet SQL — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'sql',
  lang: 'sql',
  sections: [
    {
      id: 'select',
      title: { fr: 'Lire des données', en: 'Reading data' },
      items: [
        {
          id: 'sql-select-where-order',
          title: { fr: 'SELECT, WHERE, ORDER BY', en: 'SELECT, WHERE, ORDER BY' },
          code: `SELECT nom, email
FROM users
WHERE actif = true        -- filtre AVANT le tri
ORDER BY created_at DESC; -- DESC : plus récent d'abord`,
          note: {
            fr: `L'ordre logique d'exécution est FROM → WHERE → SELECT → ORDER BY : on ne peut donc pas filtrer sur un alias du SELECT dans le WHERE. Sans ORDER BY, l'ordre des lignes n'est jamais garanti.`,
            en: `Logical execution order is FROM → WHERE → SELECT → ORDER BY: you cannot filter on a SELECT alias inside WHERE. Without ORDER BY, row order is never guaranteed.`,
          },
        },
        {
          id: 'sql-limit-offset',
          title: { fr: 'LIMIT / OFFSET (pagination)', en: 'LIMIT / OFFSET (pagination)' },
          code: `SELECT id, titre
FROM articles
ORDER BY id            -- obligatoire pour une pagination stable
LIMIT 20 OFFSET 40;    -- page 3 : on saute 2 × 20 lignes`,
          note: {
            fr: `OFFSET lit puis jette toutes les lignes sautées : lent sur les grandes pages. Pour de gros volumes, préférer la pagination par curseur (WHERE id > dernier_id LIMIT 20).`,
            en: `OFFSET reads then discards every skipped row: slow on deep pages. For large datasets, prefer keyset pagination (WHERE id > last_id LIMIT 20).`,
          },
        },
        {
          id: 'sql-distinct',
          title: { fr: 'DISTINCT : dédupliquer', en: 'DISTINCT: deduplicate' },
          code: `SELECT DISTINCT pays FROM users;        -- valeurs uniques
-- DISTINCT porte sur TOUTES les colonnes listées :
SELECT DISTINCT pays, ville FROM users; -- couples uniques`,
          note: {
            fr: `DISTINCT s'applique à la ligne entière, pas à une seule colonne. Un DISTINCT qui « répare » des doublons cache souvent une jointure qui multiplie les lignes : corriger la jointure d'abord.`,
            en: `DISTINCT applies to the whole row, not a single column. A DISTINCT that "fixes" duplicates often hides a join that multiplies rows: fix the join first.`,
          },
        },
        {
          id: 'sql-like-ilike',
          title: { fr: 'LIKE / ILIKE : motifs', en: 'LIKE / ILIKE: patterns' },
          code: `SELECT * FROM users WHERE email LIKE '%@gmail.com'; -- % = 0+ caractères
SELECT * FROM users WHERE nom LIKE 'Mar_';   -- _ = 1 caractère exact
SELECT * FROM users WHERE nom ILIKE 'marie%'; -- insensible à la casse (PostgreSQL)`,
          note: {
            fr: `ILIKE est spécifique à PostgreSQL ; en SQL standard on écrit LOWER(nom) LIKE 'marie%'. Un motif qui commence par % empêche l'usage d'un index B-tree.`,
            en: `ILIKE is PostgreSQL-specific; standard SQL uses LOWER(nom) LIKE 'marie%'. A pattern starting with % prevents a B-tree index from being used.`,
          },
        },
        {
          id: 'sql-in-between',
          title: { fr: 'IN / BETWEEN', en: 'IN / BETWEEN' },
          code: `SELECT * FROM commandes
WHERE statut IN ('payee', 'expediee')        -- liste de valeurs
  AND montant BETWEEN 10 AND 100;            -- bornes INCLUSES
-- dates : préférer >= et < pour éviter les surprises
-- WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'`,
          note: {
            fr: `BETWEEN inclut les deux bornes : sur un timestamp, BETWEEN '...-01-31' rate toute la journée du 31 après minuit. Pour les plages de dates, la forme >= début AND < fin est plus sûre.`,
            en: `BETWEEN includes both bounds: on a timestamp, BETWEEN '...-01-31' misses the entire 31st after midnight. For date ranges, the >= start AND < end form is safer.`,
          },
        },
        {
          id: 'sql-case-when',
          title: { fr: 'CASE WHEN : logique conditionnelle', en: 'CASE WHEN: conditional logic' },
          code: `SELECT nom,
  CASE
    WHEN score >= 90 THEN 'A'
    WHEN score >= 70 THEN 'B'
    ELSE 'C'                -- sans ELSE : NULL par défaut
  END AS niveau
FROM eleves;`,
          note: {
            fr: `Les branches sont évaluées dans l'ordre : la première condition vraie gagne. Sans ELSE, les lignes non couvertes reçoivent NULL silencieusement.`,
            en: `Branches are evaluated in order: the first true condition wins. Without ELSE, uncovered rows silently get NULL.`,
          },
        },
        {
          id: 'sql-coalesce-nullif',
          title: { fr: 'COALESCE / NULLIF', en: 'COALESCE / NULLIF' },
          code: `SELECT COALESCE(surnom, prenom, 'Anonyme') FROM users; -- 1ère valeur non NULL
-- NULLIF évite la division par zéro :
SELECT total / NULLIF(quantite, 0) FROM ventes; -- NULL si quantite = 0`,
          note: {
            fr: `NULL se propage : 1 + NULL = NULL, et NULL = NULL n'est jamais vrai (utiliser IS NULL). COALESCE donne une valeur de repli ; NULLIF transforme une valeur piège en NULL.`,
            en: `NULL propagates: 1 + NULL = NULL, and NULL = NULL is never true (use IS NULL). COALESCE provides a fallback; NULLIF turns a trap value into NULL.`,
          },
        },
      ],
    },
    {
      id: 'joins',
      title: { fr: 'Jointures', en: 'Joins' },
      items: [
        {
          id: 'sql-inner-join',
          title: { fr: 'INNER JOIN : intersection', en: 'INNER JOIN: intersection' },
          code: `SELECT u.nom, c.montant
FROM users u
INNER JOIN commandes c ON c.user_id = u.id;
-- seuls les users AYANT au moins une commande apparaissent`,
          note: {
            fr: `INNER JOIN ne garde que les lignes qui matchent des deux côtés. Si un user a 3 commandes, il apparaît 3 fois : une jointure multiplie les lignes, elle ne les fusionne pas.`,
            en: `INNER JOIN keeps only rows matching on both sides. If a user has 3 orders, they appear 3 times: a join multiplies rows, it does not merge them.`,
          },
        },
        {
          id: 'sql-left-join-where-trap',
          title: { fr: 'LEFT JOIN et le piège du WHERE', en: 'LEFT JOIN and the WHERE trap' },
          code: `-- ❌ ce WHERE retransforme le LEFT en INNER :
SELECT u.nom FROM users u
LEFT JOIN commandes c ON c.user_id = u.id
WHERE c.statut = 'payee'; -- élimine les NULL → users sans commande perdus
-- ✅ la condition va dans le ON :
SELECT u.nom FROM users u
LEFT JOIN commandes c ON c.user_id = u.id AND c.statut = 'payee';`,
          note: {
            fr: `Avec LEFT JOIN, les colonnes de droite valent NULL quand rien ne matche ; un WHERE sur ces colonnes rejette donc ces lignes. Filtrer la table de droite dans le ON, pas dans le WHERE.`,
            en: `With LEFT JOIN, right-side columns are NULL when nothing matches; a WHERE on those columns therefore rejects those rows. Filter the right table in the ON clause, not in WHERE.`,
          },
        },
        {
          id: 'sql-self-join',
          title: { fr: 'Self-join : la table avec elle-même', en: 'Self-join: a table with itself' },
          code: `-- chaque employé avec son manager (même table)
SELECT e.nom AS employe, m.nom AS manager
FROM employes e
LEFT JOIN employes m ON m.id = e.manager_id;
-- LEFT : le PDG (manager_id NULL) reste visible`,
          note: {
            fr: `Les alias (e, m) sont obligatoires pour distinguer les deux « copies » de la table. Classique pour les hiérarchies, les doublons ou les comparaisons ligne à ligne.`,
            en: `Aliases (e, m) are mandatory to tell the two "copies" of the table apart. Classic for hierarchies, duplicates, or row-to-row comparisons.`,
          },
        },
        {
          id: 'sql-anti-join',
          title: { fr: 'Anti-join : « ceux qui n\'ont pas »', en: 'Anti-join: "those without"' },
          code: `-- users SANS commande, version LEFT JOIN :
SELECT u.* FROM users u
LEFT JOIN commandes c ON c.user_id = u.id
WHERE c.id IS NULL;
-- version NOT EXISTS (souvent plus lisible) :
SELECT u.* FROM users u
WHERE NOT EXISTS (SELECT 1 FROM commandes c WHERE c.user_id = u.id);`,
          note: {
            fr: `Les deux formes sont équivalentes et bien optimisées. Éviter NOT IN (SELECT ...) : si la sous-requête contient un seul NULL, elle ne renvoie AUCUNE ligne.`,
            en: `Both forms are equivalent and well optimized. Avoid NOT IN (SELECT ...): if the subquery contains a single NULL, it returns NO rows at all.`,
          },
        },
        {
          id: 'sql-cross-join',
          title: { fr: 'CROSS JOIN : produit cartésien', en: 'CROSS JOIN: cartesian product' },
          code: `-- toutes les combinaisons taille × couleur
SELECT t.nom, c.nom
FROM tailles t
CROSS JOIN couleurs c;  -- 3 tailles × 4 couleurs = 12 lignes`,
          note: {
            fr: `Pas de condition ON : chaque ligne de gauche est combinée avec chaque ligne de droite. Utile pour générer des combinaisons ; dangereux par accident (un JOIN sans ON correct explose le nombre de lignes).`,
            en: `No ON condition: every left row is combined with every right row. Useful to generate combinations; dangerous by accident (a JOIN with a wrong ON explodes the row count).`,
          },
        },
      ],
    },
    {
      id: 'aggregates',
      title: { fr: 'Agrégats & groupes', en: 'Aggregates & groups' },
      items: [
        {
          id: 'sql-count-star-vs-col',
          title: { fr: 'COUNT(*) vs COUNT(colonne)', en: 'COUNT(*) vs COUNT(column)' },
          code: `SELECT COUNT(*) FROM users;            -- toutes les lignes
SELECT COUNT(telephone) FROM users;    -- ignore les NULL
SELECT COUNT(DISTINCT pays) FROM users; -- valeurs distinctes non NULL`,
          note: {
            fr: `COUNT(colonne) ne compte que les valeurs non NULL : la différence avec COUNT(*) mesure justement les NULL. Tous les agrégats (SUM, AVG, MAX...) ignorent les NULL.`,
            en: `COUNT(column) only counts non-NULL values: the difference with COUNT(*) is precisely the NULL count. All aggregates (SUM, AVG, MAX...) ignore NULLs.`,
          },
        },
        {
          id: 'sql-group-by',
          title: { fr: 'GROUP BY : une ligne par groupe', en: 'GROUP BY: one row per group' },
          code: `SELECT pays, COUNT(*) AS nb, AVG(age) AS age_moyen
FROM users
GROUP BY pays;
-- règle : toute colonne du SELECT hors agrégat DOIT être dans le GROUP BY`,
          note: {
            fr: `GROUP BY réduit chaque groupe à une seule ligne : on ne peut plus accéder aux lignes individuelles, seulement aux agrégats. Oublier une colonne dans le GROUP BY est une erreur de compilation (sauf MySQL en mode laxiste).`,
            en: `GROUP BY collapses each group into a single row: individual rows are no longer reachable, only aggregates. Omitting a column from GROUP BY is a compile error (except MySQL in lax mode).`,
          },
        },
        {
          id: 'sql-having',
          title: { fr: 'HAVING : filtrer les groupes', en: 'HAVING: filter groups' },
          code: `SELECT user_id, SUM(montant) AS total
FROM commandes
WHERE statut = 'payee'        -- filtre les LIGNES (avant groupement)
GROUP BY user_id
HAVING SUM(montant) > 1000;   -- filtre les GROUPES (après agrégat)`,
          note: {
            fr: `WHERE s'exécute avant le groupement, HAVING après : seul HAVING peut tester un agrégat. Mettre dans le WHERE tout ce qui peut l'être — c'est moins de lignes à grouper, donc plus rapide.`,
            en: `WHERE runs before grouping, HAVING after: only HAVING can test an aggregate. Push everything possible into WHERE — fewer rows to group means faster queries.`,
          },
        },
        {
          id: 'sql-filter-case',
          title: { fr: 'Agrégat conditionnel : FILTER / CASE', en: 'Conditional aggregate: FILTER / CASE' },
          code: `SELECT pays,
  COUNT(*) FILTER (WHERE actif) AS actifs,         -- PostgreSQL
  SUM(CASE WHEN actif THEN 1 ELSE 0 END) AS actifs_std -- SQL standard
FROM users
GROUP BY pays;`,
          note: {
            fr: `Permet plusieurs comptages avec des conditions différentes en UN seul passage sur la table (pivot). FILTER est du SQL:2003 mais surtout supporté par PostgreSQL ; CASE marche partout.`,
            en: `Allows several counts with different conditions in ONE pass over the table (pivoting). FILTER is SQL:2003 but mainly supported by PostgreSQL; CASE works everywhere.`,
          },
        },
        {
          id: 'sql-group-by-ordinal',
          title: { fr: 'GROUP BY 1 : position de colonne', en: 'GROUP BY 1: column position' },
          code: `SELECT date_trunc('month', created_at) AS mois, COUNT(*)
FROM commandes
GROUP BY 1     -- 1 = la 1ère colonne du SELECT (l'expression mois)
ORDER BY 1;`,
          note: {
            fr: `Pratique pour éviter de répéter une expression longue, et c'est le seul moyen propre de grouper sur un alias. Fragile : réordonner les colonnes du SELECT change le sens de la requête.`,
            en: `Handy to avoid repeating a long expression, and the only clean way to group on an alias. Fragile though: reordering SELECT columns silently changes the query's meaning.`,
          },
        },
      ],
    },
    {
      id: 'window',
      title: { fr: 'Fonctions fenêtres', en: 'Window functions' },
      items: [
        {
          id: 'sql-row-number-rank',
          title: { fr: 'ROW_NUMBER / RANK / DENSE_RANK', en: 'ROW_NUMBER / RANK / DENSE_RANK' },
          code: `SELECT nom, score,
  ROW_NUMBER() OVER (ORDER BY score DESC) AS rn,  -- 1,2,3,4 (jamais d'ex æquo)
  RANK()       OVER (ORDER BY score DESC) AS rk,  -- 1,2,2,4 (saute après ex æquo)
  DENSE_RANK() OVER (ORDER BY score DESC) AS dr   -- 1,2,2,3 (ne saute pas)
FROM joueurs;`,
          note: {
            fr: `Contrairement à GROUP BY, une fonction fenêtre garde toutes les lignes : elle ajoute une colonne calculée « par-dessus ». Le choix entre les trois dépend du traitement voulu des ex æquo.`,
            en: `Unlike GROUP BY, a window function keeps every row: it adds a computed column "on top". Choosing between the three depends on how you want ties handled.`,
          },
        },
        {
          id: 'sql-partition-by',
          title: { fr: 'PARTITION BY : fenêtre par groupe', en: 'PARTITION BY: window per group' },
          code: `SELECT nom, equipe, score,
  AVG(score) OVER (PARTITION BY equipe) AS moyenne_equipe,
  score - AVG(score) OVER (PARTITION BY equipe) AS ecart
FROM joueurs;  -- chaque ligne comparée à la moyenne de SON équipe`,
          note: {
            fr: `PARTITION BY est le GROUP BY des fenêtres, mais sans réduire les lignes : chaque ligne voit l'agrégat de son groupe. Idéal pour comparer une ligne à son groupe.`,
            en: `PARTITION BY is the GROUP BY of windows, without collapsing rows: each row sees its group's aggregate. Ideal for comparing a row against its group.`,
          },
        },
        {
          id: 'sql-lag-lead',
          title: { fr: 'LAG / LEAD : ligne précédente / suivante', en: 'LAG / LEAD: previous / next row' },
          code: `SELECT mois, ca,
  LAG(ca) OVER (ORDER BY mois) AS ca_precedent,
  ca - LAG(ca) OVER (ORDER BY mois) AS variation,
  LEAD(ca) OVER (ORDER BY mois) AS ca_suivant
FROM ventes_mensuelles;`,
          note: {
            fr: `LAG regarde en arrière, LEAD en avant, selon l'ORDER BY de la fenêtre. La première ligne n'a pas de précédent : LAG renvoie NULL (ou le 3e argument comme défaut : LAG(ca, 1, 0)).`,
            en: `LAG looks backward, LEAD forward, following the window's ORDER BY. The first row has no predecessor: LAG returns NULL (or the 3rd argument as default: LAG(ca, 1, 0)).`,
          },
        },
        {
          id: 'sql-running-total',
          title: { fr: 'Total cumulé : SUM OVER', en: 'Running total: SUM OVER' },
          code: `SELECT jour, montant,
  SUM(montant) OVER (ORDER BY jour) AS cumul,
  SUM(montant) OVER (PARTITION BY user_id ORDER BY jour) AS cumul_par_user
FROM paiements;`,
          note: {
            fr: `Un SUM OVER avec ORDER BY devient cumulatif : chaque ligne somme tout depuis le début de la fenêtre jusqu'à elle. Sans ORDER BY, c'est le total global répété sur chaque ligne.`,
            en: `A SUM OVER with ORDER BY becomes cumulative: each row sums everything from the window start up to itself. Without ORDER BY, it's the grand total repeated on every row.`,
          },
        },
        {
          id: 'sql-top-n-per-group',
          title: { fr: 'Top-N par groupe', en: 'Top-N per group' },
          code: `-- les 3 meilleures ventes de CHAQUE région
WITH classees AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY region ORDER BY montant DESC
  ) AS rn
  FROM ventes
)
SELECT * FROM classees WHERE rn <= 3;`,
          note: {
            fr: `LIMIT ne sait faire qu'un top-N global ; pour un top-N par groupe, on numérote dans chaque partition puis on filtre. Le filtre exige une CTE ou sous-requête : WHERE ne voit pas les fonctions fenêtres.`,
            en: `LIMIT only handles a global top-N; for top-N per group, number rows within each partition then filter. The filter requires a CTE or subquery: WHERE cannot see window functions.`,
          },
        },
      ],
    },
    {
      id: 'write',
      title: { fr: 'Écrire des données', en: 'Writing data' },
      items: [
        {
          id: 'sql-insert-returning',
          title: { fr: 'INSERT + RETURNING', en: 'INSERT + RETURNING' },
          code: `INSERT INTO users (nom, email)
VALUES ('Ada', 'ada@ex.com'),
       ('Linus', 'linus@ex.com')   -- insertion multiple en un ordre
RETURNING id, created_at;          -- récupère les valeurs générées (PostgreSQL)`,
          note: {
            fr: `RETURNING (PostgreSQL) évite un SELECT après l'INSERT pour récupérer l'id auto-généré — un seul aller-retour. Insérer plusieurs lignes en un ordre est bien plus rapide qu'une boucle d'INSERT.`,
            en: `RETURNING (PostgreSQL) avoids a SELECT after the INSERT to fetch the auto-generated id — one round trip. Inserting many rows in one statement is far faster than a loop of INSERTs.`,
          },
        },
        {
          id: 'sql-update-join',
          title: { fr: 'UPDATE avec jointure', en: 'UPDATE with a join' },
          code: `-- syntaxe PostgreSQL : UPDATE ... FROM
UPDATE commandes c
SET remise = 0.10
FROM users u
WHERE u.id = c.user_id
  AND u.vip = true;  -- toujours vérifier le WHERE avant d'exécuter !`,
          note: {
            fr: `UPDATE ... FROM est la forme PostgreSQL (MySQL utilise UPDATE a JOIN b SET ...). Réflexe de survie : transformer d'abord l'UPDATE en SELECT pour vérifier quelles lignes seront touchées.`,
            en: `UPDATE ... FROM is the PostgreSQL form (MySQL uses UPDATE a JOIN b SET ...). Survival reflex: first rewrite the UPDATE as a SELECT to check which rows will be hit.`,
          },
        },
        {
          id: 'sql-delete',
          title: { fr: 'DELETE (et le WHERE oublié)', en: 'DELETE (and the forgotten WHERE)' },
          code: `DELETE FROM sessions
WHERE expires_at < now()
RETURNING id;            -- liste ce qui a été supprimé (PostgreSQL)
-- DELETE FROM sessions;  ❌ sans WHERE : TOUTE la table`,
          note: {
            fr: `Un DELETE sans WHERE vide la table entière, sans confirmation. Pour vider une grosse table volontairement, TRUNCATE est quasi instantané ; pour le reste, tester le WHERE avec un SELECT d'abord.`,
            en: `A DELETE without WHERE empties the entire table, no confirmation. To intentionally empty a big table, TRUNCATE is near-instant; for everything else, test the WHERE with a SELECT first.`,
          },
        },
        {
          id: 'sql-upsert',
          title: { fr: 'UPSERT : ON CONFLICT', en: 'UPSERT: ON CONFLICT' },
          code: `INSERT INTO compteurs (page, vues)
VALUES ('/accueil', 1)
ON CONFLICT (page)                       -- nécessite un index UNIQUE sur page
DO UPDATE SET vues = compteurs.vues + 1; -- sinon : DO NOTHING`,
          note: {
            fr: `« Insère, ou mets à jour si la clé existe déjà » — atomique, sans race condition entre un SELECT et un INSERT. Syntaxe PostgreSQL/SQLite ; MySQL utilise ON DUPLICATE KEY UPDATE.`,
            en: `"Insert, or update if the key already exists" — atomic, no race condition between a SELECT and an INSERT. PostgreSQL/SQLite syntax; MySQL uses ON DUPLICATE KEY UPDATE.`,
          },
        },
        {
          id: 'sql-transactions',
          title: { fr: 'Transactions : BEGIN / COMMIT / ROLLBACK', en: 'Transactions: BEGIN / COMMIT / ROLLBACK' },
          code: `BEGIN;
UPDATE comptes SET solde = solde - 100 WHERE id = 1;
UPDATE comptes SET solde = solde + 100 WHERE id = 2;
COMMIT;    -- les deux écritures, ou aucune
-- en cas de problème avant COMMIT : ROLLBACK;`,
          note: {
            fr: `Tout ou rien : si une étape échoue, ROLLBACK annule tout — indispensable dès que deux écritures doivent rester cohérentes. Garder les transactions courtes : elles tiennent des verrous qui bloquent les autres.`,
            en: `All or nothing: if a step fails, ROLLBACK undoes everything — essential whenever two writes must stay consistent. Keep transactions short: they hold locks that block others.`,
          },
        },
        {
          id: 'sql-cte',
          title: { fr: 'CTE : WITH pour structurer', en: 'CTE: WITH to structure queries' },
          code: `WITH gros_clients AS (
  SELECT user_id, SUM(montant) AS total
  FROM commandes
  GROUP BY user_id
  HAVING SUM(montant) > 1000
)
SELECT u.nom, g.total
FROM gros_clients g
JOIN users u ON u.id = g.user_id;`,
          note: {
            fr: `Une CTE nomme un résultat intermédiaire : la requête se lit de haut en bas au lieu de sous-requêtes imbriquées. Réutilisable plusieurs fois dans la requête principale.`,
            en: `A CTE names an intermediate result: the query reads top to bottom instead of nested subqueries. It can be reused several times in the main query.`,
          },
        },
        {
          id: 'sql-recursive-cte',
          title: { fr: 'CTE récursive : hiérarchies', en: 'Recursive CTE: hierarchies' },
          code: `WITH RECURSIVE arbre AS (
  SELECT id, nom, manager_id, 1 AS niveau
  FROM employes WHERE manager_id IS NULL  -- ancrage : la racine
  UNION ALL
  SELECT e.id, e.nom, e.manager_id, a.niveau + 1
  FROM employes e
  JOIN arbre a ON e.manager_id = a.id     -- récursion : les enfants
)
SELECT * FROM arbre ORDER BY niveau;`,
          note: {
            fr: `Le seul moyen en SQL standard de parcourir un arbre de profondeur inconnue (organigramme, catégories, graphe). L'ancrage démarre, la partie récursive s'exécute jusqu'à ne plus produire de lignes — attention aux cycles, qui bouclent à l'infini.`,
            en: `The only standard-SQL way to walk a tree of unknown depth (org chart, categories, graph). The anchor starts, the recursive part runs until it yields no more rows — beware of cycles, which loop forever.`,
          },
        },
      ],
    },
    {
      id: 'perf',
      title: { fr: 'Index & performance', en: 'Indexes & performance' },
      items: [
        {
          id: 'sql-create-index',
          title: { fr: 'CREATE INDEX (+ composite)', en: 'CREATE INDEX (+ composite)' },
          code: `CREATE INDEX idx_users_email ON users (email);
-- composite : l'ORDRE des colonnes compte
CREATE INDEX idx_cmd_user_date ON commandes (user_id, created_at);
-- sert pour : WHERE user_id = ?  et  WHERE user_id = ? AND created_at > ?
-- ne sert PAS pour : WHERE created_at > ? seul (pas la colonne de tête)`,
          note: {
            fr: `Un index composite se lit de gauche à droite : il n'aide que si la requête filtre sur la première colonne. Règle : colonne d'égalité d'abord, colonne de plage ensuite. Chaque index ralentit aussi les écritures.`,
            en: `A composite index reads left to right: it only helps when the query filters on the leading column. Rule: equality column first, range column second. Every index also slows down writes.`,
          },
        },
        {
          id: 'sql-explain-analyze',
          title: { fr: 'EXPLAIN ANALYZE : lire le plan', en: 'EXPLAIN ANALYZE: read the plan' },
          code: `EXPLAIN ANALYZE
SELECT * FROM commandes WHERE user_id = 42;
-- Index Scan using idx_cmd_user ... ✅ l'index est utilisé
-- Seq Scan on commandes ...        ⚠️ lecture complète de la table`,
          note: {
            fr: `EXPLAIN montre le plan estimé ; ANALYZE exécute réellement la requête et mesure les temps (attention sur un UPDATE/DELETE : il écrit vraiment). Un Seq Scan sur une grande table filtrée est le premier signal d'index manquant.`,
            en: `EXPLAIN shows the estimated plan; ANALYZE actually runs the query and measures timings (careful on UPDATE/DELETE: it really writes). A Seq Scan on a large filtered table is the first sign of a missing index.`,
          },
        },
        {
          id: 'sql-index-not-used',
          title: { fr: 'Quand l\'index ne sert PAS', en: 'When the index is NOT used' },
          code: `-- ❌ fonction sur la colonne : l'index sur email est ignoré
SELECT * FROM users WHERE LOWER(email) = 'ada@ex.com';
-- ✅ index fonctionnel : CREATE INDEX ON users (LOWER(email));
-- ❌ wildcard en tête : impossible de parcourir le B-tree
SELECT * FROM users WHERE email LIKE '%@gmail.com';`,
          note: {
            fr: `Un B-tree stocke les valeurs telles quelles : appliquer une fonction à la colonne ou chercher « finit par » casse l'ordre de tri exploitable. Solutions : index fonctionnel, ou colonne dédiée (domaine extrait, recherche full-text).`,
            en: `A B-tree stores values as-is: applying a function to the column or searching "ends with" breaks the usable sort order. Fixes: a functional index, or a dedicated column (extracted domain, full-text search).`,
          },
        },
        {
          id: 'sql-n-plus-one',
          title: { fr: 'Le problème N+1', en: 'The N+1 problem' },
          code: `-- ❌ 1 requête pour les users + N requêtes pour leurs commandes :
-- SELECT * FROM users;          puis pour CHAQUE user :
-- SELECT * FROM commandes WHERE user_id = ?;
-- ✅ une seule requête avec jointure :
SELECT u.nom, c.montant
FROM users u
LEFT JOIN commandes c ON c.user_id = u.id;`,
          note: {
            fr: `Typique des ORM avec lazy loading : 100 users = 101 requêtes, et chaque aller-retour réseau coûte cher. Remède : une jointure, ou le chargement anticipé de l'ORM (includes, prefetch_related, eager load).`,
            en: `Typical of ORMs with lazy loading: 100 users = 101 queries, and each network round trip is costly. Cure: a join, or the ORM's eager loading (includes, prefetch_related, eager load).`,
          },
        },
        {
          id: 'sql-vacuum-analyze',
          title: { fr: 'VACUUM / ANALYZE en bref', en: 'VACUUM / ANALYZE in brief' },
          code: `ANALYZE commandes;        -- rafraîchit les statistiques du planificateur
VACUUM commandes;         -- récupère l'espace des lignes mortes (PostgreSQL)
-- l'autovacuum le fait normalement tout seul ;
-- utile manuellement après un gros DELETE ou import massif`,
          note: {
            fr: `Spécifique à PostgreSQL : UPDATE/DELETE laissent des lignes « mortes » que VACUUM nettoie, et le planificateur choisit ses plans d'après les statistiques d'ANALYZE. Des stats périmées après un gros import expliquent souvent un plan soudainement lent.`,
            en: `PostgreSQL-specific: UPDATE/DELETE leave "dead" rows that VACUUM cleans up, and the planner picks plans based on ANALYZE statistics. Stale stats after a big import often explain a suddenly slow plan.`,
          },
        },
      ],
    },
  ],
};
