/**
 * A tiny simulated shell over an in-memory filesystem — the Linux playground
 * engine. Same philosophy as the git REPL (gitrepl.js): a PURE model, fully
 * testable in Node, re-run from scratch on every ▶ so the result is always
 * deterministic. No network, no real FS, `rm -rf /` is a lesson, not a drama.
 *
 * Supported: pwd, ls(-a), cd, mkdir(-p), touch, rm(-r/-f), cp(-r), mv, cat,
 * echo, grep(-i), wc(-l), sort, uniq(-c), head/tail(-n) — plus pipes `|`,
 * redirections `>` / `>>`, quotes and `*` globbing (bash-style: dotfiles
 * excluded, unmatched glob stays literal).
 *
 * runShell(script) → { logs: [{kind:'log'|'warn'|'crash', text}], root, cwd }
 * renderFsTree(result) → HTML string for the live FS view (gd-wrap style).
 */

const dir = () => ({ type: 'dir', children: {} });
const file = (content = '') => ({ type: 'file', content });

/* ------------------------------------------------------------ FS helpers */

function freshState() {
  const root = dir();
  root.children.home = dir();
  root.children.home.children.dev = dir();
  return { root, cwd: ['home', 'dev'] };
}

/** Resolve a path string to an absolute segment array (handles ., .., /). */
function resolve(state, str) {
  const base = str.startsWith('/') ? [] : [...state.cwd];
  for (const part of str.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') base.pop();
    else base.push(part);
  }
  return base;
}

function nodeAt(root, segs) {
  let cur = root;
  for (const s of segs) {
    if (cur.type !== 'dir' || !(s in cur.children)) return null;
    cur = cur.children[s];
  }
  return cur;
}

const pathStr = (segs) => '/' + segs.join('/');

/* ------------------------------------------------------- line tokenizing */

/** Strip an unquoted trailing # comment. */
function stripComment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '#') return line.slice(0, i);
  }
  return line;
}

/** Tokenize, keeping a `quoted` flag (a quoted * is never globbed). */
function tokenize(line) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    while (line[i] === ' ' || line[i] === '\t') i++;
    if (i >= line.length) break;
    let text = '';
    let quoted = false;
    while (i < line.length && line[i] !== ' ' && line[i] !== '\t') {
      const c = line[i];
      if (c === '"' || c === "'") {
        quoted = true;
        const close = line.indexOf(c, i + 1);
        if (close === -1) throw new Error(`quote ${c} jamais refermée`);
        text += line.slice(i + 1, close);
        i = close + 1;
      } else {
        text += c;
        i++;
      }
    }
    tokens.push({ t: text, q: quoted });
  }
  return tokens;
}

/** Expand an unquoted token containing `*` against the FS (bash rules). */
function glob(state, token) {
  if (token.q || !token.t.includes('*')) return [token.t];
  const slash = token.t.lastIndexOf('/');
  const prefix = slash === -1 ? '' : token.t.slice(0, slash + 1);
  const pattern = slash === -1 ? token.t : token.t.slice(slash + 1);
  const dirNode = nodeAt(state.root, resolve(state, prefix === '' ? '.' : prefix));
  if (!dirNode || dirNode.type !== 'dir') return [token.t];
  const re = new RegExp(
    '^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$'
  );
  const hits = Object.keys(dirNode.children)
    .filter((n) => !n.startsWith('.') && re.test(n))
    .sort()
    .map((n) => prefix + n);
  return hits.length > 0 ? hits : [token.t]; // unmatched glob stays literal
}

/* ------------------------------------------------------------- commands */

function listDir(node, all) {
  return Object.keys(node.children)
    .filter((n) => all || !n.startsWith('.'))
    .sort()
    .map((n) => (node.children[n].type === 'dir' ? n + '/' : n));
}

function readFile(state, path) {
  const node = nodeAt(state.root, resolve(state, path));
  if (!node) throw new Error(`${path} : Aucun fichier ou dossier de ce type`);
  if (node.type === 'dir') throw new Error(`${path} : c'est un dossier`);
  return node.content;
}

function splitFlags(argv, known) {
  const flags = new Set();
  const args = [];
  for (const a of argv) {
    if (a.startsWith('-') && a.length > 1 && [...a.slice(1)].every((c) => known.includes(c))) {
      for (const c of a.slice(1)) flags.add(c);
    } else {
      args.push(a);
    }
  }
  return { flags, args };
}

