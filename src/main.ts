import { createApp } from 'vue'
import App from './App.vue'

// Tailwind layer (Preflight disabled) then the visualizers' own stylesheet,
// imported last so its rules win over any Tailwind base.
import '@/assets/styles/main.css'
import '@/assets/styles/visualizers.css'

createApp(App).mount('#app')
