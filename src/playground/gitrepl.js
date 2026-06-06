/**
 * Git REPL for the playground: parses a script of git commands into the ops
 * vocabulary of the gitdag model (src/gitdag.js), validates them against the
 * evolving branch set, and renders the resulting DAG as an SVG string (same
 * gd-* classes as the Git DAG panel).
 *
 * Supported:
 *   git commit [-m "msg"]            → { commit }
 *   git branch <name>                → { branch }
 *   git switch <name> | checkout     → { checkout }
 *   git switch -c <n> | checkout -b  → { branch } + { checkout }
 *   git merge <name>                 → { merge }
 *   git rebase <name>                → { rebase }
 * Comments (#…) and blank lines are skipped. Anything else is an error.
 */
import { simulate } from '../gitdag.js';

export function parseGitCommands(text) {
  const ops = [];
  const errors = [];
  const branches = new Set(['main']);
  let head = 'main';

  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/#.*$/, '').trim();
    if (!line) continue;
    const bad = (why) => errors.push({ line: i + 1, text: lines[i].trim(), why });

    const m = line.match(/^git\s+(\S+)\s*(.*)$/);
    if (!m) { bad('not-git'); continue; }
    const [, cmd, restRaw] = m;
    const rest = restRaw.trim();

    if (cmd === 'commit') {
      const msg = rest.match(/-m\s+(?:"([^"]*)"|'([^']*)'|(\S+))/);
      ops.push({ commit: msg ? (msg[1] ?? msg[2] ?? msg[3]) : 'commit' });
    } else if (cmd === 'branch' && /^[\w./-]+$/.test(rest)) {
      if (branches.has(rest)) { bad('exists'); continue; }
      branches.add(rest);
      ops.push({ branch: rest });
    } else if ((cmd === 'switch' || cmd === 'checkout') && rest) {
      const create = rest.match(/^(?:-c|-b)\s+([\w./-]+)$/);
      if (create) {
        if (branches.has(create[1])) { bad('exists'); continue; }
        branches.add(create[1]);
        ops.push({ branch: create[1] }, { checkout: create[1] });
        head = create[1];
      } else if (branches.has(rest)) {
        ops.push({ checkout: rest });
        head = rest;
      } else bad('no-branch');
    } else if (cmd === 'merge' && rest) {
      if (!branches.has(rest)) { bad('no-branch'); continue; }
      if (rest === head) { bad('self'); continue; }
      ops.push({ merge: rest });
    } else if (cmd === 'rebase' && rest) {
      if (!branches.has(rest)) { bad('no-branch'); continue; }
      if (rest === head) { bad('self'); continue; }
      ops.push({ rebase: rest });
    } else {
      bad('unknown');
    }
  }
  return { ops, errors };
}

/** Run the ops and collect drawable state: ordered commits + tips + log. */
export function runGitOps(ops) {
  const commits = [];
  const branches = { main: null };
  let head = 'main';
  const events = [];

  const gen = simulate(ops);
  let r = gen.next();
  while (!r.done) {
    const s = r.value;
    if (s.type === 'commit') {
      commits.push({ id: s.id, parents: s.parents, lane: s.lane, i: commits.length, orphan: false });
      branches[s.branch] = s.id;
      events.push(s.replayOf ? `${s.id} (rejoue ${s.replayOf})` : `commit ${s.id} → ${s.branch}`);
    } else if (s.type === 'branch') {
      branches[s.name] = s.at;
      events.push(`branch ${s.name} @ ${s.at ?? '∅'}`);
    } else if (s.type === 'checkout') {
      head = s.name;
      events.push(`HEAD → ${s.name}`);
    } else if (s.type === 'merge' && s.kind === 'ff') {
      branches[s.into] = s.to;
      events.push(`merge: fast-forward de ${s.into} sur ${s.to} (aucun commit)`);
    } else if (s.type === 'merge') {
      commits.push({ id: s.id, parents: s.parents, lane: s.lane, i: commits.length, orphan: false });
      branches[s.into] = s.id;
      events.push(`merge: commit ${s.id} (2 parents : ${s.parents.join(', ')})`);
    } else if (s.type === 'rebase') {
      events.push(`rebase ${s.branch} sur ${s.onto}…`);
    } else if (s.type === 'orphan') {
      for (const c of commits) if (s.ids.includes(c.id)) c.orphan = true;
      if (s.ids.length) events.push(`orphelins : ${s.ids.join(', ')} (ids REJOUÉS → nouveaux)`);
    }
    r = gen.next();
  }
  return { commits, branches, head, events };
}

const LANE_COLORS = ['#1d4ed8', '#15803d', '#b45309', '#7e22ce'];
const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));

/** SVG string for the DAG (same visual language as the Git DAG tab). */
export function renderDagSvg({ commits, branches, head }) {
  const X = (i) => 50 + i * 86;
  const Y = (lane) => 46 + lane * 64;
  const byId = Object.fromEntries(commits.map((c) => [c.id, c]));
  const w = Math.max(320, 100 + commits.length * 86);
  const maxLane = Math.max(0, ...commits.map((c) => c.lane));
  const h = 96 + maxLane * 64;
  let svg = '';
  for (const c of commits) {
    for (const p of c.parents) {
      const pc = byId[p];
      if (pc) svg += `<path class="edge" d="M ${X(c.i)} ${Y(c.lane)} L ${X(pc.i)} ${Y(pc.lane)}" />`;
    }
  }
  for (const c of commits) {
    svg += `<circle class="node${c.orphan ? ' orphan' : ''}" cx="${X(c.i)}" cy="${Y(c.lane)}" r="15" fill="${LANE_COLORS[c.lane % 4]}" />`;
    svg += `<text class="cid${c.orphan ? ' orphan' : ''}" x="${X(c.i)}" y="${Y(c.lane) + 4}">${esc(c.id)}</text>`;
  }
  for (const [name, tip] of Object.entries(branches)) {
    const c = byId[tip];
    if (!c) continue;
    const isHead = name === head;
    const offset = name === 'main' ? -26 : 30;
    svg += `<text class="btag${isHead ? ' head' : ''}" x="${X(c.i)}" y="${Y(c.lane) + offset}">${isHead ? '★ ' : ''}${esc(name)}</text>`;
  }
  return `<svg class="gd-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
}