const deepClone = (node) =>
  node.type === 'file'
    ? file(node.content)
    : { type: 'dir', children: Object.fromEntries(Object.entries(node.children).map(([k, v]) => [k, deepClone(v)])) };

const COMMANDS = {
  pwd: (state) => [pathStr(state.cwd)],

  ls: (state, argv) => {
    const { flags, args } = splitFlags(argv, ['a', 'l']);
    const targets = args.length > 0 ? args : ['.'];
    const out = [];
    for (const t of targets) {
      const node = nodeAt(state.root, resolve(state, t));
      if (!node) throw new Error(`ls : ${t} : Aucun fichier ou dossier de ce type`);
      if (node.type === 'file') out.push(t);
      else out.push(...listDir(node, flags.has('a')));
    }
    return out;
  },

  cd: (state, argv) => {
    const target = argv[0] ?? '/home/dev';
    const segs = resolve(state, target);
    const node = nodeAt(state.root, segs);
    if (!node) throw new Error(`cd : ${target} : Aucun fichier ou dossier de ce type`);
    if (node.type !== 'dir') throw new Error(`cd : ${target} : n'est pas un dossier`);
    state.cwd = segs;
    return [];
  },

  mkdir: (state, argv) => {
    const { flags, args } = splitFlags(argv, ['p']);
    if (args.length === 0) throw new Error('mkdir : nom de dossier manquant');
    for (const a of args) {
      const segs = resolve(state, a);
      let cur = state.root;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        const last = i === segs.length - 1;
        if (!(s in cur.children)) {
          if (!last && !flags.has('p')) {
            throw new Error(`mkdir : ${a} : le parent n'existe pas (utilise -p)`);
          }
          cur.children[s] = dir();
        } else if (last && !flags.has('p')) {
          throw new Error(`mkdir : ${a} : existe déjà`);
        }
        cur = cur.children[s];
        if (cur.type !== 'dir') throw new Error(`mkdir : ${a} : un fichier bloque le chemin`);
      }
    }
    return [];
  },

  touch: (state, argv) => {
    if (argv.length === 0) throw new Error('touch : nom de fichier manquant');
    for (const a of argv) {
      const segs = resolve(state, a);
      const parent = nodeAt(state.root, segs.slice(0, -1));
      if (!parent || parent.type !== 'dir') throw new Error(`touch : ${a} : le dossier parent n'existe pas`);
      parent.children[segs.at(-1)] ??= file();
    }
    return [];
  },

  echo: (state, argv) => [argv.join(' ')],

  cat: (state, argv, stdin) => {
    if (argv.length === 0) return stdin ?? [];
    const out = [];
    for (const a of argv) out.push(...readFile(state, a).split('\n').filter((l, i, arr) => !(l === '' && i === arr.length - 1)));
    return out;
  },

  rm: (state, argv, _stdin, logs) => {
    const { flags, args } = splitFlags(argv, ['r', 'f']);
    if (args.length === 0) throw new Error('rm : cible manquante');
    for (const a of args) {
      const segs = resolve(state, a);
      if (segs.length === 0) {
        // rm -rf / : the sandbox makes it a (fun) lesson instead of a drama.
        if (!flags.has('r')) throw new Error(`rm : / : c'est un dossier (utilise -r)`);
        state.root.children = {};
        state.cwd = [];
        logs.push({ kind: 'warn', text: '💥 rm -rf / — tout est parti. Heureusement que ce n\'était qu\'un bac à sable simulé 😅' });
        continue;
      }
      const parent = nodeAt(state.root, segs.slice(0, -1));
      const name = segs.at(-1);
      const node = parent?.type === 'dir' ? parent.children[name] : null;
      if (!node) {
        if (flags.has('f')) continue;
        throw new Error(`rm : ${a} : Aucun fichier ou dossier de ce type`);
      }
      if (node.type === 'dir' && !flags.has('r')) {
        throw new Error(`rm : ${a} : c'est un dossier (utilise -r)`);
      }
      delete parent.children[name];
    }
    return [];
  },

  cp: (state, argv) => {
    const { flags, args } = splitFlags(argv, ['r']);
    if (args.length < 2) throw new Error('cp : il faut une source et une destination');
    const [srcPath, dstPath] = args;
    const src = nodeAt(state.root, resolve(state, srcPath));
    if (!src) throw new Error(`cp : ${srcPath} : Aucun fichier ou dossier de ce type`);
    if (src.type === 'dir' && !flags.has('r')) throw new Error(`cp : ${srcPath} : c'est un dossier (utilise -r)`);
    const dstSegs = resolve(state, dstPath);
    const dstNode = nodeAt(state.root, dstSegs);
    if (dstNode?.type === 'dir') {
      dstNode.children[resolve(state, srcPath).at(-1)] = deepClone(src);
    } else {
      const parent = nodeAt(state.root, dstSegs.slice(0, -1));
      if (!parent || parent.type !== 'dir') throw new Error(`cp : ${dstPath} : le dossier parent n'existe pas`);
      parent.children[dstSegs.at(-1)] = deepClone(src);
    }
    return [];
  },

  mv: (state, argv) => {
    if (argv.length < 2) throw new Error('mv : il faut une source et une destination');
    const [srcPath, dstPath] = argv;
    const srcSegs = resolve(state, srcPath);
    const srcParent = nodeAt(state.root, srcSegs.slice(0, -1));
    const srcName = srcSegs.at(-1);
    const src = srcParent?.type === 'dir' ? srcParent.children[srcName] : null;
    if (!src) throw new Error(`mv : ${srcPath} : Aucun fichier ou dossier de ce type`);
    const dstSegs = resolve(state, dstPath);
    const dstNode = nodeAt(state.root, dstSegs);
    if (dstNode?.type === 'dir') {
      dstNode.children[srcName] = src;
    } else {
      const parent = nodeAt(state.root, dstSegs.slice(0, -1));
      if (!parent || parent.type !== 'dir') throw new Error(`mv : ${dstPath} : le dossier parent n'existe pas`);
      parent.children[dstSegs.at(-1)] = src;
    }
    delete srcParent.children[srcName];
    return [];
  },

  grep: (state, argv, stdin) => {
    const { flags, args } = splitFlags(argv, ['i', 'v']);
    if (args.length === 0) throw new Error('grep : motif manquant');
    const [pattern, ...files] = args;
    const needle = flags.has('i') ? pattern.toLowerCase() : pattern;
    const lines = files.length > 0
      ? files.flatMap((f) => readFile(state, f).split('\n'))
      : (stdin ?? []);
    return lines.filter((l) => {
      const hay = flags.has('i') ? l.toLowerCase() : l;
      const hit = hay.includes(needle);
      return flags.has('v') ? !hit : hit;
    });
  },

  wc: (state, argv, stdin) => {
    const { flags, args } = splitFlags(argv, ['l', 'w', 'c']);
    const lines = args.length > 0 ? readFile(state, args[0]).split('\n').filter((l) => l !== '') : (stdin ?? []);
    if (flags.has('l') || flags.size === 0) return [String(lines.length)];
    if (flags.has('w')) return [String(lines.join(' ').split(/\s+/).filter(Boolean).length)];
    return [String(lines.join('\n').length)];
  },

  sort: (state, argv, stdin) => {
    const lines = argv.length > 0 ? readFile(state, argv[0]).split('\n').filter((l) => l !== '') : (stdin ?? []);
    return [...lines].sort();
  },

  uniq: (state, argv, stdin) => {
    const { flags, args } = splitFlags(argv, ['c']);
    const lines = args.length > 0 ? readFile(state, args[0]).split('\n').filter((l) => l !== '') : (stdin ?? []);
    const out = [];
    let prev = null;
    let count = 0;
    const flush = () => {
      if (prev !== null) out.push(flags.has('c') ? `${String(count).padStart(4)} ${prev}` : prev);
    };
    for (const l of lines) {
      if (l === prev) count++;
      else { flush(); prev = l; count = 1; }
    }
    flush();
    return out;
  },

  head: (state, argv, stdin) => {
    const { args, n } = takeN(argv);
    const lines = args.length > 0 ? readFile(state, args[0]).split('\n') : (stdin ?? []);
    return lines.slice(0, n);
  },

  tail: (state, argv, stdin) => {
    const { args, n } = takeN(argv);
    const lines = args.length > 0 ? readFile(state, args[0]).split('\n') : (stdin ?? []);
    return lines.slice(-n);
  },
};

