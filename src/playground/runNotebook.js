/**
 * Kernel notebook sur Pyodide (CPython/WASM). Étend le pattern de runpython.js
 * mais avec un état PERSISTANT par notebook (dict de globals dédié) et des
 * sorties RICHES : texte, tables HTML (_repr_html_ des DataFrame), figures
 * matplotlib (PNG) et erreurs.
 *
 * Non testable en `node --test` (téléchargement CDN + wasm) → validé
 * manuellement dans le navigateur (dev server).
 */
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyPromise = null;
let loaded = false;

// stdout/stderr sont câblés UNE fois au chargement ; on route via un puits
// mutable pour que chaque exécution capture sa propre sortie.
const sink = { logs: null };
function loader() {
  pyPromise ??= import(/* @vite-ignore */ `${PYODIDE}pyodide.mjs`)
    .then((m) =>
      m.loadPyodide({
        indexURL: PYODIDE,
        stdout: (s) => sink.logs?.push({ type: 'stream', stream: 'stdout', text: s }),
        stderr: (s) => sink.logs?.push({ type: 'stream', stream: 'stderr', text: s }),
      }),
    )
    .then((py) => {
      loaded = true;
      return py;
    })
    .catch((e) => {
      pyPromise = null; // un échec CDN peut être réessayé
      throw e;
    });
  return pyPromise;
}

// Récupère les figures matplotlib ouvertes en PNG base64 (uniquement si
// matplotlib est chargé), puis les ferme.
const CAPTURE_FIGS = `
def __capture_figs():
    import sys
    if 'matplotlib' not in sys.modules:
        return []
    import matplotlib.pyplot as plt, io, base64
    out = []
    for num in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(num).savefig(buf, format='png', bbox_inches='tight', dpi=100)
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close('all')
    return out
__capture_figs()
`;

function reprHtml(result) {
  // DataFrame & co. exposent _repr_html_ ; sinon on retombe sur str().
  try {
    if (result && typeof result._repr_html_ === 'function') {
      const html = result._repr_html_();
      const str = String(html);
      html?.destroy?.();
      return str;
    }
  } catch {
    /* pas de repr HTML */
  }
  return null;
}

/**
 * Crée un kernel isolé (un dict de globals dédié). `run` exécute une cellule
 * dans cet état persistant ; `reset` repart d'un kernel vierge.
 */
export function createKernel() {
  let ns = null;

  return {
    /** Exécute `code` → { outputs:[{type,...}], netError? }. */
    async run(code, { onLoading } = {}) {
      if (!loaded) onLoading?.();
      let py;
      try {
        py = await loader();
      } catch {
        return { outputs: [{ type: 'error', text: 'network' }], netError: true };
      }

      ns ??= py.globals.get('dict')();
      const outputs = [];
      const logs = [];
      sink.logs = logs;
      try {
        try {
          await py.loadPackagesFromImports(code);
        } catch {
          /* package indisponible : on laisse l'erreur d'import remonter à l'exécution */
        }

        let result;
        try {
          result = await py.runPythonAsync(code, { globals: ns });
        } catch (e) {
          outputs.push(...logs);
          const lines = String(e?.message ?? e).trim().split('\n');
          outputs.push({ type: 'error', text: lines.slice(-8).join('\n') });
          return { outputs };
        }

        outputs.push(...logs);

        // figures matplotlib
        try {
          const figs = await py.runPythonAsync(CAPTURE_FIGS);
          const arr = figs?.toJs ? figs.toJs() : figs;
          if (arr) for (const b64 of arr) outputs.push({ type: 'image', png: b64 });
          figs?.destroy?.();
        } catch {
          /* pas de matplotlib */
        }

        // valeur de la dernière expression
        if (result !== undefined && result !== null) {
          const html = reprHtml(result);
          if (html) outputs.push({ type: 'html', html });
          else outputs.push({ type: 'stream', stream: 'stdout', text: String(result) });
          result?.destroy?.();
        }
      } finally {
        sink.logs = null;
      }
      return { outputs };
    },

    /** Repart d'un kernel vierge (Restart). */
    reset() {
      ns?.destroy?.();
      ns = null;
    },
  };
}
