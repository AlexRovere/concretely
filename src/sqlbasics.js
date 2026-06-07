/**
 * SQL basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - three-valued logic: NULL = NULL is NULL (not TRUE), use IS NULL,
 *    and NOT IN with a NULL in the list matches NOTHING — ever;
 *  - logical execution order FROM → WHERE → GROUP BY → HAVING → SELECT
 *    → ORDER BY → LIMIT (why a SELECT alias is invisible to WHERE);
 *  - WHERE filters ROWS before grouping (aggregates forbidden),
 *    HAVING filters GROUPS after — combine both for cheap queries;
 *  - the LEFT JOIN trap: a WHERE condition on the right table's columns
 *    silently turns the LEFT JOIN back into an INNER JOIN — put it in ON.
 *
 * Standard SQL behavior (per the SQL standard, matches PostgreSQL/MySQL/
 * SQLite semantics for everything shown here).
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const SQLBASICS_SCENARIOS = [
  {
    id: 'null-logic',
    code: `NULL = NULL                  -- NULL ?! ni TRUE ni FALSE (logique à 3 valeurs)
prix IS NULL                 -- TRUE — LA bonne façon de tester NULL
SELECT * FROM produits
WHERE remise = NULL          -- ZÉRO ligne, toujours 😱
1 NOT IN (2, NULL)           -- NULL → la requête ne renvoie RIEN
-- → IS NULL / IS NOT NULL, et NOT EXISTS plutôt que NOT IN`,
    ops: [
      { eval: 'NULL = NULL', value: 'NULL', note: 'ni TRUE ni FALSE — logique à 3 valeurs ; utiliser IS NULL' },
      { eval: 'prix IS NULL', value: 'TRUE', note: 'IS NULL est le seul test fiable de NULL' },
      { branch: 'WHERE remise = NULL', taken: false, else: 'ZÉRO ligne — NULL n\'est jamais égal, même à NULL' },
      { eval: '1 NOT IN (2, NULL)', value: 'NULL', note: 'LE piège : NOT IN + NULL → aucune ligne, toujours ; préférer NOT EXISTS' },
    ],
  },
  {
    id: 'exec-order',
    code: `SELECT client, SUM(montant) AS total   -- écrit en 1er, exécuté en 5e !
FROM ventes                            -- 1. FROM
WHERE total > 100                      -- 2. WHERE — ❌ total n'existe pas encore
GROUP BY client                        -- 3. GROUP BY
HAVING SUM(montant) > 100              -- 4. HAVING
ORDER BY total                         -- 6. ORDER BY — ✓ l'alias existe ici
LIMIT 10                               -- 7. LIMIT`,
    ops: [
      { log: 'ordre LOGIQUE d\'exécution (≠ ordre d\'écriture) :' },
      { log: '1. FROM ventes — la table source d\'abord' },
      { log: '2. WHERE — filtre les lignes brutes' },
      { log: '3. GROUP BY client — regroupe' },
      { log: '4. HAVING — filtre les groupes' },
      { log: '5. SELECT — calcule SUM(montant) AS total (seulement maintenant !)' },
      { log: '6. ORDER BY puis 7. LIMIT — sur le résultat final' },
      { error: 'WHERE total > 100', message: 'WHERE s\'exécute AVANT le SELECT — l\'alias total n\'existe pas encore' },
      { eval: 'ORDER BY total', value: 'OK', note: 'ORDER BY, lui, passe APRÈS le SELECT — l\'alias existe' },
    ],
  },
  {
    id: 'where-having',
    code: `SELECT client, COUNT(*) FROM commandes
WHERE COUNT(*) > 1           -- ❌ agrégat interdit dans WHERE
GROUP BY client
HAVING COUNT(*) > 1          -- ✓ HAVING filtre les groupes

-- combiner les deux : filtrer les lignes AVANT de grouper
WHERE annee = 2026 ... HAVING COUNT(*) > 1`,
    ops: [
      { error: 'WHERE COUNT(*) > 1', message: 'un agrégat est interdit dans WHERE — il filtre des LIGNES, avant tout groupement' },
      { eval: 'HAVING COUNT(*) > 1', value: 'OK', note: 'HAVING filtre les GROUPES, après GROUP BY' },
      { eval: 'WHERE annee = 2026 … HAVING COUNT(*) > 1', value: 'OK', note: 'filtrer les lignes d\'abord coûte moins cher — moins de lignes à grouper' },
    ],
  },
  {
    id: 'left-join-trap',
    code: `SELECT u.nom, o.montant
FROM users u
LEFT JOIN orders o ON o.user_id = u.id   -- on veut AUSSI les sans-commande
WHERE o.montant > 0                      -- 💥 les NULL sont filtrés !

-- le fix : la condition va dans le ON
LEFT JOIN orders o ON o.user_id = u.id AND o.montant > 0   -- ✓`,
    ops: [
      { log: 'LEFT JOIN : les users sans commande sortent avec o.* rempli de NULL' },
      { crash: 'WHERE o.montant > 0', message: 'les lignes sans commande ont o.montant NULL → filtrées → ton LEFT JOIN est redevenu un INNER JOIN en silence' },
      { eval: 'AND o.montant > 0', value: 'OK', note: 'la condition dans le ON s\'applique AVANT le rembourrage NULL — les sans-commande restent' },
    ],
  },
];

export const sqlBasicsScenarioById = (id) => SQLBASICS_SCENARIOS.find((s) => s.id === id);
