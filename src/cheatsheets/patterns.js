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
          code: 'function pay(p: Payment) { p.charge() } // pas un type concret',
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
  ],
};
