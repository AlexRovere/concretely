/**
 * Ruby engine: real CRuby compiled to WebAssembly (the official ruby.wasm).
 * The ~25 MB module ships as a hashed asset and is downloaded + compiled
 * ONCE, the first time the user actually runs Ruby (then cached by the
 * browser). stdout/stderr land on console.log/warn, which we intercept
 * around the synchronous eval.
 */
import rubyWasmUrl from '@ruby/3.4-wasm-wasi/dist/ruby+stdlib.wasm?url';

let vmPromise = null;

async function getVm(onProgress) {
  vmPromise ??= (async () => {
    onProgress?.();
    const { DefaultRubyVM } = await import('@ruby/wasm-wasi/dist/browser');
    const module = await WebAssembly.compileStreaming(fetch(rubyWasmUrl));
    const { vm } = await DefaultRubyVM(module);
    return vm;
  })();
  return vmPromise;
}

export async function runRuby(code, { onLoading } = {}) {
  const logs = [];
  let vm;
  try {
    vm = await getVm(onLoading);
  } catch (e) {
    vmPromise = null; // allow a retry after a failed download
    return { logs: [{ kind: 'crash', text: String(e) }], loadError: true };
  }

  // DefaultRubyVM line-buffers Ruby's stdout to console.log / stderr to warn.
  const orig = { log: console.log, warn: console.warn };
  console.log = (...a) => logs.push({ kind: 'log', text: a.join(' ') });
  console.warn = (...a) => logs.push({ kind: 'warn', text: a.join(' ') });
  try {
    vm.eval(code);
  } catch (e) {
    // RbError message includes the Ruby backtrace — keep the first lines.
    logs.push({ kind: 'crash', text: String(e.message ?? e).split('\n').slice(0, 4).join('\n') });
  } finally {
    console.log = orig.log;
    console.warn = orig.warn;
  }
  return { logs, loadError: false };
}