function takeN(argv) {
  const i = argv.indexOf('-n');
  if (i === -1) return { args: argv, n: 10 };
  const n = parseInt(argv[i + 1], 10);
  if (Number.isNaN(n)) throw new Error('-n attend un nombre');
  return { args: argv.filter((_, j) => j !== i && j !== i + 1), n };
}

/* -------------------------------------------------------------- pipeline */

/** Split tokens into pipeline segments, extracting one redirection each. */
function parsePipeline(tokens) {
  const segments = [[]];
  for (const tk of tokens) {
    if (!tk.q && tk.t === '|') segments.push([]);
    else segments.at(-1).push(tk);
  }
  return segments.map((seg) => {
    let redir = null;
    const argvTokens = [];
    for (let i = 0; i < seg.length; i++) {
      const tk = seg[i];
      if (!tk.q && (tk.t === '>' || tk.t === '>>')) {
        const target = seg[i + 1];
        if (!target) throw new Error(`${tk.t} : fichier cible manquant`);
        redir = { mode: tk.t, target: target.t };
        i++;
      } else {
        argvTokens.push(tk);
      }
    }
    if (argvTokens.length === 0) throw new Error('commande vide dans le pipeline');
    return { argvTokens, redir };
  });
}

function writeRedir(state, redir, lines) {
  const segs = resolve(state, redir.target);
  const parent = nodeAt(state.root, segs.slice(0, -1));
  if (!parent || parent.type !== 'dir') throw new Error(`${redir.target} : le dossier parent n'existe pas`);
  const name = segs.at(-1);
  const existing = parent.children[name];
  if (existing?.type === 'dir') throw new Error(`${redir.target} : c'est un dossier`);
  const text = lines.length > 0 ? lines.join('\n') + '\n' : '';
  if (redir.mode === '>>' && existing) existing.content += text;
  else parent.children[name] = file(text);
}

