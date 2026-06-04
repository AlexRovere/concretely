<script setup>
import { ref, onMounted } from 'vue'
import { STRUCTURES, Stack, Queue, HashMap } from '@/datastructures.js'
import { t, onLocaleChange } from '@/i18n.js'
import { useI18n } from '@/composables/useI18n'

const { t: tt } = useI18n()
const root = ref(null)

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id)

  const structEl = $('ds-structure')
  const valueEl = $('ds-value')
  const view = $('ds-view')
  const info = $('ds-info')
  const addBtn = $('ds-add')
  const removeBtn = $('ds-remove')
  const inputLabel = $('ds-input-label')
  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'))

  const fillStruct = () => {
    const keep = structEl.value
    structEl.innerHTML = ''
    for (const id of STRUCTURES) {
      const o = document.createElement('option')
      o.value = id
      o.textContent = t(`ds.${id}`)
      structEl.appendChild(o)
    }
    structEl.value = keep || 'stack'
  }
  fillStruct()

  let stack = new Stack()
  let queue = new Queue()
  let map = new HashMap(8)
  let hot = -1 // highlighted bucket
  const kind = () => structEl.value

  const relabelControls = () => {
    if (kind() === 'stack') { addBtn.textContent = t('ds.push'); removeBtn.textContent = t('ds.pop'); removeBtn.hidden = false; inputLabel.textContent = t('ds.value'); }
    else if (kind() === 'queue') { addBtn.textContent = t('ds.enqueue'); removeBtn.textContent = t('ds.dequeue'); removeBtn.hidden = false; inputLabel.textContent = t('ds.value'); }
    else { addBtn.textContent = t('ds.set'); removeBtn.hidden = true; inputLabel.textContent = t('ds.key'); }
  }

  const render = () => {
    if (kind() === 'stack') {
      view.className = 'ds-view stack'
      view.innerHTML = stack.items.map((v) => `<div class="ds-cell">${esc(v)}</div>`).reverse().join('')
        || `<div class="ds-empty">${t('ds.empty')}</div>`
    } else if (kind() === 'queue') {
      view.className = 'ds-view queue'
      view.innerHTML = queue.items.map((v) => `<div class="ds-cell">${esc(v)}</div>`).join('')
        || `<div class="ds-empty">${t('ds.empty')}</div>`
    } else {
      view.className = 'ds-view hashmap'
      view.innerHTML = map.buckets.map((chain, i) =>
        `<div class="ds-bucket${i === hot ? ' hot' : ''}"><span class="ds-bi">${i}</span>` +
        chain.map((e) => `<span class="ds-entry">${esc(e.key)}</span>`).join('') +
        '</div>').join('')
    }
  }

  const nextVal = () => valueEl.value.trim() || String(Math.floor(Math.random() * 99) + 1)

  const add = () => {
    const v = nextVal()
    if (kind() === 'stack') { stack.push(v); hot = -1; info.textContent = `${t('ds.push')} ${v}`; }
    else if (kind() === 'queue') { queue.enqueue(v); info.textContent = `${t('ds.enqueue')} ${v}`; }
    else {
      const r = map.set(v)
      hot = r.index
      let msg = `"${v}" → ${t('ds.bucket')} ${r.index}`
      if (r.collision) msg += ` · ${t('ds.collision')}`
      if (r.resized) msg += ` · ${t('ds.resized')(map.nBuckets)}`
      msg += ` · ${t('ds.load')(map.loadFactor().toFixed(2))}`
      info.textContent = msg
    }
    valueEl.value = ''
    render()
  }

  const remove = () => {
    if (kind() === 'stack') { const v = stack.pop(); info.textContent = v !== undefined ? `${t('ds.pop')} ${v}` : t('ds.empty'); }
    else if (kind() === 'queue') { const v = queue.dequeue(); info.textContent = v !== undefined ? `${t('ds.dequeue')} ${v}` : t('ds.empty'); }
    render()
  }

  const clear = () => { stack = new Stack(); queue = new Queue(); map = new HashMap(8); hot = -1; info.textContent = ''; render(); }

  addBtn.onclick = add
  removeBtn.onclick = remove
  $('ds-clear').onclick = clear
  valueEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); })
  structEl.onchange = () => { relabelControls(); info.textContent = ''; render(); }
  onLocaleChange(() => { const keep = structEl.value; fillStruct(); structEl.value = keep; relabelControls(); render(); })

  relabelControls()
  render()
})
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="ds.structure">{{ tt('ds.structure') }}</span>
        <select id="ds-structure"></select>
      </label>
      <label><span id="ds-input-label">Value</span>
        <input id="ds-value" type="text" maxlength="12" placeholder="…" />
      </label>
      <button id="ds-add" class="primary">Add</button>
      <button id="ds-remove">Remove</button>
      <button id="ds-clear" data-i18n="ds.clear">{{ tt('ds.clear') }}</button>
    </div>
    <div id="ds-info" class="ds-info"></div>
    <div id="ds-view" class="ds-view"></div>
    <p class="hint" data-i18n="ds.note">{{ tt('ds.note') }}</p>
  </section>
</template>
