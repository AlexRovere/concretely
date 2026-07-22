/**
 * Cheatsheet Kotlin / Android — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'kotlin',
  lang: 'kotlin',
  sections: [
    {
      id: 'basics',
      title: { fr: 'Bases & null-safety', en: 'Basics & null safety' },
      items: [
        {
          id: 'kotlin-val-var',
          title: { fr: 'val vs var', en: 'val vs var' },
          code: `val nom = "Ada"      // lecture seule (référence immuable)
var compteur = 0     // réassignable
compteur++           // OK
// nom = "Alan"      // erreur de compilation !`,
          note: {
            fr: `Préférez val par défaut : moins d'états mutables = moins de bugs. val fige la référence, pas forcément le contenu (une MutableList reste modifiable).`,
            en: `Prefer val by default: less mutable state = fewer bugs. val freezes the reference, not necessarily the content (a MutableList stays modifiable).`,
          },
        },
        {
          id: 'kotlin-elvis',
          title: { fr: 'Null-safety : ?. ?: !!', en: 'Null safety: ?. ?: !!' },
          code: `val len = name?.length ?: 0  // défaut si null
val sûr = name?.uppercase()  // null se propage
val boom = name!!.length     // crash si null !`,
          note: {
            fr: `?. propage null, ?: fournit un défaut, !! crashe (NullPointerException) — à éviter.`,
            en: `?. propagates null, ?: provides a default, !! crashes (NullPointerException) — avoid it.`,
          },
        },
        {
          id: 'kotlin-lateinit-lazy',
          title: { fr: 'lateinit vs by lazy', en: 'lateinit vs by lazy' },
          code: `lateinit var repo: Repo          // var non-null, initialisée plus tard
// repo.load() avant init → UninitializedPropertyAccessException

val client by lazy {             // val, calculé au 1er accès
    HttpClient()                 // une seule fois, thread-safe par défaut
}`,
          note: {
            fr: `lateinit pour l'injection (var, types non primitifs) ; by lazy pour une val coûteuse calculée à la demande. Vérifiez avec ::repo.isInitialized si besoin.`,
            en: `lateinit for injection (var, non-primitive types); by lazy for an expensive val computed on demand. Check with ::repo.isInitialized if needed.`,
          },
        },
        {
          id: 'kotlin-equality',
          title: { fr: '== vs === (structurel vs référence)', en: '== vs === (structural vs reference)' },
          code: `val a = "abc"
val b = StringBuilder("abc").toString()
a == b    // true  : égalité structurelle (appelle equals)
a === b   // false : référence — objets distincts en mémoire`,
          note: {
            fr: `== appelle equals() (et gère null) : c'est presque toujours ce que vous voulez. === compare l'identité mémoire — rare, surtout pour du debug ou des singletons.`,
            en: `== calls equals() (and handles null): it's almost always what you want. === compares memory identity — rare, mostly for debugging or singletons.`,
          },
        },
        {
          id: 'kotlin-string-templates',
          title: { fr: 'String templates', en: 'String templates' },
          code: `val nom = "Ada"
println("Bonjour \${nom} !")          // interpolation
println("Taille : \${nom.length}")    // expression entre accolades
println("""Multi-ligne
sans échappement : C:\\dossier""".trimIndent())`,
          note: {
            fr: `$variable suffit pour un nom simple, \${expression} pour le reste. Les raw strings """...""" ignorent les échappements — pratiques pour JSON ou regex.`,
            en: `$variable is enough for a simple name, \${expression} for anything else. Raw strings """...""" ignore escapes — handy for JSON or regex.`,
          },
        },
        {
          id: 'kotlin-when',
          title: { fr: 'when (expression)', en: 'when (expression)' },
          code: `val label = when (code) {
    200, 201 -> "OK"             // plusieurs valeurs
    in 400..499 -> "Erreur client"
    is Int -> "Autre code \${code}"
    else -> "Inconnu"            // requis si when est une expression
}`,
          note: {
            fr: `when est une expression : elle retourne une valeur, donc le else est obligatoire sauf si le compilateur prouve l'exhaustivité (enum, sealed). Remplace avantageusement les chaînes de if/else.`,
            en: `when is an expression: it returns a value, so else is required unless the compiler proves exhaustiveness (enum, sealed). A great replacement for if/else chains.`,
          },
        },
      ],
    },
    {
      id: 'collections',
      title: { fr: 'Collections', en: 'Collections' },
      items: [
        {
          id: 'kotlin-listof',
          title: { fr: 'listOf / mutableListOf / mapOf', en: 'listOf / mutableListOf / mapOf' },
          code: `val ro = listOf(1, 2, 3)               // lecture seule
val rw = mutableListOf(1, 2, 3)        // modifiable
rw += 4                                // add
val ages = mapOf("Ada" to 36, "Alan" to 41)
val âge = ages["Ada"]                  // Int? — null si absent`,
          note: {
            fr: `Par défaut les fabriques retournent des interfaces en lecture seule — exposez List, gardez MutableList en interne. L'accès map[clé] retourne un nullable.`,
            en: `Factory functions return read-only interfaces by default — expose List, keep MutableList internal. map[key] access returns a nullable.`,
          },
        },
        {
          id: 'kotlin-map-filter',
          title: { fr: 'map / filter / first / firstOrNull', en: 'map / filter / first / firstOrNull' },
          code: `val noms = users.filter { it.actif }    // garde les actifs
                .map { it.nom }         // transforme
val premier = noms.first()              // crash si vide !
val sûr = noms.firstOrNull()            // String? — null si vide`,
          note: {
            fr: `first() lance NoSuchElementException sur une liste vide — préférez firstOrNull() avec ?: pour un défaut. La plupart des opérateurs ont une variante *OrNull.`,
            en: `first() throws NoSuchElementException on an empty list — prefer firstOrNull() with ?: for a default. Most operators have an *OrNull variant.`,
          },
        },
        {
          id: 'kotlin-groupby',
          title: { fr: 'groupBy / associateBy', en: 'groupBy / associateBy' },
          code: `// groupBy : 1 clé → liste de valeurs
val parVille = users.groupBy { it.ville }   // Map<String, List<User>>

// associateBy : 1 clé → 1 valeur (la dernière gagne)
val parId = users.associateBy { it.id }     // Map<Int, User>`,
          note: {
            fr: `groupBy quand plusieurs éléments partagent une clé, associateBy quand la clé est unique (id). Attention : associateBy écrase silencieusement les doublons.`,
            en: `groupBy when several elements share a key, associateBy when the key is unique (id). Beware: associateBy silently overwrites duplicates.`,
          },
        },
        {
          id: 'kotlin-sequences',
          title: { fr: 'Sequences (paresse)', en: 'Sequences (laziness)' },
          code: `val résultat = liste.asSequence()       // évaluation paresseuse
    .map { it * 2 }                     // pas de liste intermédiaire
    .filter { it > 10 }
    .take(5)
    .toList()                           // opération terminale déclenche tout`,
          note: {
            fr: `Chaque opérateur de List crée une liste intermédiaire ; une Sequence traite élément par élément. Rentable sur les grosses collections ou avec take/first qui court-circuitent.`,
            en: `Each List operator creates an intermediate list; a Sequence processes element by element. Worth it on large collections or with take/first which short-circuit.`,
          },
        },
        {
          id: 'kotlin-destructuring',
          title: { fr: 'Destructuration (Pair, data class)', en: 'Destructuring (Pair, data class)' },
          code: `val (x, y) = Pair(10, 20)              // componentN() générés
val (nom, âge) = User("Ada", 36)       // data class : ordre de déclaration !
for ((clé, valeur) in ages) {          // Map.Entry
    println("\${clé} → \${valeur}")
}`,
          note: {
            fr: `La destructuration suit l'ordre des propriétés du constructeur, pas les noms — réordonner une data class casse silencieusement les call-sites. Utilisez _ pour ignorer une composante.`,
            en: `Destructuring follows constructor property order, not names — reordering a data class silently breaks call sites. Use _ to skip a component.`,
          },
        },
      ],
    },
    {
      id: 'classes',
      title: { fr: 'Classes', en: 'Classes' },
      items: [
        {
          id: 'kotlin-data-class',
          title: { fr: 'data class (copy / equals)', en: 'data class (copy / equals)' },
          code: `data class User(val nom: String, val âge: Int)

val ada = User("Ada", 36)
val plusVieille = ada.copy(âge = 37)   // copie immuable modifiée
ada == User("Ada", 36)                 // true : equals généré
println(ada)                           // User(nom=Ada, âge=36)`,
          note: {
            fr: `equals/hashCode/toString/copy générés à partir des propriétés du constructeur principal uniquement. copy + val = mises à jour immuables, parfait pour l'état UI.`,
            en: `equals/hashCode/toString/copy are generated from primary constructor properties only. copy + val = immutable updates, perfect for UI state.`,
          },
        },
        {
          id: 'kotlin-sealed',
          title: { fr: 'sealed class + when exhaustif', en: 'sealed class + exhaustive when' },
          code: `sealed interface UiState {
    data object Loading : UiState
    data class Success(val data: List<String>) : UiState
    data class Error(val message: String) : UiState
}
val texte = when (state) {             // exhaustif : pas de else requis
    is UiState.Loading -> "Chargement…"
    is UiState.Success -> state.data.joinToString()  // smart cast
    is UiState.Error -> state.message
}`,
          note: {
            fr: `Hiérarchie fermée connue à la compilation : le when est exhaustif sans else, et ajouter un cas force la mise à jour de tous les when. Le pattern de référence pour les états UI. Depuis Kotlin 1.9, préférez data object à object pour un cas sans donnée : toString/equals corrects, précieux en test.`,
            en: `Closed hierarchy known at compile time: when is exhaustive without else, and adding a case forces updating every when. The go-to pattern for UI states. Since Kotlin 1.9, prefer data object over object for a dataless case: correct toString/equals, valuable in tests.`,
          },
        },
        {
          id: 'kotlin-object-companion',
          title: { fr: 'object / companion object', en: 'object / companion object' },
          code: `object Analytics {                     // singleton thread-safe
    fun log(event: String) { /* … */ }
}
class User private constructor(val nom: String) {
    companion object {                 // "statiques" + accès au constructeur privé
        const val MAX = 50
        fun create(nom: String) = User(nom.trim())
    }
}
User.create("Ada")                     // appel sans instance`,
          note: {
            fr: `object déclare un singleton paresseux ; companion object héberge les membres "statiques" et les factory methods (il peut accéder au constructeur privé). const val pour les constantes de compilation.`,
            en: `object declares a lazy singleton; companion object hosts "static" members and factory methods (it can access the private constructor). const val for compile-time constants.`,
          },
        },
        {
          id: 'kotlin-constructors',
          title: { fr: 'Constructeurs (val dans la signature)', en: 'Constructors (val in the signature)' },
          code: `class Repo(
    private val api: Api,              // val = propriété déclarée + assignée
    private val cache: Cache = MemCache(),  // valeur par défaut
) {
    init {                             // bloc d'initialisation si logique nécessaire
        require(api.estPrête) { "API non prête" }
    }
}`,
          note: {
            fr: `val/var dans le constructeur principal déclare et initialise la propriété en une ligne. Les valeurs par défaut + arguments nommés remplacent la plupart des surcharges et builders.`,
            en: `val/var in the primary constructor declares and initializes the property in one line. Default values + named arguments replace most overloads and builders.`,
          },
        },
        {
          id: 'kotlin-extensions',
          title: { fr: 'Extension functions', en: 'Extension functions' },
          code: `fun String.tronquer(max: Int): String =
    if (length <= max) this else take(max - 1) + "…"

"Bonjour le monde".tronquer(10)        // "Bonjour l…"

val Int.dp: Float                      // extension property
    get() = this * densité`,
          note: {
            fr: `Ajoute des méthodes à des types existants sans en hériter — résolu statiquement (pas de vrai polymorphisme). N'a pas accès aux membres privés du type étendu.`,
            en: `Adds methods to existing types without inheriting — resolved statically (no real polymorphism). Has no access to the extended type's private members.`,
          },
        },
      ],
    },
    {
      id: 'scope',
      title: { fr: 'Scope functions', en: 'Scope functions' },
      items: [
        {
          id: 'kotlin-scope-overview',
          title: { fr: 'let / run / apply / also / with — la carte', en: 'let / run / apply / also / with — the map' },
          code: `// Récepteur  | Retourne      | Usage typique
// let   : it  | résultat λ    | transformer, null-check
// run   : this| résultat λ    | calcul avec config
// apply : this| l'objet       | configuration d'objet
// also  : it  | l'objet       | effet de bord (log)
// with  : this| résultat λ    | grouper des appels (pas une extension)`,
          note: {
            fr: `Deux axes : le récepteur (it ou this) et la valeur de retour (l'objet ou le résultat de la lambda). Choisissez selon ce que vous voulez récupérer, pas par habitude.`,
            en: `Two axes: the receiver (it or this) and the return value (the object or the lambda result). Pick based on what you want back, not out of habit.`,
          },
        },
        {
          id: 'kotlin-let',
          title: { fr: 'let : transformer + null-check', en: 'let: transform + null check' },
          code: `val longueur = nom?.let {              // exécuté seulement si non-null
    println("Traitement de \${it}")
    it.length                          // dernière expression = retour
} ?: 0                                 // défaut si nom était null`,
          note: {
            fr: `?.let { } est l'idiome pour "fais ça seulement si non-null" avec un smart cast garanti dans le bloc. Retourne le résultat de la lambda, combinable avec ?:.`,
            en: `?.let { } is the idiom for "do this only if non-null" with a guaranteed smart cast inside the block. Returns the lambda result, combines with ?:.`,
          },
        },
        {
          id: 'kotlin-apply-also',
          title: { fr: 'apply / also : configurer, retourner l\'objet', en: 'apply / also: configure, return the object' },
          code: `val intent = Intent(ctx, Detail::class.java).apply {
    putExtra("id", 42)                 // this implicite = l'intent
    flags = Intent.FLAG_ACTIVITY_NEW_TASK
}
val user = créerUser()
    .also { Log.d("TAG", "créé : \${it}") }  // effet de bord, chaîne intacte`,
          note: {
            fr: `Les deux retournent l'objet : apply (this) pour le configurer, also (it) pour un effet de bord au milieu d'une chaîne sans la casser.`,
            en: `Both return the object: apply (this) to configure it, also (it) for a side effect in the middle of a chain without breaking it.`,
          },
        },
        {
          id: 'kotlin-run-with',
          title: { fr: 'run / with : calculer un résultat', en: 'run / with: compute a result' },
          code: `val message = config.run {             // this = config, retourne la λ
    "Serveur \${hôte}:\${port}"
}
val aire = with(rectangle) {           // with(objet) { … } — pas une extension
    largeur * hauteur
}`,
          note: {
            fr: `run et with exposent this et retournent le résultat de la lambda — pour dériver une valeur d'un objet. with se lit bien quand l'objet n'est jamais null.`,
            en: `run and with expose this and return the lambda result — for deriving a value from an object. with reads well when the object is never null.`,
          },
        },
        {
          id: 'kotlin-takeif',
          title: { fr: 'takeIf / takeUnless', en: 'takeIf / takeUnless' },
          code: `val port = saisie.toIntOrNull()
    ?.takeIf { it in 1..65535 }        // null si le prédicat échoue
    ?: 8080                            // défaut

val nom = brut.takeUnless { it.isBlank() } ?: "anonyme"`,
          note: {
            fr: `takeIf retourne l'objet si le prédicat est vrai, sinon null — transforme une validation en chaîne nullable élégante avec ?:. takeUnless est l'inverse.`,
            en: `takeIf returns the object if the predicate is true, otherwise null — turns validation into an elegant nullable chain with ?:. takeUnless is the inverse.`,
          },
        },
      ],
    },
    {
      id: 'coroutines',
      title: { fr: 'Coroutines', en: 'Coroutines' },
      items: [
        {
          id: 'kotlin-launch-async',
          title: { fr: 'launch vs async/await', en: 'launch vs async/await' },
          code: `scope.launch {                         // fire-and-forget, retourne Job
    enregistrer(données)
}
val a = scope.async { chargerA() }     // retourne Deferred<T>
val b = scope.async { chargerB() }     // les deux partent en parallèle
val total = a.await() + b.await()      // attend les résultats`,
          note: {
            fr: `launch quand on n'attend pas de résultat, async/await pour en récupérer un — surtout pour paralléliser plusieurs appels. Dans un scope structuré classique (viewModelScope...), une exception dans async se propage immédiatement même sans await ; elle n'est vraiment "avalée" que sous un SupervisorJob ou un async racine (GlobalScope) jamais awaité.`,
            en: `launch when no result is expected, async/await to get one — mainly to parallelize several calls. In a regular structured scope (viewModelScope...), an exception inside async propagates immediately even without await; it is only truly "swallowed" under a SupervisorJob or a never-awaited root async (GlobalScope).`,
          },
        },
        {
          id: 'kotlin-dispatchers',
          title: { fr: 'withContext + Dispatchers', en: 'withContext + Dispatchers' },
          code: `suspend fun charger(): User = withContext(Dispatchers.IO) {
    api.fetchUser()                    // réseau/disque → IO
}
// Dispatchers.Main    : UI (Android)
// Dispatchers.IO      : réseau, fichiers, base de données
// Dispatchers.Default : calcul CPU (tri, parsing lourd)`,
          note: {
            fr: `withContext bascule de thread puis revient — c'est l'outil pour rendre une fonction suspend "main-safe". Room et Retrofit basculent déjà sur IO eux-mêmes : pas besoin de doubler.`,
            en: `withContext switches threads then comes back — the tool to make a suspend function "main-safe". Room and Retrofit already switch to IO themselves: no need to double up.`,
          },
        },
        {
          id: 'kotlin-scopes',
          title: { fr: 'viewModelScope / lifecycleScope', en: 'viewModelScope / lifecycleScope' },
          code: `class MonViewModel : ViewModel() {
    fun rafraîchir() = viewModelScope.launch {   // annulé à onCleared()
        état.value = repo.charger()
    }
}
// Dans une Activity/Fragment :
lifecycleScope.launch {                          // annulé à onDestroy()
    repeatOnLifecycle(Lifecycle.State.STARTED) { /* collecte de flows */ }
}`,
          note: {
            fr: `Utilisez les scopes liés au cycle de vie plutôt que GlobalScope : l'annulation automatique évite fuites et crashs après destruction. La logique métier vit dans viewModelScope.`,
            en: `Use lifecycle-bound scopes instead of GlobalScope: automatic cancellation prevents leaks and crashes after destruction. Business logic lives in viewModelScope.`,
          },
        },
        {
          id: 'kotlin-suspend',
          title: { fr: 'Fonctions suspend', en: 'suspend functions' },
          code: `suspend fun chargerProfil(id: Int): Profil {
    val user = api.user(id)            // appelle d'autres suspend, séquentiel
    val posts = api.posts(id)          // lisible comme du code synchrone
    return Profil(user, posts)
}
// Appelable uniquement depuis une coroutine ou une autre suspend`,
          note: {
            fr: `suspend marque une fonction qui peut se mettre en pause sans bloquer le thread. Le code reste séquentiel et lisible — le compilateur gère la machinerie (continuations).`,
            en: `suspend marks a function that can pause without blocking the thread. Code stays sequential and readable — the compiler handles the machinery (continuations).`,
          },
        },
        {
          id: 'kotlin-cancellation',
          title: { fr: 'Annulation coopérative', en: 'Cooperative cancellation' },
          code: `val job = scope.launch {
    while (isActive) {                 // vérifie l'annulation
        traiterBloc()
        yield()                        // point de suspension = point d'annulation
    }
}
job.cancel()                           // lance CancellationException au prochain point
// Piège : catch (e: Exception) avale CancellationException → relancez-la !`,
          note: {
            fr: `L'annulation est coopérative : elle n'agit qu'aux points de suspension ou via isActive. Ne jamais avaler CancellationException dans un catch générique, sinon la coroutine devient inarrêtable.`,
            en: `Cancellation is cooperative: it only acts at suspension points or via isActive. Never swallow CancellationException in a generic catch, or the coroutine becomes unstoppable.`,
          },
        },
      ],
    },
    {
      id: 'compose',
      title: { fr: 'Jetpack Compose', en: 'Jetpack Compose' },
      items: [
        {
          id: 'kotlin-remember-state',
          title: { fr: 'remember + mutableStateOf', en: 'remember + mutableStateOf' },
          code: `@Composable
fun Compteur() {
    var n by remember { mutableStateOf(0) }   // survit aux recompositions
    // var n by mutableStateOf(0)  ← PIÈGE : réinitialisé à chaque recomposition !
    Button(onClick = { n++ }) {
        Text("Cliqué \${n} fois")
    }
}`,
          note: {
            fr: `mutableStateOf rend la valeur observable (déclenche la recomposition), remember la fait survivre entre recompositions. Sans remember, l'état repart de zéro à chaque frame.`,
            en: `mutableStateOf makes the value observable (triggers recomposition), remember makes it survive between recompositions. Without remember, state resets on every frame.`,
          },
        },
        {
          id: 'kotlin-remembersaveable',
          title: { fr: 'rememberSaveable (rotation)', en: 'rememberSaveable (rotation)' },
          code: `var recherche by rememberSaveable { mutableStateOf("") }
// Survit à la rotation et au process death (via Bundle)

// Types custom : fournir un Saver
var user by rememberSaveable(stateSaver = UserSaver) {
    mutableStateOf(User.vide)
}`,
          note: {
            fr: `remember ne survit pas au changement de configuration (rotation) — rememberSaveable si, via le Bundle. Limité aux types sérialisables ; au-delà, fournissez un Saver ou remontez l'état au ViewModel.`,
            en: `remember does not survive configuration changes (rotation) — rememberSaveable does, via the Bundle. Limited to serializable types; beyond that, provide a Saver or hoist state to the ViewModel.`,
          },
        },
        {
          id: 'kotlin-launchedeffect',
          title: { fr: 'LaunchedEffect / DisposableEffect', en: 'LaunchedEffect / DisposableEffect' },
          code: `LaunchedEffect(userId) {               // coroutine relancée si userId change
    profil = repo.charger(userId)
}
DisposableEffect(lifecycleOwner) {     // effet avec nettoyage
    val obs = LifecycleEventObserver { _, e -> /* … */ }
    lifecycleOwner.lifecycle.addObserver(obs)
    onDispose { lifecycleOwner.lifecycle.removeObserver(obs) }
}`,
          note: {
            fr: `LaunchedEffect lance une coroutine annulée/relancée quand ses clés changent — pour les suspend. DisposableEffect pour les abonnements qui exigent un nettoyage dans onDispose.`,
            en: `LaunchedEffect starts a coroutine cancelled/restarted when its keys change — for suspend calls. DisposableEffect for subscriptions that require cleanup in onDispose.`,
          },
        },
        {
          id: 'kotlin-derivedstateof',
          title: { fr: 'derivedStateOf', en: 'derivedStateOf' },
          code: `val listState = rememberLazyListState()
val montrerBouton by remember {
    derivedStateOf {                   // recompose seulement quand le booléen change
        listState.firstVisibleItemIndex > 0
    }
}
if (montrerBouton) { BoutonRetourHaut() }`,
          note: {
            fr: `derivedStateOf ne notifie que quand le résultat calculé change, pas à chaque variation des entrées — ici l'index change à chaque pixel scrollé, mais le booléen rarement. Toujours l'envelopper dans remember.`,
            en: `derivedStateOf only notifies when the computed result changes, not on every input variation — here the index changes every scrolled pixel, but the boolean rarely. Always wrap it in remember.`,
          },
        },
        {
          id: 'kotlin-state-hoisting',
          title: { fr: 'Hoisting d\'état (state up, events down)', en: 'State hoisting (state up, events down)' },
          code: `@Composable                            // stateless : réutilisable, testable
fun Recherche(valeur: String, onChange: (String) -> Unit) {
    TextField(value = valeur, onValueChange = onChange)
}
@Composable                            // stateful : possède l'état
fun RechercheEcran(vm: RechercheVM = viewModel()) {
    val q by vm.requête.collectAsStateWithLifecycle()
    Recherche(valeur = q, onChange = vm::onRequête)
}`,
          note: {
            fr: `L'état descend en paramètres, les événements remontent en lambdas : le composable enfant devient stateless, donc prévisualisable et testable. Remontez l'état jusqu'au plus bas ancêtre commun qui en a besoin.`,
            en: `State flows down as parameters, events flow up as lambdas: the child composable becomes stateless, hence previewable and testable. Hoist state to the lowest common ancestor that needs it.`,
          },
        },
        {
          id: 'kotlin-modifier-order',
          title: { fr: 'Modifier (ordre significatif)', en: 'Modifier (order matters)' },
          code: `// padding AVANT background : marge transparente autour du fond
Box(Modifier.padding(16.dp).background(Color.Red))
// background AVANT padding : le fond inclut le padding
Box(Modifier.background(Color.Red).padding(16.dp))
// clickable avant padding → la zone cliquable inclut le padding`,
          note: {
            fr: `Les modifiers s'appliquent en séquence, chacun enveloppant le suivant — l'ordre change le rendu ET les zones tactiles. En cas de doute, lisez la chaîne de l'extérieur vers l'intérieur.`,
            en: `Modifiers apply in sequence, each wrapping the next — order changes rendering AND touch targets. When in doubt, read the chain from outside in.`,
          },
        },
      ],
    },
    {
      id: 'flow',
      title: { fr: 'Flow', en: 'Flow' },
      items: [
        {
          id: 'kotlin-flow-cold',
          title: { fr: 'flow {} — flux froid', en: 'flow {} — cold flow' },
          code: `fun ticker(): Flow<Int> = flow {       // froid : ne fait rien sans collecteur
    var i = 0
    while (true) {
        emit(i++)                      // emit est suspend
        delay(1_000)
    }
}
ticker().collect { println(it) }       // chaque collect relance le bloc`,
          note: {
            fr: `Un flow froid exécute son bloc à chaque collect, indépendamment pour chaque collecteur — comme une recette, pas un plat. Idéal pour encapsuler une source de données à la demande.`,
            en: `A cold flow runs its block on every collect, independently per collector — like a recipe, not a dish. Ideal for wrapping an on-demand data source.`,
          },
        },
        {
          id: 'kotlin-stateflow-sharedflow',
          title: { fr: 'StateFlow / SharedFlow', en: 'StateFlow / SharedFlow' },
          code: `// StateFlow : état — toujours une valeur, rejoue la dernière
private val _ui = MutableStateFlow<UiState>(UiState.Loading)
val ui: StateFlow<UiState> = _ui.asStateFlow()
_ui.update { it.copy(chargé = true) } // mise à jour atomique

// SharedFlow : événements — pas de valeur initiale, pas de conflation
private val _effets = MutableSharedFlow<Effet>()
suspend fun naviguer() = _effets.emit(Effet.VersDetail)`,
          note: {
            fr: `StateFlow pour l'état (valeur courante, doublons ignorés par equals), SharedFlow pour les événements one-shot (navigation, snackbar) qu'on ne veut pas rejouer. Exposez la version immuable via asStateFlow.`,
            en: `StateFlow for state (current value, duplicates skipped via equals), SharedFlow for one-shot events (navigation, snackbar) you don't want replayed. Expose the immutable version via asStateFlow.`,
          },
        },
        {
          id: 'kotlin-collectasstate',
          title: { fr: 'collectAsStateWithLifecycle', en: 'collectAsStateWithLifecycle' },
          code: `@Composable
fun Ecran(vm: MonViewModel = viewModel()) {
    val état by vm.ui.collectAsStateWithLifecycle()
    // collecte stoppée sous STARTED (app en arrière-plan)
    when (état) { /* … */ }
}
// dépendance : androidx.lifecycle:lifecycle-runtime-compose`,
          note: {
            fr: `Contrairement à collectAsState, la collecte s'arrête quand l'app passe en arrière-plan — économise batterie et travail inutile. C'est la collecte recommandée sur Android.`,
            en: `Unlike collectAsState, collection stops when the app goes to the background — saves battery and wasted work. It's the recommended collection on Android.`,
          },
        },
        {
          id: 'kotlin-statein',
          title: { fr: 'stateIn — flow froid → StateFlow', en: 'stateIn — cold flow → StateFlow' },
          code: `val users: StateFlow<List<User>> = repo.observerUsers()  // flow froid
    .map { it.sortedBy(User::nom) }
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),  // survit à la rotation
        initialValue = emptyList(),
    )`,
          note: {
            fr: `stateIn partage un flow froid entre collecteurs et garde la dernière valeur. WhileSubscribed(5000) stoppe l'upstream 5 s après le dernier abonné — la rotation ne relance donc pas le travail.`,
            en: `stateIn shares a cold flow between collectors and keeps the latest value. WhileSubscribed(5000) stops the upstream 5 s after the last subscriber — so rotation doesn't restart the work.`,
          },
        },
        {
          id: 'kotlin-flow-operators',
          title: { fr: 'Opérateurs : map / filter / debounce / combine', en: 'Operators: map / filter / debounce / combine' },
          code: `val résultats = requête
    .debounce(300)                     // attend une pause de frappe
    .filter { it.length >= 2 }
    .distinctUntilChanged()            // ignore les répétitions
    .flatMapLatest { repo.chercher(it) }  // annule la recherche précédente

val ui = combine(users, filtre) { u, f ->  // recombine à chaque émission
    u.filter { it.ville == f }
}`,
          note: {
            fr: `debounce + distinctUntilChanged + flatMapLatest est le trio classique de la barre de recherche. combine fusionne plusieurs flows et réémet dès que l'un d'eux change.`,
            en: `debounce + distinctUntilChanged + flatMapLatest is the classic search-bar trio. combine merges several flows and re-emits whenever any of them changes.`,
          },
        },
      ],
    },
    {
      id: 'kotlin-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'kotlin-bp-visibility',
          title: { fr: 'Visibilité restreinte par défaut', en: 'Restrict visibility by default' },
          code: `class UserRepository internal constructor(
    private val api: Api,
)`,
          note: {
            fr: `Kotlin est public par défaut : déclarez private/internal explicitement pour limiter la surface d'API d'un module et éviter les couplages non voulus.`,
            en: `Kotlin defaults to public: declare private/internal explicitly to limit a module's API surface and avoid unwanted coupling.`,
          },
        },
        {
          id: 'kotlin-bp-di',
          title: { fr: 'Injection de dépendances plutôt que singleton', en: 'Dependency injection over singletons' },
          code: `class UserRepository @Inject constructor(private val api: Api)`,
          note: {
            fr: `Un object singleton fige une dépendance globale difficile à mocker ; l'injection (Hilt/Koin) permet de substituer une implémentation de test.`,
            en: `A singleton object hardcodes a global dependency that's hard to mock; DI (Hilt/Koin) lets you swap in a test implementation.`,
          },
        },
        {
          id: 'kotlin-bp-exception-handler',
          title: { fr: 'CoroutineExceptionHandler pour les exceptions non gérées', en: 'CoroutineExceptionHandler for uncaught exceptions' },
          code: `val handler = CoroutineExceptionHandler { _, e -> Log.e("TAG", "crash", e) }
scope.launch(handler) { risky() }`,
          note: {
            fr: `Un try/catch autour de launch ne rattrape rien (le bloc s'exécute plus tard) : le handler capte les exceptions non gérées au niveau du scope pour logger sans crasher.`,
            en: `A try/catch around launch catches nothing (the block runs later): the handler captures uncaught exceptions at the scope level to log without crashing.`,
          },
        },
        {
          id: 'kotlin-bp-not-null-assertion',
          title: { fr: 'Éviter !! hors tests', en: 'Avoid !! outside tests' },
          code: `val id = requireNotNull(user.id) { "user.id ne doit pas être null ici" }`,
          note: {
            fr: `!! lance une NPE sans message utile ; requireNotNull permet un message explicite qui accélère le diagnostic en prod.`,
            en: `!! throws an NPE with no useful message; requireNotNull lets you add an explicit message that speeds up production diagnosis.`,
          },
        },
        {
          id: 'kotlin-bp-immutable-state',
          title: { fr: 'État UI immuable exposé en lecture seule', en: 'Immutable UI state exposed read-only' },
          code: `private val _state = MutableStateFlow(UiState())
val state: StateFlow<UiState> = _state.asStateFlow()`,
          note: {
            fr: `N'exposez jamais un Mutable*Flow ou une MutableList à l'extérieur : le consommateur pourrait muter l'état en dehors du flux de données prévu.`,
            en: `Never expose a Mutable*Flow or a MutableList externally: the consumer could mutate state outside the intended data flow.`,
          },
        },
      ],
    },
  ],
};