function runLine(state, line, logs) {
  const segments = parsePipeline(tokenize(line));
  let stdin = null;
  for (const seg of segments) {
    const [cmdTok, ...rest] = seg.argvTokens;
    const argv = rest.flatMap((tk) => glob(state, tk));
    const cmd = COMMANDS[cmdTok.t];
    if (!cmd) {
      throw new Error(`commande inconnue : ${cmdTok.t} (dispo : ${Object.keys(COMMANDS).join(', ')})`);
    }
    const out = cmd(state, argv, stdin, logs) ?? [];
    if (seg.redir) {
      writeRedir(state, seg.redir, out);
      stdin = [];
    } else {
      stdin = out;
    }
  }
  for (const l of stdin ?? []) logs.push({ kind: 'log', text: l });
}

/* --------------------------------------------------------------- public */

export function runShell(script) {
  const state = freshState();
  const logs = [];
  for (const raw of String(script).split('\n')) {
    const line = stripComment(raw).trim();
    if (line === '') continue;
    try {
      runLine(state, line, logs);
    } catch (e) {
      logs.push({ kind: 'crash', text: e.message });
    }
  }
  return { logs, root: state.root, cwd: state.cwd };
}

const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Render the final FS as an HTML tree (cwd highlighted). */
export function renderFsTree({ root, cwd }) {
  const cwdPath = pathStr(cwd);
  const rows = [];
  const walk = (node, segs) => {
    const here = pathStr(segs);
    const isCwd = here === cwdPath;
    const name = segs.length === 0 ? '/' : segs.at(-1);
    if (node.type === 'dir') {
      rows.push(
        `<div class="fs-row fs-dir${isCwd ? ' fs-cwd' : ''}" style="padding-left:${segs.length * 1.1}rem">📁 ${escHtml(name)}${isCwd ? ' <span class="fs-here">← tu es ici</span>' : ''}</div>`
      );
      const names = Object.keys(node.children).sort(
        (a, b) => (node.children[b].type === 'dir') - (node.children[a].type === 'dir') || a.localeCompare(b)
      );
      for (const n of names) walk(node.children[n], [...segs, n]);
    } else {
      const bytes = node.content.length;
      rows.push(
        `<div class="fs-row fs-file" style="padding-left:${segs.length * 1.1}rem" title="${escHtml(node.content)}">📄 ${escHtml(name)} <span class="fs-size">${bytes} o</span></div>`
      );
    }
  };
  walk(root, []);
  return `<div class="fs-tree">${rows.join('')}</div>`;
}
