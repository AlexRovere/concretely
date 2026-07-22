import { comparisonFor } from '../swiftcompare.js';

/**
 * Cheatsheet Swift / SwiftUI — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
const compareSection = (cmpId, secId, titleFr, titleEn) => ({
  id: secId,
  title: { fr: titleFr, en: titleEn },
  items: comparisonFor(cmpId).candidates.map((c) => ({
    id: `cs-swift-${cmpId}-${c.id}`,
    title: { fr: c.label, en: c.label },
    code: c.code,
    note: c.when,
  })),
});

export default {
  id: 'swift',
  lang: 'swift',
  sections: [
    {
      id: 'optionals',
      title: { fr: 'Optionnels', en: 'Optionals' },
      items: [
        {
          id: 'swift-optional-basics',
          title: { fr: '? et ! — déclarer un optionnel', en: '? and ! — declaring an optional' },
          code: `var name: String? = "Ada"   // peut contenir une valeur ou nil
name = nil                  // OK : String? accepte nil
var id: Int! = 42           // déballé implicitement (dangereux)
let n: Int = id             // crash si id est nil`,
          note: {
            fr: `T? force le compilateur à vérifier l'absence de valeur. T! (implicitly unwrapped) saute ce filet : réservez-le aux IBOutlets et aux valeurs garanties après init.`,
            en: `T? makes the compiler enforce nil checks. T! (implicitly unwrapped) skips that safety net: keep it for IBOutlets and values guaranteed after init.`,
          },
        },
        {
          id: 'swift-if-let',
          title: { fr: 'if let — déballage local (sucre 5.7)', en: 'if let — local unwrap (5.7 sugar)' },
          code: `let input: String? = "42"
if let input {                    // sucre Swift 5.7 : pas de "= input"
  print("Longueur : \\(input.count)") // input est String ici
}
// hors du bloc, input redevient String?`,
          note: {
            fr: `Depuis Swift 5.7, \`if let x\` remplace \`if let x = x\`. La valeur déballée n'existe que DANS le bloc — pour le reste de la fonction, préférez guard let.`,
            en: `Since Swift 5.7, \`if let x\` replaces \`if let x = x\`. The unwrapped value only exists INSIDE the block — for the rest of the function, prefer guard let.`,
          },
        },
        {
          id: 'swift-guard',
          title: { fr: 'guard let — sortie anticipée', en: 'guard let — early exit' },
          code: `func greet(_ name: String?) {
  guard let name else { return } // déballe ou sort
  print("Salut \\(name)")        // name est String pour toute la suite
}`,
          note: {
            fr: `guard déballe pour TOUT le reste de la portée ; if let seulement dans son bloc. Le else doit quitter (return, throw, continue, break).`,
            en: `guard unwraps for the WHOLE remaining scope; if let only inside its block. The else branch must exit (return, throw, continue, break).`,
          },
        },
        {
          id: 'swift-nil-coalescing',
          title: { fr: '?? — valeur par défaut', en: '?? — default value' },
          code: `let saved: String? = nil
let theme = saved ?? "light"   // "light" si saved est nil
// chaînable : premier non-nil gagne
let port = envPort ?? configPort ?? 8080`,
          note: {
            fr: `?? est paresseux : la valeur de droite n'est évaluée que si la gauche est nil. Idéal pour les réglages avec fallback.`,
            en: `?? is lazy: the right-hand side is only evaluated when the left is nil. Ideal for settings with a fallback.`,
          },
        },
        {
          id: 'swift-optional-chaining',
          title: { fr: 'Chaînage optionnel — a?.b?.c', en: 'Optional chaining — a?.b?.c' },
          code: `let city = user?.address?.city   // String? : nil si un maillon est nil
user?.logout()                   // appel ignoré si user est nil
if user?.address?.city == "Paris" { // comparaison OK avec un optionnel
  print("Parisien·ne")
}`,
          note: {
            fr: `Dès qu'un maillon est nil, toute la chaîne vaut nil — pas de crash. Le résultat est toujours optionnel, même si la dernière propriété ne l'est pas.`,
            en: `As soon as one link is nil, the whole chain evaluates to nil — no crash. The result is always optional, even if the final property is not.`,
          },
        },
        {
          id: 'swift-force-unwrap-trap',
          title: { fr: 'Piège : le force unwrap !', en: 'Gotcha: force unwrapping with !' },
          code: `let ageText = "abc"
let age = Int(ageText)!          // 💥 crash : Int("abc") est nil
// Alternatives sûres :
let safe = Int(ageText) ?? 0
guard let parsed = Int(ageText) else { return }`,
          note: {
            fr: `! crashe immédiatement sur nil ("Unexpectedly found nil"). À éviter en prod : préférez ??, if let ou guard let — gardez ! pour les cas prouvés impossibles.`,
            en: `! crashes immediately on nil ("Unexpectedly found nil"). Avoid it in production: prefer ??, if let or guard let — keep ! for provably impossible cases.`,
          },
        },
      ],
    },
    {
      id: 'collections',
      title: { fr: 'Collections', en: 'Collections' },
      items: [
        {
          id: 'swift-collections-basics',
          title: { fr: 'Array, Dictionary, Set — bases', en: 'Array, Dictionary, Set — basics' },
          code: `var fruits = ["pomme", "poire"]       // Array ordonné
fruits.append("kiwi")
var ages = ["Ada": 36, "Alan": 41]    // Dictionary clé → valeur
ages["Grace"] = 45                    // insertion ou mise à jour
let tags: Set = ["swift", "ios"]      // Set : unique, non ordonné
tags.contains("swift")                // O(1)`,
          note: {
            fr: `L'accès ages["clé"] renvoie un optionnel (nil si absente). Set garantit l'unicité et un contains en O(1) — contre O(n) pour Array.`,
            en: `Subscripting ages["key"] returns an optional (nil when missing). Set guarantees uniqueness and O(1) contains — versus O(n) for Array.`,
          },
        },
        {
          id: 'swift-map-filter-reduce',
          title: { fr: 'map / filter / reduce', en: 'map / filter / reduce' },
          code: `let nums = [1, 2, 3, 4]
let doubles = nums.map { $0 * 2 }        // [2, 4, 6, 8]
let evens = nums.filter { $0 % 2 == 0 }  // [2, 4]
let sum = nums.reduce(0, +)              // 10
let csv = nums.map(String.init).joined(separator: ",") // "1,2,3,4"`,
          note: {
            fr: `Transformations sans mutation : chaque appel renvoie une nouvelle collection. reduce(0, +) passe l'opérateur + directement comme fonction.`,
            en: `Mutation-free transformations: each call returns a new collection. reduce(0, +) passes the + operator directly as a function.`,
          },
        },
        {
          id: 'swift-compactmap',
          title: { fr: 'compactMap — filtre les nil', en: 'compactMap — drops nils' },
          code: `let raw = ["1", "deux", "3"]
let nums = raw.compactMap { Int($0) }  // [1, 3] — les nil disparaissent
// vs map : [Optional(1), nil, Optional(3)]
let mapped = raw.map { Int($0) }       // [Int?]`,
          note: {
            fr: `compactMap transforme PUIS retire les nil : parfait pour parser une liste sans crash. map garderait un tableau d'optionnels.`,
            en: `compactMap transforms THEN removes nils: perfect for parsing a list without crashing. map would keep an array of optionals.`,
          },
        },
        {
          id: 'swift-first-contains-where',
          title: { fr: 'first(where:) / contains(where:)', en: 'first(where:) / contains(where:)' },
          code: `struct User { let name: String; let admin: Bool }
let users = [User(name: "Ada", admin: true), User(name: "Alan", admin: false)]
let admin = users.first { $0.admin }        // User? — s'arrête au premier
let hasAdmin = users.contains { $0.admin }  // true
let idx = users.firstIndex { $0.name == "Alan" } // Int?`,
          note: {
            fr: `first(where:) s'arrête dès la première correspondance (court-circuit) et renvoie un optionnel. Plus expressif et plus rapide que filter {...}.first.`,
            en: `first(where:) stops at the first match (short-circuit) and returns an optional. More expressive and faster than filter {...}.first.`,
          },
        },
        {
          id: 'swift-sorted-by',
          title: { fr: 'Tri — sorted(by:)', en: 'Sorting — sorted(by:)' },
          code: `let scores = [3, 1, 2]
let asc = scores.sorted()              // [1, 2, 3] (Comparable)
let desc = scores.sorted(by: >)        // [3, 2, 1]
// tri par propriété :
let byName = users.sorted { $0.name < $1.name }`,
          note: {
            fr: `sorted renvoie un NOUVEAU tableau ; sort() trie en place (var requis). Pour les types Comparable, sorted(by: >) suffit pour l'ordre décroissant.`,
            en: `sorted returns a NEW array; sort() mutates in place (needs var). For Comparable types, sorted(by: >) is all you need for descending order.`,
          },
        },
        {
          id: 'swift-enumerated-zip',
          title: { fr: 'enumerated / zip', en: 'enumerated / zip' },
          code: `for (i, fruit) in fruits.enumerated() {
  print("\\(i) : \\(fruit)")          // 0 : pomme, 1 : poire…
}
let names = ["Ada", "Alan"]
let years = [1815, 1912]
for (name, year) in zip(names, years) {
  print("\\(name) — \\(year)")
}`,
          note: {
            fr: `enumerated donne un offset (0, 1, 2…) — pas forcément l'index réel sur un ArraySlice. zip s'arrête à la plus courte des deux séquences.`,
            en: `enumerated yields an offset (0, 1, 2…) — not necessarily the real index on an ArraySlice. zip stops at the shorter of the two sequences.`,
          },
        },
      ],
    },
    {
      id: 'types',
      title: { fr: 'Structs, classes & enums', en: 'Structs, classes & enums' },
      items: [
        {
          id: 'swift-struct-vs-class',
          title: { fr: 'struct vs class — valeur vs référence', en: 'struct vs class — value vs reference' },
          code: `struct Point { var x = 0 }       // type VALEUR : copié
class Counter { var n = 0 }      // type RÉFÉRENCE : partagé
var p1 = Point(); var p2 = p1
p2.x = 9                         // p1.x vaut toujours 0
let c1 = Counter(); let c2 = c1
c2.n = 9                         // c1.n vaut 9 (même instance !)`,
          note: {
            fr: `Une struct est copiée à l'affectation ; une class est partagée par référence. Par défaut en Swift : struct — réservez class à l'identité partagée (cache, contrôleur).`,
            en: `A struct is copied on assignment; a class is shared by reference. Swift default: struct — reserve class for shared identity (cache, controller).`,
          },
        },
        {
          id: 'swift-enum-associated',
          title: { fr: 'Enum à valeurs associées + switch exhaustif', en: 'Enum with associated values + exhaustive switch' },
          code: `enum LoadState {
  case idle
  case loading(progress: Double)
  case failed(Error)
}
switch state {                       // exhaustif : tous les cas requis
case .idle: print("Prêt")
case .loading(let p): print("\\(Int(p * 100)) %")
case .failed(let err): print(err)
}`,
          note: {
            fr: `Chaque cas peut embarquer des données différentes. Le switch doit couvrir TOUS les cas — le compilateur signale chaque oubli, idéal pour modéliser des états.`,
            en: `Each case can carry different data. The switch must cover ALL cases — the compiler flags anything missing, ideal for modeling states.`,
          },
        },
        {
          id: 'swift-protocols-extensions',
          title: { fr: 'Protocols + extensions', en: 'Protocols + extensions' },
          code: `protocol Describable {
  var summary: String { get }
}
extension Describable {              // implémentation par défaut
  var summary: String { "(sans description)" }
}
extension Int: Describable {         // rétrofit sur un type existant
  var summary: String { "Entier \\(self)" }
}`,
          note: {
            fr: `Les extensions de protocole fournissent des implémentations par défaut : c'est le cœur du "protocol-oriented programming". On peut étendre n'importe quel type, même ceux de la stdlib.`,
            en: `Protocol extensions provide default implementations: the heart of protocol-oriented programming. You can extend any type, even stdlib ones.`,
          },
        },
        {
          id: 'swift-computed-properties',
          title: { fr: 'Propriétés calculées', en: 'Computed properties' },
          code: `struct Circle {
  var radius: Double
  var area: Double {                 // recalculée à chaque accès
    .pi * radius * radius
  }
  var diameter: Double {
    get { radius * 2 }
    set { radius = newValue / 2 }    // setter optionnel
  }
}`,
          note: {
            fr: `Pas de stockage : la valeur est calculée à chaque lecture. Un getter seul peut omettre \`get\` ; le setter reçoit \`newValue\` implicitement.`,
            en: `No storage: the value is computed on every read. A getter-only property can omit \`get\`; the setter implicitly receives \`newValue\`.`,
          },
        },
        {
          id: 'swift-property-observers',
          title: { fr: 'willSet / didSet — observateurs', en: 'willSet / didSet — property observers' },
          code: `var score = 0 {
  willSet { print("Bientôt : \\(newValue)") }   // avant l'écriture
  didSet {                                      // après l'écriture
    if score > highScore { highScore = score }
    print("Avant : \\(oldValue), maintenant : \\(score)")
  }
}`,
          note: {
            fr: `Déclenchés à chaque écriture (sauf à l'initialisation). didSet est parfait pour synchroniser un état dérivé ; attention aux boucles si vous ré-assignez la même propriété.`,
            en: `Fired on every write (except during initialization). didSet is great for syncing derived state; beware of loops if you re-assign the same property.`,
          },
        },
      ],
    },
    {
      id: 'closures',
      title: { fr: "Closures & fonctions", en: 'Closures & functions' },
      items: [
        {
          id: 'swift-trailing-closure',
          title: { fr: 'Trailing closure', en: 'Trailing closure' },
          code: `// dernier paramètre closure → sort des parenthèses
let big = nums.filter { $0 > 10 }
// plusieurs trailing closures (Swift 5.3+) :
UIView.animate(withDuration: 0.3) {
  view.alpha = 0
} completion: { _ in
  view.removeFromSuperview()
}`,
          note: {
            fr: `Quand le dernier argument est une closure, on la sort des parenthèses — c'est la base de la syntaxe SwiftUI. La 2e trailing closure garde son étiquette (completion:).`,
            en: `When the last argument is a closure, it moves outside the parentheses — the foundation of SwiftUI syntax. The 2nd trailing closure keeps its label (completion:).`,
          },
        },
        {
          id: 'swift-capture-list',
          title: { fr: '[weak self] — liste de capture', en: '[weak self] — capture list' },
          code: `class Loader {
  var onDone: (() -> Void)?
  func start() {
    fetch { [weak self] data in     // évite le cycle de rétention
      guard let self else { return } // self redevient fort ici
      self.handle(data)
    }
  }
}`,
          note: {
            fr: `Une closure stockée qui capture self fortement crée un cycle de rétention (fuite mémoire). [weak self] casse le cycle ; guard let self re-déballe proprement.`,
            en: `A stored closure capturing self strongly creates a retain cycle (memory leak). [weak self] breaks the cycle; guard let self cleanly re-unwraps it.`,
          },
        },
        {
          id: 'swift-escaping',
          title: { fr: '@escaping — closure qui survit', en: '@escaping — closure that outlives the call' },
          code: `var pending: [() -> Void] = []
func defer_(_ work: @escaping () -> Void) {
  pending.append(work)             // stockée → doit être @escaping
}
func now(_ work: () -> Void) {
  work()                           // exécutée avant le retour : non-escaping
}`,
          note: {
            fr: `@escaping signale que la closure peut être appelée APRÈS le retour de la fonction (stockée, async). Dans une closure échappante, l'accès à self doit être explicite.`,
            en: `@escaping marks a closure that may run AFTER the function returns (stored, async). Inside an escaping closure, access to self must be explicit.`,
          },
        },
        {
          id: 'swift-argument-labels',
          title: { fr: "Étiquettes d'arguments", en: 'Argument labels' },
          code: `func move(from origin: String, to destination: String) {
  print("\\(origin) → \\(destination)")
}
move(from: "Paris", to: "Lyon")    // étiquette ≠ nom interne
func greet(_ name: String) { }     // _ : pas d'étiquette
greet("Ada")`,
          note: {
            fr: `L'étiquette externe (from) sert à l'appelant, le nom interne (origin) au corps de la fonction. _ supprime l'étiquette — les bonnes étiquettes rendent l'appel lisible comme une phrase.`,
            en: `The external label (from) serves the caller, the internal name (origin) serves the body. _ removes the label — good labels make calls read like sentences.`,
          },
        },
      ],
    },
    {
      id: 'concurrency',
      title: { fr: 'Concurrence', en: 'Concurrency' },
      items: [
        {
          id: 'swift-async-await',
          title: { fr: 'async/await + Task', en: 'async/await + Task' },
          code: `func fetchUser() async throws -> User {
  let (data, _) = try await URLSession.shared.data(from: url)
  return try JSONDecoder().decode(User.self, from: data)
}
// pont depuis un contexte synchrone :
Task {
  let user = try await fetchUser()
  print(user.name)
}`,
          note: {
            fr: `await marque un point de suspension : le thread est libéré pendant l'attente. Task { } crée un contexte async depuis du code synchrone (ex. un bouton).`,
            en: `await marks a suspension point: the thread is freed while waiting. Task { } creates an async context from synchronous code (e.g. a button handler).`,
          },
        },
        {
          id: 'swift-mainactor',
          title: { fr: '@MainActor — retour au thread principal', en: '@MainActor — back to the main thread' },
          code: `@MainActor
final class ProfileViewModel: ObservableObject {
  @Published var name = ""          // toujours muté sur le main thread
  func load() async {
    let user = try? await fetchUser() // le réseau quitte le main thread
    name = user?.name ?? ""           // ré-exécuté sur le MainActor
  }
}`,
          note: {
            fr: `L'UI (UIKit/SwiftUI) doit être mise à jour sur le thread principal. @MainActor le garantit à la compilation — fini les DispatchQueue.main.async oubliés.`,
            en: `UI (UIKit/SwiftUI) must be updated on the main thread. @MainActor guarantees it at compile time — no more forgotten DispatchQueue.main.async.`,
          },
        },
        {
          id: 'swift-async-let-taskgroup',
          title: { fr: 'async let / TaskGroup — parallélisme', en: 'async let / TaskGroup — parallelism' },
          code: `// nombre fixe de tâches : async let
async let avatar = fetchAvatar()
async let posts = fetchPosts()
let profile = try await (avatar, posts)  // les deux en parallèle
// nombre dynamique : TaskGroup
let images = try await withThrowingTaskGroup(of: UIImage.self) { group in
  for url in urls { group.addTask { try await download(url) } }
  return try await group.reduce(into: []) { $0.append($1) }
}`,
          note: {
            fr: `async let lance immédiatement et en parallèle — pour un nombre FIXE de tâches. TaskGroup gère un nombre dynamique avec annulation structurée automatique.`,
            en: `async let starts immediately and in parallel — for a FIXED number of tasks. TaskGroup handles a dynamic count with automatic structured cancellation.`,
          },
        },
        {
          id: 'swift-asyncsequence',
          title: { fr: 'AsyncSequence — for await', en: 'AsyncSequence — for await' },
          code: `// consommer un flux asynchrone valeur par valeur
for await line in url.lines {
  print(line)                       // suspend entre chaque ligne
}
// flux de notifications :
for await note in NotificationCenter.default
  .notifications(named: .didEnterBackground) {
  save()
}`,
          note: {
            fr: `for await consomme un flux au fil de l'eau, avec suspension entre les éléments. La boucle se termine quand la séquence finit ou que la Task est annulée.`,
            en: `for await consumes a stream as values arrive, suspending between elements. The loop ends when the sequence finishes or the Task is cancelled.`,
          },
        },
      ],
    },
    {
      id: 'swiftui',
      title: { fr: 'SwiftUI essentiel', en: 'SwiftUI essentials' },
      items: [
        {
          id: 'swift-state-binding',
          title: { fr: '@State / @Binding', en: '@State / @Binding' },
          code: `struct CounterView: View {
  @State private var count = 0       // source de vérité locale
  var body: some View {
    Stepper("\\(count)", value: $count) // $ → Binding<Int>
    ChildView(count: $count)
  }
}
struct ChildView: View {
  @Binding var count: Int            // lit ET écrit l'état du parent
  var body: some View { Button("+1") { count += 1 } }
}`,
          note: {
            fr: `@State possède la valeur (toujours private) ; @Binding y donne accès en lecture/écriture sans la posséder. Le préfixe $ projette le Binding.`,
            en: `@State owns the value (always private); @Binding grants read/write access without owning it. The $ prefix projects the Binding.`,
          },
        },
        {
          id: 'swift-stateobject-observedobject',
          title: { fr: '@StateObject vs @ObservedObject — piège du reset', en: '@StateObject vs @ObservedObject — the reset trap' },
          code: `struct GoodView: View {
  @StateObject private var vm = ViewModel()  // créé UNE fois, survit
  var body: some View { Text(vm.title) }
}
struct BadView: View {
  @ObservedObject var vm = ViewModel()  // ⚠️ recréé à CHAQUE re-render !
  var body: some View { Text(vm.title) }
}`,
          note: {
            fr: `@StateObject garantit une seule création même si la vue est ré-évaluée. Initialiser un @ObservedObject sur place le recrée à chaque rendu → état perdu. Règle : qui crée utilise @StateObject, qui reçoit utilise @ObservedObject.`,
            en: `@StateObject guarantees a single creation even when the view re-evaluates. Initializing an @ObservedObject inline recreates it on every render → state lost. Rule: the creator uses @StateObject, the receiver uses @ObservedObject.`,
          },
        },
        {
          id: 'swift-observable-macro',
          title: { fr: '@Observable (framework Observation)', en: '@Observable (Observation framework)' },
          code: `@Observable                       // iOS 17+ : remplace ObservableObject
final class CartModel {
  var items: [Item] = []           // plus besoin de @Published
  var total: Double { items.map(\\.price).reduce(0, +) }
}
struct CartView: View {
  @State private var cart = CartModel()  // @State suffit désormais
  var body: some View { Text("Total : \\(cart.total)") }
}`,
          note: {
            fr: `La macro @Observable (iOS 17) remplace ObservableObject/@Published : la vue ne se redessine que pour les propriétés réellement LUES dans body — moins de re-renders.`,
            en: `The @Observable macro (iOS 17) replaces ObservableObject/@Published: the view only re-renders for properties actually READ in body — fewer re-renders.`,
          },
        },
        {
          id: 'swift-modifier-order',
          title: { fr: "Modifiers — l'ordre compte", en: 'Modifiers — order matters' },
          code: `Text("Salut")
  .padding()                 // 1. d'abord la marge interne…
  .background(.blue)         // 2. …puis le fond englobe le padding ✅
Text("Salut")
  .background(.blue)         // fond collé au texte ❌
  .padding()                 // padding transparent autour`,
          note: {
            fr: `Chaque modifier enveloppe la vue précédente : .padding().background() colore aussi la marge ; l'inverse laisse la marge transparente. En cas de doute, lisez de haut en bas comme des couches.`,
            en: `Each modifier wraps the previous view: .padding().background() also colors the margin; the reverse leaves it transparent. When in doubt, read top-down as layers.`,
          },
        },
        {
          id: 'swift-list-foreach',
          title: { fr: 'List / ForEach + Identifiable', en: 'List / ForEach + Identifiable' },
          code: `struct Task_: Identifiable {
  let id = UUID()                  // requis par Identifiable
  let label: String
}
List(tasks) { task in              // id déduit automatiquement
  Text(task.label)
}
ForEach(tasks) { task in Text(task.label) }
  .onDelete { tasks.remove(atOffsets: $0) }`,
          note: {
            fr: `Identifiable permet à SwiftUI de suivre chaque ligne lors des insertions/suppressions (animations correctes). Évitez id: \\.self sur des valeurs non uniques : doublons = comportement erratique.`,
            en: `Identifiable lets SwiftUI track each row across insertions/deletions (correct animations). Avoid id: \\.self on non-unique values: duplicates = erratic behavior.`,
          },
        },
      ],
    },
    {
      id: 'errors',
      title: { fr: 'Erreurs & defer', en: 'Errors & defer' },
      items: [
        {
          id: 'swift-do-try-catch',
          title: { fr: 'do / try / catch', en: 'do / try / catch' },
          code: `enum NetworkError: Error { case offline, notFound }
do {
  let data = try load()            // chaque appel risqué : try
  print(data)
} catch NetworkError.offline {
  print("Hors ligne")
} catch {                          // attrape-tout : variable "error"
  print("Échec : \\(error)")
}`,
          note: {
            fr: `Chaque appel pouvant échouer doit être marqué try. Les catch se testent dans l'ordre ; le dernier catch sans motif reçoit \`error\` implicitement.`,
            en: `Every call that can fail must be marked try. catch clauses are tested in order; the final pattern-less catch implicitly receives \`error\`.`,
          },
        },
        {
          id: 'swift-throws-rethrows',
          title: { fr: 'throws / rethrows', en: 'throws / rethrows' },
          code: `func load() throws -> Data {     // déclare qu'elle peut échouer
  guard online else { throw NetworkError.offline }
  return cached
}
// rethrows : ne jette QUE si la closure jette
func retry<T>(_ op: () throws -> T) rethrows -> T {
  try op()
}
let v = retry { 42 }               // pas de try requis ici`,
          note: {
            fr: `throws fait partie de la signature : l'appelant DOIT gérer (try + do/catch ou propager). rethrows évite le try quand on passe une closure qui ne jette pas.`,
            en: `throws is part of the signature: the caller MUST handle it (try + do/catch or propagate). rethrows spares the try when the passed closure does not throw.`,
          },
        },
        {
          id: 'swift-try-optional',
          title: { fr: 'try? / try!', en: 'try? / try!' },
          code: `let data = try? load()           // Data? : nil si erreur (avalée)
if let data { print(data) }
let sure = try! load()           // 💥 crash si load() jette
// utile en chaîne :
let user = try? JSONDecoder().decode(User.self, from: data ?? Data())`,
          note: {
            fr: `try? convertit l'erreur en nil — pratique mais l'erreur est perdue (debug difficile). try! crashe : réservez-le aux ressources embarquées garanties.`,
            en: `try? converts the error to nil — handy but the error is lost (harder debugging). try! crashes: keep it for guaranteed bundled resources.`,
          },
        },
        {
          id: 'swift-result',
          title: { fr: 'Result<Success, Failure>', en: 'Result<Success, Failure>' },
          code: `func fetch(done: @escaping (Result<User, NetworkError>) -> Void) {
  done(online ? .success(user) : .failure(.offline))
}
fetch { result in
  switch result {
  case .success(let user): print(user.name)
  case .failure(let err): print(err)
  }
}
let user = try result.get()        // pont vers le monde throws`,
          note: {
            fr: `Result matérialise succès/échec comme une valeur : stockable, passable à une callback — là où throws ne passe pas. .get() reconvertit en throws.`,
            en: `Result reifies success/failure as a value: storable, passable to a callback — where throws cannot go. .get() converts back to throws.`,
          },
        },
        {
          id: 'swift-defer',
          title: { fr: 'defer — nettoyage garanti (LIFO)', en: 'defer — guaranteed cleanup (LIFO)' },
          code: `func process() throws {
  let file = open("data.txt")
  defer { close(file) }            // exécuté QUOI QU'IL ARRIVE à la sortie
  defer { print("2e defer, exécuté en 1er") } // ordre LIFO
  try parse(file)                  // même si parse jette, close() tourne
}`,
          note: {
            fr: `defer s'exécute à la sortie de la portée — return, throw ou fin normale. Plusieurs defer s'exécutent en ordre INVERSE de déclaration (LIFO) : déclarez le nettoyage juste après l'acquisition.`,
            en: `defer runs when the scope exits — return, throw, or normal end. Multiple defers run in REVERSE declaration order (LIFO): declare cleanup right after acquisition.`,
          },
        },
      ],
    },
    compareSection('types', 'swift-types-compare', 'Types : struct / class / actor', 'Types: struct / class / actor'),
    compareSection('bindings', 'swift-bindings-compare', 'Bindings SwiftUI', 'SwiftUI bindings'),
    {
      id: 'swift-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'swift-bp-access-control',
          title: { fr: "Contrôle d'accès par défaut", en: 'Default access control' },
          code: `private var cache: [String: User] = [:]
private(set) var isLoading = false`,
          note: {
            fr: `Restreignez la visibilité au minimum nécessaire (private/fileprivate) : cela réduit la surface d'API, évite les dépendances cachées et facilite le refactoring.`,
            en: `Restrict visibility to the minimum needed (private/fileprivate): it shrinks the API surface, avoids hidden coupling and eases refactoring.`,
          },
        },
        {
          id: 'swift-bp-composition',
          title: { fr: "Composition & protocoles plutôt qu'héritage", en: 'Composition & protocols over inheritance' },
          code: `protocol ImageLoading { func load(_ url: URL) async throws -> Data }
struct RemoteLoader: ImageLoading { /* … */ }`,
          note: {
            fr: `Swift favorise le protocol-oriented programming : composer via protocoles évite les hiérarchies de classes rigides et facilite les mocks en test.`,
            en: `Swift favors protocol-oriented programming: composing via protocols avoids rigid class hierarchies and makes mocking in tests easy.`,
          },
        },
        {
          id: 'swift-bp-dependency-injection',
          title: { fr: 'Injection de dépendances via protocoles', en: 'Dependency injection via protocols' },
          code: `final class ViewModel {
  private let service: NetworkService
  init(service: NetworkService = LiveService()) { self.service = service }
}`,
          note: {
            fr: `Injecter les dépendances (au lieu de créer des singletons partout) rend le code testable : on substitue un mock en test sans toucher au code de prod.`,
            en: `Injecting dependencies (instead of scattering singletons) makes code testable: swap in a mock for tests without touching production code.`,
          },
        },
        {
          id: 'swift-bp-tests',
          title: { fr: 'Tester avec Swift Testing (@Test)', en: 'Test with Swift Testing (@Test)' },
          code: `@Test func loginSucceeds() async throws {
  #expect(try await auth.login(user) == .success)
}`,
          note: {
            fr: `Le framework Swift Testing (@Test, #expect) remplace XCTest : syntaxe plus claire, tests paramétrés natifs, meilleure intégration Swift Concurrency.`,
            en: `The Swift Testing framework (@Test, #expect) replaces XCTest: clearer syntax, native parameterized tests, better Swift Concurrency integration.`,
          },
        },
        {
          id: 'swift-bp-avoid-force-try',
          title: { fr: 'Éviter try! et as! en production', en: 'Avoid try! and as! in production' },
          code: `guard let url = URL(string: raw) else { throw AppError.invalidURL }`,
          note: {
            fr: `try!/as!/! crashent immédiatement sur une hypothèse fausse ; en production, préférez guard/if let et des erreurs explicites pour dégrader proprement.`,
            en: `try!/as!/! crash instantly when an assumption is wrong; in production, prefer guard/if let and explicit errors to degrade gracefully.`,
          },
        },
      ],
    },
  ],
};
