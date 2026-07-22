import { patternsByFamily } from '../patterns.js';

// Une section par famille, dérivée du modèle patterns.js (jamais de contenu
// dupliqué à la main) : chaque pattern devient un item recherchable (Ctrl+K).
const familySection = (id, titleFr, titleEn) => ({
  id: `pat-${id}`,
  title: { fr: titleFr, en: titleEn },
  items: patternsByFamily(id).map((p) => ({
    id: `cs-pat-${p.id}`,
    title: p.name,
    code: p.pseudo,
    note: p.tagline,
  })),
});

export default {
  id: 'patterns',
  lang: 'js',
  sections: [
    familySection('creational', 'Création', 'Creational'),
    familySection('structural', 'Structure', 'Structural'),
    familySection('behavioral', 'Comportement', 'Behavioral'),
    {
      id: 'pat-principles',
      title: { fr: 'Principes', en: 'Principles' },
      items: [
        {
          id: 'cs-pat-composition',
          title: { fr: 'Composition plutôt qu\'héritage', en: 'Composition over inheritance' },
          code: 'class Car { engine = new Engine() } // a-un, pas est-un',
          note: {
            fr: 'Assembler des objets (a-un) donne plus de souplesse que des hiérarchies figées (est-un).',
            en: 'Assembling objects (has-a) is more flexible than rigid inheritance trees (is-a).',
          },
        },
        {
          id: 'cs-pat-interface',
          title: { fr: 'Programmer vers une interface', en: 'Program to an interface' },
          code: 'function pay(p) { p.charge() } // p respecte Payment, pas un type concret',
          note: {
            fr: 'Dépendre d\'une abstraction, pas d\'une implémentation concrète : couplage faible.',
            en: 'Depend on an abstraction, not a concrete implementation: loose coupling.',
          },
        },
        {
          id: 'cs-pat-encapsulate',
          title: { fr: 'Encapsuler ce qui varie', en: 'Encapsulate what varies' },
          code: 'strategy = pickStrategy(ctx) // isoler la partie changeante',
          note: {
            fr: 'Isoler la partie qui change derrière une frontière stable limite l\'impact des évolutions.',
            en: 'Isolating the changing part behind a stable boundary limits the blast radius of change.',
          },
        },
      ],
    },
    {
      id: 'pat-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'pat-bp-yagni',
          title: { fr: "Ne pas appliquer un pattern par anticipation", en: "Don't apply a pattern preemptively" },
          code: `// Mauvais : Strategy pour UNE seule méthode de paiement "au cas où"
// Bon : introduire Strategy quand une 2e variante apparaît réellement`,
          note: {
            fr: `Un pattern ajoute une indirection et une classe supplémentaire ; l'introduire avant que le besoin réel existe (YAGNI) coûte en lisibilité sans bénéfice mesurable.`,
            en: `A pattern adds indirection and an extra class; introducing it before the real need exists (YAGNI) costs readability with no measurable benefit.`,
          },
        },
        {
          id: 'pat-bp-code-to-interface',
          title: { fr: "Dépendre de l'interface, jamais de la classe concrète", en: 'Depend on the interface, never the concrete class' },
          code: `function checkout(strategy /* PaymentStrategy */) { strategy.pay(total) }`,
          note: {
            fr: `Si le code client référence une classe concrète (Paypal) au lieu de l'interface (PaymentStrategy), l'interchangeabilité promise par le pattern disparaît silencieusement.`,
            en: `If client code references a concrete class (Paypal) instead of the interface (PaymentStrategy), the interchangeability the pattern promised silently disappears.`,
          },
        },
        {
          id: 'pat-bp-test-contract',
          title: { fr: "Tester le contrat, pas l'implémentation", en: 'Test the contract, not the implementation' },
          code: `// tester que .pay(amount) retourne un reçu valide,
// pas les détails internes de PaypalStrategy`,
          note: {
            fr: `Tester le contrat public permet de remplacer une stratégie/état par une autre sans casser les tests — c'est l'objectif même du pattern.`,
            en: `Testing the public contract lets you swap one strategy/state for another without breaking tests — that is the whole point of the pattern.`,
          },
        },
        {
          id: 'pat-bp-limit-wrapping',
          title: { fr: 'Limiter la profondeur des décorateurs/chaînes', en: 'Limit decorator/chain depth' },
          code: `new Milk(new Sugar(new Whip(new Coffee()))) // 3 niveaux : encore lisible`,
          note: {
            fr: `Au-delà de 2-3 niveaux d'emballage (Decorator, Chain of Responsibility), le débogage devient pénible : chaque couche doit être inspectée pour comprendre le comportement final.`,
            en: `Beyond 2-3 layers of wrapping (Decorator, Chain of Responsibility), debugging becomes painful: every layer must be inspected to understand the final behavior.`,
          },
        },
        {
          id: 'pat-bp-document-intent',
          title: { fr: 'Documenter le problème résolu, pas juste le nom du pattern', en: 'Document the problem solved, not just the pattern name' },
          code: `// Strategy ici : le mode de calcul de prix change selon le pays (TVA)
class PriceStrategy { /* ... */ }`,
          note: {
            fr: `Nommer une classe "XxxStrategy" sans expliquer pourquoi n'aide pas l'équipe ; documenter le problème d'origine rend le choix du pattern justifiable et remplaçable si le contexte change.`,
            en: `Naming a class "XxxStrategy" without explaining why doesn't help the team; documenting the original problem makes the pattern choice justifiable and replaceable if context changes.`,
          },
        },
      ],
    },
  ],
};
