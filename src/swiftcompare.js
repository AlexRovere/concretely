// Deux comparaisons Swift au format tableau (dimensions x candidats). Modèle
// pur (aucun import Vue), bilingue {fr, en} inline, testable sous node --test.

export const COMPARISONS = {
  types: {
    id: 'types',
    intro: {
      fr: 'Swift a trois familles de types nommés (struct, class, actor) plus l\'isolation @MainActor. Le choix décide de la sémantique de copie, de l\'identité et de la sécurité en concurrence.',
      en: 'Swift has three named type families (struct, class, actor) plus @MainActor isolation. The choice drives copy semantics, identity, and concurrency safety.',
    },
    candidates: [
      {
        id: 'struct',
        label: 'struct',
        code: `struct Point { var x = 0 }
var a = Point()
var b = a        // copie indépendante
b.x = 9
print(a.x, b.x)  // 0 9`,
        when: {
          fr: 'Modèles de données par valeur, immuables ou locaux : pas de partage, donc pas de course de données.',
          en: 'Value-type data models, immutable or local: no sharing, hence no data races.',
        },
      },
      {
        id: 'class',
        label: 'class',
        code: `class Box { var x = 0 }
let a = Box()
let b = a         // même instance (référence)
b.x = 9
print(a.x, b.x)   // 9 9`,
        when: {
          fr: 'Identité partagée, cycle de vie ou héritage nécessaires. Attention aux courses de données si mutée depuis plusieurs tâches.',
          en: 'Shared identity, lifecycle, or inheritance needed. Watch for data races if mutated from several tasks.',
        },
      },
      {
        id: 'actor',
        label: 'actor',
        code: `actor Counter { var n = 0
  func inc() { n += 1 } }
let c = Counter()
await c.inc()      // accès sérialisé
let v = await c.n  // hop d'acteur`,
        when: {
          fr: 'État mutable partagé entre tâches concurrentes : l\'acteur sérialise les accès et supprime les courses.',
          en: 'Mutable state shared across concurrent tasks: the actor serializes access and removes races.',
        },
      },
      {
        id: 'mainactor',
        label: '@MainActor class',
        code: `@MainActor
class VM: ObservableObject {
  @Published var title = ""
}
// tout accès est garanti sur le main thread`,
        when: {
          fr: 'État d\'interface qui doit vivre sur le main thread (ViewModels SwiftUI, UIKit).',
          en: 'UI state that must live on the main thread (SwiftUI ViewModels, UIKit).',
        },
      },
    ],
    dimensions: [
      { id: 'semantics', label: { fr: 'Sémantique', en: 'Semantics' }, cells: {
        struct: { fr: 'Valeur : chaque affectation copie.', en: 'Value: each assignment copies.' },
        class: { fr: 'Référence : affectation = même instance.', en: 'Reference: assignment = same instance.' },
        actor: { fr: 'Référence, mais état isolé.', en: 'Reference, but isolated state.' },
        mainactor: { fr: 'Référence (c\'est une class).', en: 'Reference (it is a class).' },
      } },
      { id: 'mutation', label: { fr: 'Mutation', en: 'Mutation' }, cells: {
        struct: { fr: '`mutating` sur une var ; la copie protège l\'original.', en: '`mutating` on a var; the copy protects the original.' },
        class: { fr: 'Directe ; visible par tous les détenteurs.', en: 'Direct; visible to every holder.' },
        actor: { fr: 'Directe en interne ; externe via `await`.', en: 'Direct inside; external via `await`.' },
        mainactor: { fr: 'Directe, mais uniquement sur le main.', en: 'Direct, but only on the main thread.' },
      } },
      { id: 'identity', label: { fr: 'Identité (===)', en: 'Identity (===)' }, cells: {
        struct: { fr: 'Non : pas de `===`.', en: 'No: no `===`.' },
        class: { fr: 'Oui : `===` compare les instances.', en: 'Yes: `===` compares instances.' },
        actor: { fr: 'Oui (type référence).', en: 'Yes (reference type).' },
        mainactor: { fr: 'Oui (type référence).', en: 'Yes (reference type).' },
      } },
      { id: 'threadsafe', label: { fr: 'Thread-safety', en: 'Thread safety' }, cells: {
        struct: { fr: 'Sûr : copies indépendantes.', en: 'Safe: independent copies.' },
        class: { fr: 'Non garanti : synchronisation manuelle.', en: 'Not guaranteed: manual synchronization.' },
        actor: { fr: 'Sûr : accès sérialisés par l\'acteur.', en: 'Safe: access serialized by the actor.' },
        mainactor: { fr: 'Sûr si on reste sur le main.', en: 'Safe as long as you stay on the main thread.' },
      } },
      { id: 'concurrency', label: { fr: 'Accès concurrent', en: 'Concurrent access' }, cells: {
        struct: { fr: 'Pas de partage, donc rien à protéger.', en: 'No sharing, nothing to protect.' },
        class: { fr: 'Course de données possible.', en: 'Data race possible.' },
        actor: { fr: '`await` requis depuis l\'extérieur.', en: '`await` required from outside.' },
        mainactor: { fr: '`await MainActor.run` hors du main.', en: '`await MainActor.run` off the main thread.' },
      } },
      { id: 'inheritance', label: { fr: 'Héritage', en: 'Inheritance' }, cells: {
        struct: { fr: 'Non (protocoles seulement).', en: 'No (protocols only).' },
        class: { fr: 'Oui.', en: 'Yes.' },
        actor: { fr: 'Non (protocoles seulement).', en: 'No (protocols only).' },
        mainactor: { fr: 'Oui (c\'est une class).', en: 'Yes (it is a class).' },
      } },
      { id: 'storage', label: { fr: 'Stockage', en: 'Storage' }, cells: {
        struct: { fr: 'Souvent en ligne / pile.', en: 'Often inline / stack.' },
        class: { fr: 'Tas + ARC.', en: 'Heap + ARC.' },
        actor: { fr: 'Tas + ARC.', en: 'Heap + ARC.' },
        mainactor: { fr: 'Tas + ARC.', en: 'Heap + ARC.' },
      } },
      { id: 'cost', label: { fr: 'Coût', en: 'Cost' }, cells: {
        struct: { fr: 'Copie (mais copy-on-write pour les collections).', en: 'Copy (but copy-on-write for collections).' },
        class: { fr: 'ARC retain/release.', en: 'ARC retain/release.' },
        actor: { fr: 'ARC + hops d\'acteur (suspensions).', en: 'ARC + actor hops (suspensions).' },
        mainactor: { fr: 'ARC + saut vers le main thread.', en: 'ARC + hop to the main thread.' },
      } },
    ],
    notes: [
      { fr: 'Règle par défaut : commencer par `struct`, passer à `class` quand l\'identité ou l\'héritage est nécessaire.', en: 'Default rule: start with `struct`, move to `class` when you need identity or inheritance.' },
      { fr: 'Un `actor` protège l\'état partagé sans verrou explicite ; le prix est l\'asynchronisme (`await`).', en: 'An `actor` protects shared state without an explicit lock; the price is asynchrony (`await`).' },
    ],
  },

  bindings: {
    id: 'bindings',
    intro: {
      fr: 'SwiftUI expose plusieurs property wrappers pour relier une vue à son état. Ils diffèrent par ce qu\'ils possèdent, ce qu\'ils observent et par le moment où la vue redessine.',
      en: 'SwiftUI exposes several property wrappers to bind a view to its state. They differ in what they own, what they observe, and when the view redraws.',
    },
    candidates: [
      {
        id: 'state',
        label: '@State',
        code: `struct V: View {
  @State private var count = 0
  var body: some View { Button("\\(count)") { count += 1 } }
}`,
        when: {
          fr: 'Petit état de valeur possédé par la vue elle-même.',
          en: 'Small value state owned by the view itself.',
        },
      },
      {
        id: 'binding',
        label: '@Binding',
        code: `struct Child: View {
  @Binding var on: Bool
  var body: some View { Toggle("", isOn: $on) }
}`,
        when: {
          fr: 'Lire et écrire un état possédé par un parent (pas une copie).',
          en: 'Read and write state owned by a parent (not a copy).',
        },
      },
      {
        id: 'stateobject',
        label: '@StateObject',
        code: `final class VM: ObservableObject {
  @Published var count = 0
}
struct V: View {
  @StateObject private var vm = VM()
  var body: some View { Button("\\(vm.count)") { vm.count += 1 } }
}`,
        when: {
          fr: 'La vue crée et possède un ObservableObject qui doit survivre aux re-render.',
          en: 'The view creates and owns an ObservableObject that must survive re-renders.',
        },
      },
      {
        id: 'observed',
        label: '@ObservedObject',
        code: `struct Child: View {
  @ObservedObject var vm: VM
  var body: some View { Button("\\(vm.count)") { vm.count += 1 } }
}
// vm reçu du parent, jamais créé ici`,
        when: {
          fr: 'Observer un ObservableObject possédé et transmis par un parent.',
          en: 'Observe an ObservableObject owned and passed down by a parent.',
        },
      },
      {
        id: 'environment',
        label: '@EnvironmentObject',
        code: `struct Child: View {
  @EnvironmentObject var session: Session
  var body: some View { Text(session.userName) }
}
// injecté par un ancêtre : .environmentObject(session)`,
        when: {
          fr: 'Partager un objet à travers plusieurs niveaux de vues sans le passer explicitement.',
          en: 'Share an object across several view levels without passing it explicitly.',
        },
      },
      {
        id: 'observable',
        label: '@Observable + @State',
        code: `@Observable final class VM {
  var count = 0
}
struct V: View {
  @State private var vm = VM()
  var body: some View { Button("\\(vm.count)") { vm.count += 1 } }
}`,
        when: {
          fr: 'iOS 17+ : remplace @StateObject/@ObservedObject avec un suivi plus fin des propriétés.',
          en: 'iOS 17+: replaces @StateObject/@ObservedObject with finer-grained property tracking.',
        },
      },
    ],
    dimensions: [
      { id: 'role', label: { fr: 'Rôle', en: 'Role' }, cells: {
        state: { fr: 'Possède un état de valeur simple.', en: 'Owns a simple value state.' },
        binding: { fr: 'Référence en lecture/écriture vers l\'état d\'un parent.', en: 'Read/write reference to a parent state.' },
        stateobject: { fr: 'Possède un ObservableObject.', en: 'Owns an ObservableObject.' },
        observed: { fr: 'Observe un objet possédé ailleurs.', en: 'Observes an object owned elsewhere.' },
        environment: { fr: 'Lit un objet injecté par un ancêtre.', en: 'Reads an object injected by an ancestor.' },
        observable: { fr: 'Possède un type @Observable.', en: 'Owns an @Observable type.' },
      } },
      { id: 'observes', label: { fr: 'Type observé', en: 'Observed type' }, cells: {
        state: { fr: 'Une valeur.', en: 'A value.' },
        binding: { fr: 'Une valeur, via la source du parent.', en: 'A value, via the parent source.' },
        stateobject: { fr: 'Un `ObservableObject` (class).', en: 'An `ObservableObject` (class).' },
        observed: { fr: 'Un `ObservableObject` (class).', en: 'An `ObservableObject` (class).' },
        environment: { fr: 'Un `ObservableObject` (class).', en: 'An `ObservableObject` (class).' },
        observable: { fr: 'Une classe `@Observable`.', en: 'An `@Observable` class.' },
      } },
      { id: 'ownership', label: { fr: 'Propriété', en: 'Ownership' }, cells: {
        state: { fr: 'Créé et gardé par la vue.', en: 'Created and kept by the view.' },
        binding: { fr: 'Aucune : simple référence.', en: 'None: just a reference.' },
        stateobject: { fr: 'Instancié une fois, survit aux re-render.', en: 'Instantiated once, survives re-renders.' },
        observed: { fr: 'Ne possède pas : peut être recréé.', en: 'Does not own it: can be recreated.' },
        environment: { fr: 'Fourni par un ancêtre.', en: 'Provided by an ancestor.' },
        observable: { fr: 'L\'instance @Observable est gardée par @State.', en: 'The @Observable instance is kept by @State.' },
      } },
      { id: 'updates', label: { fr: 'Déclenche la mise à jour', en: 'Triggers update' }, cells: {
        state: { fr: 'À chaque changement de la valeur.', en: 'On every change of the value.' },
        binding: { fr: 'Via la source du parent.', en: 'Via the parent source.' },
        stateobject: { fr: 'Sur `objectWillChange` / `@Published`.', en: 'On `objectWillChange` / `@Published`.' },
        observed: { fr: 'Sur `objectWillChange` / `@Published`.', en: 'On `objectWillChange` / `@Published`.' },
        environment: { fr: 'Sur `objectWillChange` / `@Published`.', en: 'On `objectWillChange` / `@Published`.' },
        observable: { fr: 'Sur accès aux seules propriétés lues (granularité fine).', en: 'On access to only the properties actually read (fine-grained).' },
      } },
      { id: 'pitfall', label: { fr: 'Piège', en: 'Pitfall' }, cells: {
        state: { fr: 'Aucun piège notable.', en: 'No notable pitfall.' },
        binding: { fr: 'Aucun piège notable.', en: 'No notable pitfall.' },
        stateobject: { fr: 'Aucun piège notable.', en: 'No notable pitfall.' },
        observed: { fr: 'Reset de l\'état si l\'objet est créé inline dans le parent.', en: 'State resets if the object is created inline in the parent.' },
        environment: { fr: 'Crash à l\'exécution si l\'objet d\'environnement est absent.', en: 'Runtime crash if the environment object is missing.' },
        observable: { fr: 'Oublier `@State` recrée l\'instance à chaque render.', en: 'Forgetting `@State` recreates the instance on every render.' },
      } },
      { id: 'since', label: { fr: 'Disponible depuis', en: 'Available since' }, cells: {
        state: { fr: 'iOS 13.', en: 'iOS 13.' },
        binding: { fr: 'iOS 13.', en: 'iOS 13.' },
        stateobject: { fr: 'iOS 14.', en: 'iOS 14.' },
        observed: { fr: 'iOS 13.', en: 'iOS 13.' },
        environment: { fr: 'iOS 13.', en: 'iOS 13.' },
        observable: { fr: 'iOS 17.', en: 'iOS 17.' },
      } },
    ],
    notes: [
      { fr: 'Source de vérité unique : un seul wrapper possède l\'état, les autres le référencent.', en: 'Single source of truth: one wrapper owns the state, the others reference it.' },
      { fr: 'Depuis iOS 17, `@Observable` + `@State` remplace le couple `@StateObject`/`@ObservedObject` et n\'observe que les propriétés réellement lues.', en: 'Since iOS 17, `@Observable` + `@State` replaces the `@StateObject`/`@ObservedObject` pair and observes only the properties actually read.' },
    ],
  },
};

export function comparisonFor(id) {
  return COMPARISONS[id] ?? null;
}
