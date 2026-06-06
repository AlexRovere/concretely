/**
 * Vue engine: the user code runs in a sandboxed iframe with the FULL Vue
 * build (runtime template compiler included) exposed as the `Vue` global —
 * live preview in the iframe, console.* relayed to the parent via
 * postMessage. The Vue file ships as a hashed asset, fetched on first use.
 */
import vueUrl from 'vue/dist/vue.esm-browser.prod.js?url';

let seq = 0;

/** Builds the iframe srcdoc for one run (unique id filters its messages). */
export function vueSrcdoc(code) {
  const id = `pg-vue-${++seq}`;
  // a closing </script> inside user code would break out of the srcdoc
  const safe = code.replace(/<\/script/gi, '<\\/script');
  const srcdoc = `<!doctype html><html><head><style>
    body { margin: 8px; font-family: system-ui, sans-serif; color: inherit; }
    button { font: inherit; padding: 4px 10px; }
  </style></head><body>
  <div id="app"></div>
  <script type="module">
    const send = (kind, text) => parent.postMessage({ pg: '${id}', kind, text }, '*');
    const fmt = (a) => {
      if (typeof a === 'string') return a;
      try { return JSON.stringify(a) ?? String(a); } catch { return String(a); }
    };
    for (const kind of ['log', 'info', 'warn', 'error'])
      console[kind] = (...args) => send(kind === 'info' ? 'log' : kind, args.map(fmt).join(' '));
    window.onerror = (msg) => { send('crash', String(msg)); return true; };
    window.onunhandledrejection = (e) => send('crash', String(e.reason));
    try {
      const Vue = await import('${vueUrl}');
      window.Vue = Vue;
      ${safe}
      send('done', '');
    } catch (err) { send('crash', String(err)); }
  </script></body></html>`;
  return { id, srcdoc };
}
