import { createApp } from 'vue'
import App from './App.vue'

// Bundled code fonts (@font-face only — the browser fetches a file lazily,
// the first time the matching font-family is actually selected).
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/fira-code'
import '@fontsource/ibm-plex-mono'

// Tailwind layer (Preflight disabled) then the visualizers' own stylesheet,
// imported last so its rules win over any Tailwind base.
import '@/assets/styles/main.css'
import '@/assets/styles/visualizers.css'

createApp(App).mount('#app')
