/**
 * A step-generator model that animates SQL JOINs as a NESTED-LOOP join, the
 * most pedagogical join algorithm: take each row of the LEFT table in turn,
 * compare it against every row of the RIGHT table (`users.id = orders.user_id`),
 * and decide what happens to the rows that never find a partner. That last
 * decision is the ONLY difference between the four join types:
 *
 *   INNER  — the intersection: a row appears in the result only when both
 *            sides match. Unmatched rows on EITHER side are dropped.
 *   LEFT   — all left rows survive: an unmatched left row is emitted padded
 *            with NULL on the right side (`produit: null`). Unmatched right
 *            rows are still dropped.
 *   RIGHT  — the mirror image: all right rows survive, unmatched ones are
 *            emitted padded with NULL on the left side (`nom: null`), and
 *            unmatched left rows are dropped.
 *   FULL   — the union: nothing is dropped; unmatched rows on both sides are
 *            emitted with NULL padding.
 *
 * The fixture data is built to expose every case: Grace (user 3) has no
 * orders (unmatched left row) and order 13 references user 9, who does not
 * exist (unmatched / orphan right row).
 *
 * Step shapes yielded by `simulate(type)`:
 *   { type:'scan-left', index }                      left row `index` becomes current
 *   { type:'compare', leftIndex, rightIndex, matched } the pair being compared
 *   { type:'emit', row:{ nom, produit }, reason }    result row produced;
 *       reason: 'match' | 'left-pad' (produit:null) | 'right-pad' (nom:null)
 *   { type:'drop', side:'left'|'right', index }      unmatched row excluded
 *
 * Deterministic order: left rows are scanned in USERS array order, right rows
 * are compared in ORDERS array order, and right-side pads/drops are resolved
 * after the main scan, in ORDERS order.
 *
 * The generator RETURNS:
 *   { rows, counts: { match, leftPad, rightPad, dropped } }
 * where `rows` lists every emitted row in emission order.
 */

export const USERS = [
  { id: 1, nom: 'Ada' },
  { id: 2, nom: 'Alan' },
  { id: 3, nom: 'Grace' },
];

export const ORDERS = [
  { id: 10, user_id: 1, produit: 'clavier' },
  { id: 11, user_id: 1, produit: 'écran' },
  { id: 12, user_id: 2, produit: 'souris' },
  { id: 13, user_id: 9, produit: 'webcam' }, // orphelin : user 9 n'existe pas
];

export const JOIN_TYPES = ['inner', 'left', 'right', 'full'];

/**
 * Nested-loop join of USERS and ORDERS on `users.id = orders.user_id`.
 * @param {'inner'|'left'|'right'|'full'} type
 */
export function* simulate(type) {
  const rows = [];
  const counts = { match: 0, leftPad: 0, rightPad: 0, dropped: 0 };
  const matchedRight = new Array(ORDERS.length).fill(false);

  // Main scan: each left row against every right row.
  for (let i = 0; i < USERS.length; i++) {
    const user = USERS[i];
    yield { type: 'scan-left', index: i };

    let leftMatched = false;
    for (let j = 0; j < ORDERS.length; j++) {
      const order = ORDERS[j];
      const matched = user.id === order.user_id;
      yield { type: 'compare', leftIndex: i, rightIndex: j, matched };
      if (matched) {
        leftMatched = true;
        matchedRight[j] = true;
        const row = { nom: user.nom, produit: order.produit };
        rows.push(row);
        counts.match++;
        yield { type: 'emit', row, reason: 'match' };
      }
    }

    if (!leftMatched) {
      if (type === 'left' || type === 'full') {
        const row = { nom: user.nom, produit: null };
        rows.push(row);
        counts.leftPad++;
        yield { type: 'emit', row, reason: 'left-pad' };
      } else {
        counts.dropped++;
        yield { type: 'drop', side: 'left', index: i };
      }
    }
  }

  // After the scan: resolve right rows that never matched, in ORDERS order.
  for (let j = 0; j < ORDERS.length; j++) {
    if (matchedRight[j]) continue;
    if (type === 'right' || type === 'full') {
      const row = { nom: null, produit: ORDERS[j].produit };
      rows.push(row);
      counts.rightPad++;
      yield { type: 'emit', row, reason: 'right-pad' };
    } else {
      counts.dropped++;
      yield { type: 'drop', side: 'right', index: j };
    }
  }

  return { rows, counts };
}

/**
 * Runs `simulate(type)` to completion and returns its return value:
 * `{ rows, counts }`.
 * @param {'inner'|'left'|'right'|'full'} type
 */
export function summaryOf(type) {
  const gen = simulate(type);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}
