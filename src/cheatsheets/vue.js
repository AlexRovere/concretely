/**
 * Cheatsheet Vue 3 — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'vue',
  lang: 'js',
  sections: [
    {
      id: 'reactivity',
      title: { fr: 'Réactivité', en: 'Reactivity' },
      items: [
        {
          id: 'vue-ref',
          title: { fr: 'ref vs reactive', en: 'ref vs reactive' },
          code: `const n = ref(0)             // .value en script
n.value++                    // le template déballe tout seul
const s = reactive({ a: 1 }) // pas de .value, mais
// la déstructuration casse la réactivité !`,
          note: {
            fr: `ref pour les primitives (et en général) ; reactive pour les objets, mais ne jamais le déstructurer.`,
            en: `ref for primitives (and in general); reactive for objects, but never destructure it.`,
          },
        },
        {
          id: 'vue-computed',
          title: { fr: 'computed (avec cache)', en: 'computed (cached)' },
          code: `const items = ref([1, 2, 3])
// recalculé seulement si items change, sinon cache
const total = computed(() => items.value.reduce((a, b) => a + b, 0))
// ne JAMAIS muter dedans : lecture seule par défaut`,
          note: {
            fr: `computed met en cache tant que ses dépendances ne changent pas — préférez-le à une méthode appelée dans le template.`,
            en: `computed caches until its dependencies change — prefer it over a method called from the template.`,
          },
        },
        {
          id: 'vue-watch',
          title: { fr: 'watch vs watchEffect', en: 'watch vs watchEffect' },
          code: `// watch : source explicite + ancienne valeur
watch(userId, (neuf, ancien) => charger(neuf))
// watchEffect : traque automatiquement ce qu'il lit,
// et s'exécute immédiatement au montage
watchEffect(() => console.log(userId.value))`,
          note: {
            fr: `watch quand vous voulez contrôler la source et comparer ancien/nouveau ; watchEffect pour un effet simple qui dépend de plusieurs refs.`,
            en: `watch when you need an explicit source and old/new comparison; watchEffect for a simple effect depending on several refs.`,
          },
        },
        {
          id: 'vue-watch-options',
          title: { fr: 'Options de watch : immediate, deep, once', en: 'watch options: immediate, deep, once' },
          code: `watch(filtre, charger, { immediate: true }) // exécute aussi au montage
watch(form, valider, { deep: true })        // observe les mutations imbriquées
watch(token, init, { once: true })          // une seule fois (Vue 3.4+)`,
          note: {
            fr: `deep est coûteux sur les grosses structures : préférez observer une propriété précise (() => form.email).`,
            en: `deep is expensive on large structures: prefer watching a precise property (() => form.email).`,
          },
        },
        {
          id: 'vue-torefs',
          title: { fr: 'Piège : déstructurer reactive → toRefs', en: 'Pitfall: destructuring reactive → toRefs' },
          code: `const state = reactive({ count: 0, nom: 'Ada' })
const { count } = state          // ✗ count est un nombre figé
const { nom } = toRefs(state)    // ✓ nom reste une ref liée
const seul = toRef(state, 'count') // ✓ une seule propriété`,
          note: {
            fr: `La déstructuration copie la valeur et coupe le lien réactif ; toRefs/toRef créent des refs connectées à l'objet d'origine.`,
            en: `Destructuring copies the value and severs reactivity; toRefs/toRef create refs still connected to the source object.`,
          },
        },
        {
          id: 'vue-shallowref',
          title: { fr: 'shallowRef pour les grosses structures', en: 'shallowRef for large structures' },
          code: `// seul .value est réactif, pas l'intérieur : très peu coûteux
const data = shallowRef(grosTableauDe10000Lignes)
data.value = nouveauTableau   // ✓ déclenche la mise à jour
data.value[0].x = 1           // ✗ ne déclenche rien
triggerRef(data)              // forcer manuellement si besoin`,
          note: {
            fr: `Évite le proxy profond sur les données massives (résultats d'API, canvas, libs externes) : remplacez la valeur entière pour notifier.`,
            en: `Skips the deep proxy on massive data (API results, canvas, external libs): replace the whole value to notify.`,
          },
        },
      ],
    },
    {
      id: 'template',
      title: { fr: 'Template & directives', en: 'Template & directives' },
      items: [
        {
          id: 'vue-vif-vshow',
          title: { fr: 'v-if vs v-show', en: 'v-if vs v-show' },
          code: `<!-- v-if : retire du DOM (composant détruit/recréé) -->
<Panneau v-if="ouvert" />
<!-- v-show : reste dans le DOM, bascule display:none -->
<Panneau v-show="ouvert" />`,
          note: {
            fr: `v-show pour un élément qui bascule souvent (coût initial, bascule gratuite) ; v-if quand la condition change rarement ou que le contenu est lourd.`,
            en: `v-show for elements toggled often (upfront cost, cheap toggle); v-if when the condition rarely changes or the content is heavy.`,
          },
        },
        {
          id: 'vue-vfor-key',
          title: { fr: 'v-for + :key (pourquoi)', en: 'v-for + :key (why)' },
          code: `<!-- :key stable = Vue réordonne au lieu de tout réécrire -->
<li v-for="t in taches" :key="t.id">{{ t.titre }}</li>
<!-- ✗ :key="index" : bugs d'état lors d'insertion/suppression -->`,
          note: {
            fr: `Une clé stable (id) permet à Vue d'identifier chaque nœud ; l'index casse l'état local (inputs, animations) dès que la liste bouge.`,
            en: `A stable key (id) lets Vue identify each node; using the index breaks local state (inputs, animations) as soon as the list changes.`,
          },
        },
        {
          id: 'vue-vmodel',
          title: { fr: 'v-model + modificateurs', en: 'v-model + modifiers' },
          code: `<input v-model="nom">                <!-- liaison bidirectionnelle -->
<input v-model.trim="email">         <!-- retire les espaces -->
<input v-model.number="age">         <!-- cast en nombre -->
<input v-model.lazy="bio">           <!-- met à jour au change, pas à l'input -->`,
          note: {
            fr: `Sucre pour :value + @input ; .number renvoie NaN si la saisie n'est pas convertible, pensez à valider.`,
            en: `Sugar for :value + @input; .number yields NaN when input cannot be converted, so validate.`,
          },
        },
        {
          id: 'vue-shorthands',
          title: { fr: 'Raccourcis v-bind / v-on', en: 'v-bind / v-on shorthands' },
          code: `<img :src="url" :alt="titre">        <!-- : = v-bind -->
<button @click="sauver">OK</button>   <!-- @ = v-on -->
<form @submit.prevent="envoyer">      <!-- modificateurs d'événement -->
<input @keyup.enter="valider">
<Comp v-bind="props" />               <!-- propage un objet entier -->`,
          note: {
            fr: `Les modificateurs (.prevent, .stop, .enter, .once) évitent le code boilerplate dans les handlers.`,
            en: `Modifiers (.prevent, .stop, .enter, .once) remove boilerplate from your handlers.`,
          },
        },
        {
          id: 'vue-class-style',
          title: { fr: 'Liaison de classe et de style', en: 'Class and style binding' },
          code: `<!-- objet : la classe s'applique si la valeur est truthy -->
<div :class="{ actif: estActif, 'a-erreur': erreurs.length }">
<!-- tableau : mélange classes fixes et conditionnelles -->
<div :class="[base, estActif && 'actif']">
<div :style="{ width: largeur + 'px' }">`,
          note: {
            fr: `:class fusionne avec l'attribut class statique ; la syntaxe objet est la plus lisible pour des états on/off.`,
            en: `:class merges with the static class attribute; the object syntax reads best for on/off states.`,
          },
        },
        {
          id: 'vue-vhtml',
          title: { fr: 'v-html (danger XSS)', en: 'v-html (XSS danger)' },
          code: `<!-- injecte du HTML brut : JAMAIS avec du contenu utilisateur -->
<div v-html="articleHtml"></div>
<!-- préférer {{ texte }} (échappé) ou assainir côté serveur -->`,
          note: {
            fr: `v-html n'échappe rien : du HTML venant d'un utilisateur permet l'injection de scripts (XSS). Réservez-le au contenu de confiance ou assaini.`,
            en: `v-html escapes nothing: user-provided HTML enables script injection (XSS). Reserve it for trusted or sanitized content.`,
          },
        },
      ],
    },
    {
      id: 'components',
      title: { fr: 'Composants', en: 'Components' },
      items: [
        {
          id: 'vue-defineprops',
          title: { fr: 'defineProps (syntaxe + validation)', en: 'defineProps (syntax + validation)' },
          code: `const props = defineProps({
  titre: { type: String, required: true },
  taille: { type: Number, default: 10 },
  variante: {
    type: String,
    validator: (v) => ['plein', 'contour'].includes(v),
  },
})
// props.titre — réactif, en lecture seule`,
          note: {
            fr: `Macro compilateur (pas d'import) ; la validation n'avertit qu'en dev mais documente le contrat du composant.`,
            en: `Compiler macro (no import); validation only warns in dev but documents the component contract.`,
          },
        },
        {
          id: 'vue-defineemits',
          title: { fr: 'defineEmits (syntaxe + validation)', en: 'defineEmits (syntax + validation)' },
          code: `const emit = defineEmits({
  // null = pas de validation ; fonction = valide la charge utile
  fermer: null,
  soumettre: (charge) => !!charge.email,
})
emit('soumettre', { email: 'a@b.fr' })`,
          note: {
            fr: `Déclarer les événements rend le composant auto-documenté et évite qu'ils fuient en attributs sur l'élément racine.`,
            en: `Declaring events makes the component self-documented and prevents them from leaking as attributes on the root element.`,
          },
        },
        {
          id: 'vue-definemodel',
          title: { fr: 'defineModel (v-model enfant)', en: 'defineModel (child v-model)' },
          code: `// Enfant : remplace props.modelValue + emit('update:modelValue')
const valeur = defineModel()            // v-model
const ouvert = defineModel('ouvert')    // v-model:ouvert (nommé)
valeur.value = 'nouvelle valeur'        // remonte au parent
// Parent : <Champ v-model="texte" v-model:ouvert="visible" />`,
          note: {
            fr: `Stable depuis Vue 3.4 : une ref accessible en écriture qui synchronise automatiquement avec le v-model du parent.`,
            en: `Stable since Vue 3.4: a writable ref that automatically syncs with the parent's v-model.`,
          },
        },
        {
          id: 'vue-slots',
          title: { fr: 'Slots : défaut + nommés', en: 'Slots: default + named' },
          code: `<!-- Enfant (Carte.vue) -->
<header><slot name="titre">Titre par défaut</slot></header>
<main><slot /></main>
<!-- Parent -->
<Carte>
  <template #titre>Mon titre</template>
  Contenu du slot par défaut
</Carte>`,
          note: {
            fr: `Le contenu entre les balises de slot sert de repli si le parent ne fournit rien ; #titre est le raccourci de v-slot:titre.`,
            en: `Content inside the slot tags is the fallback when the parent provides nothing; #titre is shorthand for v-slot:titre.`,
          },
        },
        {
          id: 'vue-scoped-slots',
          title: { fr: 'Scoped slots (données de l\'enfant)', en: 'Scoped slots (child data)' },
          code: `<!-- Enfant : expose des données au parent via le slot -->
<slot v-for="(item, i) in items" :item="item" :index="i" />
<!-- Parent : récupère les props du slot -->
<Liste #default="{ item }">
  <strong>{{ item.nom }}</strong>
</Liste>`,
          note: {
            fr: `L'enfant garde la logique (boucle, état), le parent garde le rendu : le pattern « renderless component » repose dessus.`,
            en: `The child owns the logic (loop, state), the parent owns the rendering: the renderless component pattern is built on this.`,
          },
        },
        {
          id: 'vue-provide-inject',
          title: { fr: 'provide / inject typés', en: 'Typed provide / inject' },
          code: `// cles.js — une clé Symbol partagée évite les collisions
export const ThemeKey = Symbol('theme')
// Ancêtre
provide(ThemeKey, theme)            // passer une ref = reste réactif
// Descendant (peu importe la profondeur)
const theme = inject(ThemeKey, 'clair') // 2e argument = valeur par défaut`,
          note: {
            fr: `Évite le prop drilling pour ce qui est transversal (thème, locale, services) ; fournissez une ref si le descendant doit réagir aux changements.`,
            en: `Avoids prop drilling for cross-cutting concerns (theme, locale, services); provide a ref if descendants must react to changes.`,
          },
        },
      ],
    },
    {
      id: 'lifecycle',
      title: { fr: 'Cycle de vie', en: 'Lifecycle' },
      items: [
        {
          id: 'vue-onmounted',
          title: { fr: 'onMounted / onUnmounted', en: 'onMounted / onUnmounted' },
          code: `onMounted(() => {
  // le DOM existe : mesures, focus, libs tierces
  window.addEventListener('resize', surRedim)
})
onUnmounted(() => {
  // TOUJOURS nettoyer ce qu'on a installé
  window.removeEventListener('resize', surRedim)
})`,
          note: {
            fr: `S'appellent à la racine du setup (jamais dans une condition ou un callback asynchrone) ; chaque écouteur global doit avoir son nettoyage.`,
            en: `Call them at the top level of setup (never inside a condition or async callback); every global listener needs its cleanup.`,
          },
        },
        {
          id: 'vue-keepalive-hooks',
          title: { fr: 'onActivated / onDeactivated (KeepAlive)', en: 'onActivated / onDeactivated (KeepAlive)' },
          code: `<!-- Parent : le composant est mis en cache, pas détruit -->
<KeepAlive><component :is="ongletActif" /></KeepAlive>`,
          note: {
            fr: `Dans KeepAlive, onMounted ne se rejoue pas au retour : utilisez onActivated pour rafraîchir les données et onDeactivated pour mettre en pause (timers, vidéos).`,
            en: `Inside KeepAlive, onMounted does not re-run when coming back: use onActivated to refresh data and onDeactivated to pause things (timers, videos).`,
          },
        },
        {
          id: 'vue-nexttick',
          title: { fr: 'nextTick : attendre le DOM', en: 'nextTick: wait for the DOM' },
          code: `messages.value.push(nouveau)
// le DOM n'est pas encore mis à jour ici (rendu groupé)
await nextTick()
// maintenant oui : on peut mesurer / scroller
conteneur.value.scrollTop = conteneur.value.scrollHeight`,
          note: {
            fr: `Vue groupe les mises à jour du DOM de façon asynchrone : nextTick résout une promesse une fois le DOM réellement à jour.`,
            en: `Vue batches DOM updates asynchronously: nextTick resolves once the DOM has actually been patched.`,
          },
        },
        {
          id: 'vue-watch-cleanup',
          title: { fr: 'Nettoyage dans watch / watchEffect', en: 'Cleanup in watch / watchEffect' },
          code: `watch(requete, async (q, _ancien, onCleanup) => {
  const ctrl = new AbortController()
  // appelé si requete change à nouveau OU si le composant meurt
  onCleanup(() => ctrl.abort())
  resultats.value = await chercher(q, { signal: ctrl.signal })
})`,
          note: {
            fr: `onCleanup annule l'effet précédent avant le suivant : indispensable pour éviter les réponses obsolètes (race conditions) et les fuites.`,
            en: `onCleanup cancels the previous effect before the next run: essential to avoid stale responses (race conditions) and leaks.`,
          },
        },
      ],
    },
    {
      id: 'composables',
      title: { fr: 'Composables & patterns', en: 'Composables & patterns' },
      items: [
        {
          id: 'vue-composable',
          title: { fr: 'Structure d\'un composable (useX)', en: 'Composable structure (useX)' },
          code: `// useSouris.js — état + logique réutilisables
export function useSouris() {
  const x = ref(0), y = ref(0)
  const bouger = (e) => { x.value = e.pageX; y.value = e.pageY }
  onMounted(() => window.addEventListener('mousemove', bouger))
  onUnmounted(() => window.removeEventListener('mousemove', bouger))
  return { x, y } // renvoyer des refs, pas un reactive
}`,
          note: {
            fr: `Convention useX, appelé à la racine du setup ; renvoyer un objet de refs permet au consommateur de déstructurer sans perdre la réactivité.`,
            en: `useX convention, called at the top level of setup; returning an object of refs lets consumers destructure without losing reactivity.`,
          },
        },
        {
          id: 'vue-shared-state',
          title: { fr: 'État partagé : singleton vs par appel', en: 'Shared state: singleton vs per-call' },
          code: `// État AU NIVEAU MODULE = partagé par tous les appelants (singleton)
const compteur = ref(0)
export function useCompteurGlobal() { return { compteur } }

// État DANS la fonction = neuf à chaque appel (isolé)
export function useCompteurLocal() {
  const compteur = ref(0)
  return { compteur }
}`,
          note: {
            fr: `L'emplacement de la déclaration décide du partage ; attention au singleton en SSR (état partagé entre requêtes) — préférez Pinia dans ce cas.`,
            en: `Where you declare the state decides the sharing; beware singletons in SSR (state shared across requests) — prefer Pinia there.`,
          },
        },
        {
          id: 'vue-tovalue',
          title: { fr: 'Arguments souples : toValue', en: 'Flexible arguments: toValue' },
          code: `// accepte une valeur brute, une ref ou un getter (Vue 3.3+)
export function useFetch(url) {
  const data = ref(null)
  watchEffect(async () => {
    data.value = await (await fetch(toValue(url))).json()
  })
  return { data }
}
// useFetch('/api'), useFetch(urlRef), useFetch(() => \`/api/\${id.value}\`)`,
          note: {
            fr: `toValue normalise valeur/ref/getter : votre composable redevient réactif si l'appelant passe une ref ou un getter.`,
            en: `toValue normalizes value/ref/getter: your composable stays reactive when callers pass a ref or a getter.`,
          },
        },
        {
          id: 'vue-defineexpose',
          title: { fr: 'defineExpose', en: 'defineExpose' },
          code: `// Enfant : avec <script setup>, tout est privé par défaut
const focus = () => champ.value.focus()
defineExpose({ focus })
// Parent
const enfant = ref(null)
enfant.value.focus() // seule l'API exposée est visible`,
          note: {
            fr: `<script setup> n'expose rien par défaut : defineExpose publie une API impérative minimale (focus, reset, open…) au lieu de tout l'état interne.`,
            en: `<script setup> exposes nothing by default: defineExpose publishes a minimal imperative API (focus, reset, open…) instead of all internal state.`,
          },
        },
        {
          id: 'vue-template-refs',
          title: { fr: 'Template refs (élément / composant)', en: 'Template refs (element / component)' },
          code: `// la ref porte le même nom que l'attribut ref du template
const champ = ref(null)        // <input ref="champ">
const modale = ref(null)       // <Modale ref="modale">
onMounted(() => {
  champ.value.focus()          // élément DOM natif
  modale.value.ouvrir()        // méthode exposée via defineExpose
})`,
          note: {
            fr: `La ref est null avant le montage (et avec v-if tant que l'élément n'existe pas) : accédez-y dans onMounted ou après nextTick.`,
            en: `The ref is null before mount (and with v-if while the element does not exist): access it in onMounted or after nextTick.`,
          },
        },
      ],
    },
    {
      id: 'transitions',
      title: { fr: 'Transitions & Teleport', en: 'Transitions & Teleport' },
      items: [
        {
          id: 'vue-transition',
          title: { fr: "Transition : animer l'entrée/sortie", en: 'Transition: animate enter/leave' },
          code: `<Transition name="fondu">
  <p v-if="visible">Contenu</p>
</Transition>
<style>
.fondu-enter-active, .fondu-leave-active { transition: opacity 0.3s; }
.fondu-enter-from, .fondu-leave-to { opacity: 0; }
</style>`,
          note: {
            fr: `Transition applique automatiquement des classes CSS (name-enter-from, name-enter-active…) autour d'un v-if/v-show pour animer l'entrée et la sortie d'un seul élément.`,
            en: `Transition automatically applies CSS classes (name-enter-from, name-enter-active…) around a v-if/v-show to animate a single element's enter and leave.`,
          },
        },
        {
          id: 'vue-transition-group',
          title: { fr: 'TransitionGroup : animer une liste', en: 'TransitionGroup: animate a list' },
          code: `<TransitionGroup name="liste" tag="ul">
  <li v-for="t in taches" :key="t.id">{{ t.titre }}</li>
</TransitionGroup>`,
          note: {
            fr: `Contrairement à Transition (un seul élément), TransitionGroup anime l'ajout/suppression/réordonnancement d'une liste et nécessite tag + :key stable sur chaque enfant.`,
            en: `Unlike Transition (a single element), TransitionGroup animates the add/remove/reorder of a list and requires tag + a stable :key on each child.`,
          },
        },
        {
          id: 'vue-teleport',
          title: { fr: 'Teleport : sortir du DOM parent', en: 'Teleport: escape the parent DOM' },
          code: `<button @click="ouvert = true">Ouvrir</button>
<Teleport to="body">
  <div v-if="ouvert" class="modale">Contenu de la modale</div>
</Teleport>`,
          note: {
            fr: `Teleport déplace le rendu vers un autre nœud du DOM (souvent body) tout en gardant le composant dans l'arbre logique Vue — indispensable pour les modales/tooltips qui doivent échapper à un parent avec overflow:hidden ou un z-index limité.`,
            en: `Teleport renders into a different DOM node (often body) while keeping the component in Vue's logical tree — essential for modals/tooltips that need to escape a parent with overflow:hidden or a limited z-index.`,
          },
        },
      ],
    },
    {
      id: 'app-api',
      title: { fr: 'API application & extensions', en: 'App API & extensions' },
      items: [
        {
          id: 'vue-createapp',
          title: { fr: 'createApp, app.use, app.component', en: 'createApp, app.use, app.component' },
          code: `import { createApp } from 'vue'
import App from './App.vue'
import routeur from './routeur'

const app = createApp(App)
app.use(routeur)                      // installe un plugin
app.component('MonBouton', MonBouton) // enregistrement global
app.mount('#app')`,
          note: {
            fr: `createApp crée une instance d'application isolée (utile pour les tests, plusieurs apps sur une page) ; app.use installe un plugin (router, store), app.component enregistre un composant utilisable partout sans import.`,
            en: `createApp creates an isolated app instance (handy for tests, multiple apps on one page); app.use installs a plugin (router, store), app.component registers a component usable everywhere without importing it.`,
          },
        },
        {
          id: 'vue-custom-directive',
          title: { fr: 'Directive personnalisée', en: 'Custom directive' },
          code: `const vFocus = {
  mounted: (el) => el.focus(),   // hook appelé quand l'élément est inséré
}
// enregistrement global : app.directive('focus', vFocus)
// utilisation : <input v-focus>`,
          note: {
            fr: `Une directive personnalisée manipule directement le DOM via des hooks (mounted, updated…) — utile pour des besoins impératifs que la réactivité ne couvre pas naturellement (focus, tooltip tiers, mesures).`,
            en: `A custom directive manipulates the DOM directly via hooks (mounted, updated…) — useful for imperative needs that reactivity doesn't naturally cover (focus, third-party tooltip, measurements).`,
          },
        },
        {
          id: 'vue-async-suspense',
          title: { fr: 'defineAsyncComponent & Suspense', en: 'defineAsyncComponent & Suspense' },
          code: `const Lourd = defineAsyncComponent(() => import('./Lourd.vue'))
// avec état de chargement pendant le fetch du chunk :
<Suspense>
  <template #default><Lourd /></template>
  <template #fallback><Spinner /></template>
</Suspense>`,
          note: {
            fr: `defineAsyncComponent charge un composant à la demande (code-splitting) ; Suspense affiche un fallback pendant que le composant (ou ses setup async) se résout, évitant un écran vide.`,
            en: `defineAsyncComponent loads a component on demand (code-splitting); Suspense shows a fallback while the component (or its async setup) resolves, avoiding a blank screen.`,
          },
        },
      ],
    },
    {
      id: 'ecosystem',
      title: { fr: 'Router & Pinia (essentiel)', en: 'Router & Pinia (essentials)' },
      items: [
        {
          id: 'vue-useroute',
          title: { fr: 'useRoute : params et query', en: 'useRoute: params and query' },
          code: `// route déclarée : { path: '/users/:id', ... }
const route = useRoute()
route.params.id     // segment dynamique de l'URL
route.query.page    // ?page=2
route.path          // chemin courant`,
          note: {
            fr: `useRoute renvoie la route courante (réactive, lecture seule) ; useRouter sert à naviguer — ne confondez pas les deux.`,
            en: `useRoute returns the current route (reactive, read-only); useRouter is for navigating — do not mix them up.`,
          },
        },
        {
          id: 'vue-router-push',
          title: { fr: 'Navigation programmatique', en: 'Programmatic navigation' },
          code: `const router = useRouter()
router.push('/login')                              // par chemin
router.push({ name: 'user', params: { id: 7 } })   // par nom (refactor-proof)
router.replace('/login')   // sans entrée dans l'historique
router.back()              // équivalent au bouton retour`,
          note: {
            fr: `Naviguer par nom de route survit aux changements d'URL ; replace pour les redirections (login) afin de ne pas polluer l'historique.`,
            en: `Navigating by route name survives URL refactors; use replace for redirects (login) to keep history clean.`,
          },
        },
        {
          id: 'vue-route-watch',
          title: { fr: 'Réagir au changement de params', en: 'React to param changes' },
          code: `// /users/1 -> /users/2 : le composant est RÉUTILISÉ,
// onMounted ne se rejoue pas — il faut observer le param
watch(() => route.params.id, chargerUtilisateur, { immediate: true })`,
          note: {
            fr: `Piège classique : entre deux routes du même composant, Vue Router réutilise l'instance ; un watch avec immediate couvre montage + changements.`,
            en: `Classic pitfall: between two routes of the same component, Vue Router reuses the instance; a watch with immediate covers both mount and changes.`,
          },
        },
        {
          id: 'vue-definestore',
          title: { fr: 'defineStore (syntaxe setup)', en: 'defineStore (setup syntax)' },
          code: `export const usePanier = defineStore('panier', () => {
  const articles = ref([])                                 // state
  const total = computed(() =>                             // getter
    articles.value.reduce((s, a) => s + a.prix, 0))
  function ajouter(article) { articles.value.push(article) } // action
  return { articles, total, ajouter } // tout doit être renvoyé
})`,
          note: {
            fr: `La syntaxe setup réutilise les briques connues (ref/computed/function) ; tout état non renvoyé casse la devtools et l'hydratation SSR.`,
            en: `Setup syntax reuses familiar building blocks (ref/computed/function); any state not returned breaks devtools and SSR hydration.`,
          },
        },
        {
          id: 'vue-storetorefs',
          title: { fr: 'storeToRefs : déstructurer un store', en: 'storeToRefs: destructure a store' },
          code: `const panier = usePanier()
const { articles, total } = storeToRefs(panier) // ✓ refs réactives
const { ajouter } = panier                      // ✓ les actions, directement
// const { total } = panier                     // ✗ perd la réactivité`,
          note: {
            fr: `Un store est un reactive : le déstructurer directement fige les valeurs ; storeToRefs pour l'état/getters, déstructuration simple pour les actions.`,
            en: `A store is a reactive object: destructuring it directly freezes values; storeToRefs for state/getters, plain destructuring for actions.`,
          },
        },
      ],
    },
    {
      id: 'vue-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'vue-bp-no-prop-mutation',
          title: { fr: 'Ne jamais muter une prop', en: 'Never mutate a prop' },
          code: `// ✗ props.count++\nfunction incrementer() { emit('update:count', props.count + 1) }`,
          note: {
            fr: `Une prop est un flux à sens unique (parent → enfant) ; la muter localement désynchronise l'affichage de l'état réel du parent, et Vue émet un avertissement en dev.`,
            en: `A prop is one-way data flow (parent → child); mutating it locally desyncs the view from the parent's real state, and Vue warns about it in dev.`,
          },
        },
        {
          id: 'vue-bp-computed-over-watch',
          title: { fr: 'computed plutôt que watch pour dériver un état', en: 'computed over watch to derive state' },
          code: `// ✗ watch(items, () => { total.value = calc(items.value) })\nconst total = computed(() => calc(items.value))  // ✓`,
          note: {
            fr: `watch pour dériver une valeur ajoute un état intermédiaire à resynchroniser manuellement ; computed est déclaratif et toujours à jour, sans étape de recalcul manuelle.`,
            en: `Using watch to derive a value adds an intermediate state to resync manually; computed is declarative and always up to date, with no manual recompute step.`,
          },
        },
        {
          id: 'vue-bp-scoped-styles',
          title: { fr: 'Scoper les styles des composants', en: 'Scope component styles' },
          code: `<style scoped>\n.carte { padding: 1rem; }\n</style>`,
          note: {
            fr: `Sans scoped (ou CSS modules), une classe comme .carte peut entrer en collision avec une autre du même nom ailleurs dans l'app et casser un style sans lien apparent.`,
            en: `Without scoped (or CSS modules), a class like .carte can collide with another of the same name elsewhere in the app and break an unrelated style.`,
          },
        },
        {
          id: 'vue-bp-small-composables',
          title: { fr: 'Composables petits et à responsabilité unique', en: 'Small, single-purpose composables' },
          code: `function useUser(id) { /* fetch + état utilisateur */ }\nfunction usePermissions(user) { /* dérive les droits */ }\n// le composant combine les deux, chacun reste testable seul`,
          note: {
            fr: `Un composable qui mélange fetch, formulaire et navigation devient impossible à tester et à réutiliser ; plusieurs petits composables composés restent isolés et testables.`,
            en: `A composable mixing fetch, form logic and navigation becomes untestable and unreusable; several small composed composables stay isolated and testable.`,
          },
        },
        {
          id: 'vue-bp-flat-state',
          title: { fr: 'Garder un state réactif plat', en: 'Keep reactive state flat' },
          code: `// ✗ const state = reactive({ user: { profile: { address: {...} } } })\nconst userId = ref(null)\nconst userProfile = ref(null)   // état plat, plus facile à observer`,
          note: {
            fr: `Un state reactive profondément imbriqué alourdit le proxy réactif et complique les watch deep ; un état plat est plus simple à observer, tester et déboguer.`,
            en: `A deeply nested reactive state adds proxy overhead and complicates deep watching; flat state is simpler to observe, test and debug.`,
          },
        },
      ],
    },
  ],
};
