// Shared imperative helpers for the visualizer panels. These build innerHTML and
// read the *raw* i18n `t` (re-invoked by each panel's onLocaleChange refresher),
// exactly as the original vanilla app did — so behaviour is unchanged.
import { t, algoMeta } from '../i18n.js'
import { DISTRIBUTIONS } from '../distributions.js'

export const playLabel = (playing) => (playing ? `⏸ ${t('btn.pause')}` : `▶ ${t('btn.play')}`)

export function setStatus(el, player, extra = '') {
  const pct = Math.round(player.progress * 100)
  el.textContent = `${pct}% — ${player.steps.length} ${t('status.steps')}${extra ? ' — ' + extra : ''}`
}

/** Render an algorithm's complexity, plain-language explanation, tip and legend. */
export function showComplexity(el, entry, capped) {
  const c = entry.complexity || {}
  const tags = Object.entries(c)
    .map(([k, v]) => `<span class="cx" title="${t(`cx.title.${k}`)}"><b>${t(`cx.label.${k}`)}</b> ${v}</span>`)
    .join('')
  let html = `<div class="cx-row">${tags}</div>`
  if (entry.desc) html += `<p class="cx-desc">${entry.desc}</p>`
  if (entry.tips) html += `<p class="cx-tips"><b>${t('cx.whenToUse')}</b> ${entry.tips}</p>`
  if (capped) html += `<p class="cx-warn">${t('cx.capped')(capped)}</p>`
  html += `<p class="cx-legend">${t('cx.legend')}</p>`
  el.innerHTML = html
}

export function fillAlgoSelect(select, ids) {
  select.innerHTML = ''
  for (const id of ids) {
    const opt = document.createElement('option')
    opt.value = id
    opt.textContent = algoMeta(id).name
    select.appendChild(opt)
  }
}

export const relabelAlgoSelect = (select) => {
  for (const opt of select.options) opt.textContent = algoMeta(opt.value).name
}

export function fillDistSelect(select) {
  select.innerHTML = ''
  for (const { id } of DISTRIBUTIONS) {
    const opt = document.createElement('option')
    opt.value = id
    opt.textContent = t(`dist.${id}`)
    select.appendChild(opt)
  }
}

export const relabelDistSelect = (select) => {
  for (const opt of select.options) opt.textContent = t(`dist.${opt.value}`)
}

/** Standard play/pause/step/reset wiring shared by every player-driven panel. */
export function wirePlayerButtons({ playBtn, stepBtn, resetBtn, player, refreshLabel }) {
  const setLabel = (playing) => {
    playBtn.textContent = playLabel(playing)
    refreshLabel?.(playing)
  }
  stepBtn.onclick = () => { player.pause(); player.stepOnce(); setLabel(false) }
  resetBtn.onclick = () => { player.load(player.steps); setLabel(false) }
  playBtn.onclick = () => {
    if (player.playing) { player.pause() }
    else { if (player.done) player.load(player.steps); player.play() }
    setLabel(player.playing)
  }
  return setLabel
}
