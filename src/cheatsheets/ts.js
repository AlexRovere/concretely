/**
 * Cheatsheet TypeScript — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'ts',
  lang: 'ts',
  sections: [
    {
      id: 'types',
      title: { fr: 'Types & annotations', en: 'Types & annotations' },
      items: [
        {
          id: 'ts-primitives-inference',
          title: { fr: 'Primitifs & inférence', en: 'Primitives & inference' },
          code: `let age = 36;            // number inféré, pas besoin d'annoter
const nom = "Ada";       // type littéral "Ada" (const = plus précis)
let actif: boolean;      // annoter quand il n'y a pas d'initialiseur
let id: number | string; // union : l'un ou l'autre
age = "36";              // Erreur : string n'est pas number`,
          note: {
            fr: `Laissez TypeScript inférer dès que possible : annoter \`let x: number = 5\` est du bruit. Annotez les paramètres de fonction, les retours publics et les variables sans initialiseur.`,
            en: `Let TypeScript infer whenever possible: annotating \`let x: number = 5\` is noise. Annotate function parameters, public return types and variables without an initializer.`,
          },
        },
        {
          id: 'ts-union-literals',
          title: { fr: 'Unions de littéraux', en: 'Literal unions' },
          code: `type Statut = "brouillon" | "publie" | "archive";

function publier(statut: Statut) { /* ... */ }

publier("publie");   // OK — autocomplétion incluse
publier("publié");   // Erreur : faute de frappe détectée`,
          note: {
            fr: `L'union de littéraux est l'outil n°1 pour modéliser un choix fini : le compilateur attrape les fautes de frappe et l'éditeur autocomplète. Préférez-la souvent à enum (zéro code généré).`,
            en: `Literal unions are the go-to tool for a finite set of choices: the compiler catches typos and the editor autocompletes. Often preferable to enum (zero generated code).`,
          },
        },
        {
          id: 'ts-arrays-tuples',
          title: { fr: 'Tableaux & tuples', en: 'Arrays & tuples' },
          code: `const notes: number[] = [12, 15, 18];
const paire: [string, number] = ["Ada", 36]; // tuple : taille et types fixés
const [nom, age] = paire;                    // nom: string, age: number

// Tuple nommé : plus lisible dans les signatures
type Point = [x: number, y: number];`,
          note: {
            fr: `Un tableau est homogène et de taille libre ; un tuple fixe la position et le type de chaque élément. Les tuples brillent pour les retours multiples (comme useState en React).`,
            en: `An array is homogeneous with free length; a tuple fixes each element's position and type. Tuples shine for multiple return values (like React's useState).`,
          },
        },
        {
          id: 'ts-type-vs-interface',
          title: { fr: 'type vs interface', en: 'type vs interface' },
          code: `interface User {           // extensible, fusion de déclarations
  id: number;
  nom: string;
}
interface User { email?: string } // fusionne avec la précédente !

type Resultat = User | null;      // type : unions, tuples, mapped types`,
          note: {
            fr: `interface = formes d'objets extensibles (fusion de déclarations, utile pour les libs). type = tout le reste : unions, intersections, tuples, mapped types. En pratique, choisissez-en un et restez cohérent.`,
            en: `interface = extensible object shapes (declaration merging, useful for libraries). type = everything else: unions, intersections, tuples, mapped types. In practice, pick one and stay consistent.`,
          },
        },
        {
          id: 'ts-optional-properties',
          title: { fr: 'Propriétés optionnelles', en: 'Optional properties' },
          code: `interface Options {
  retry?: number;          // peut être absent → number | undefined
  timeout: number | undefined; // doit être présent, même si undefined
}

const a: Options = { timeout: undefined };       // OK
const b: Options = { retry: 3, timeout: 5000 };  // OK`,
          note: {
            fr: `\`?\` rend la clé facultative, alors que \`| undefined\` exige la clé tout en autorisant la valeur undefined. Nuance importante avec exactOptionalPropertyTypes activé.`,
            en: `\`?\` makes the key optional, while \`| undefined\` requires the key but allows an undefined value. An important nuance once exactOptionalPropertyTypes is enabled.`,
          },
        },
        {
          id: 'ts-intersection',
          title: { fr: 'Intersections avec &', en: 'Intersections with &' },
          code: `type Horodate = { createdAt: Date };
type Identifie = { id: string };

type Entite = Horodate & Identifie; // les deux à la fois

const e: Entite = { id: "a1", createdAt: new Date() };`,
          note: {
            fr: `& combine plusieurs types en un seul qui doit tout satisfaire. Idéal pour composer des "mixins" de propriétés. Attention : des propriétés incompatibles donnent never en silence.`,
            en: `& combines several types into one that must satisfy them all. Great for composing property "mixins". Beware: conflicting properties silently collapse to never.`,
          },
        },
      ],
    },
    {
      id: 'narrowing',
      title: { fr: 'Narrowing & guards', en: 'Narrowing & guards' },
      items: [
        {
          id: 'ts-typeof-narrowing',
          title: { fr: 'Narrowing avec typeof', en: 'Narrowing with typeof' },
          code: `function formater(valeur: string | number) {
  if (typeof valeur === "string") {
    return valeur.toUpperCase(); // ici : string
  }
  return valeur.toFixed(2);      // ici : number
}`,
          note: {
            fr: `TypeScript suit le flux de contrôle : après le if, le type est affiné dans chaque branche. C'est la base du narrowing — pas besoin de cast, écrivez du JavaScript naturel.`,
            en: `TypeScript follows control flow: after the if, the type is narrowed in each branch. This is the core of narrowing — no casts needed, just write natural JavaScript.`,
          },
        },
        {
          id: 'ts-in-instanceof',
          title: { fr: 'Guards in et instanceof', en: 'in and instanceof guards' },
          code: `function traiter(e: Error | { message: string; code: number }) {
  if (e instanceof Error) return e.stack;   // classe → instanceof
  if ("code" in e) return e.code;           // objet brut → in
}

// "code" in e affine vers le membre qui possède la propriété`,
          note: {
            fr: `instanceof affine les instances de classes, \`in\` teste la présence d'une propriété pour départager des objets bruts. Les deux sont compris nativement par le compilateur.`,
            en: `instanceof narrows class instances, \`in\` checks property presence to tell plain objects apart. Both are understood natively by the compiler.`,
          },
        },
        {
          id: 'ts-discriminated-union',
          title: { fr: 'Unions discriminées', en: 'Discriminated unions' },
          code: `type Resultat =
  | { ok: true; data: string }
  | { ok: false; erreur: Error };

function afficher(r: Resultat) {
  if (r.ok) return r.data;     // branche true : data existe
  return r.erreur.message;     // branche false : erreur existe
}`,
          note: {
            fr: `Le pattern le plus puissant de TS : une propriété littérale commune ("discriminant") permet au compilateur de savoir exactement quelle variante on manipule. Modélisez vos états ainsi plutôt qu'avec des champs optionnels.`,
            en: `The most powerful TS pattern: a shared literal property (the "discriminant") lets the compiler know exactly which variant you hold. Model your states this way instead of with optional fields.`,
          },
        },
        {
          id: 'ts-type-predicate',
          title: { fr: 'Prédicat de type (is)', en: 'Type predicate (is)' },
          code: `function estString(v: unknown): v is string {
  return typeof v === "string";
}

const mixte: unknown[] = ["a", 1, "b"];
const strings = mixte.filter(estString); // string[] — pas unknown[]`,
          note: {
            fr: `\`v is string\` transforme une fonction booléenne en guard réutilisable : le narrowing fonctionne partout où vous l'appelez, y compris dans filter. Attention : le compilateur vous croit sur parole, le corps doit être correct.`,
            en: `\`v is string\` turns a boolean function into a reusable guard: narrowing works wherever you call it, including inside filter. Careful: the compiler takes your word for it, the body must be correct.`,
          },
        },
        {
          id: 'ts-exhaustive-never',
          title: { fr: 'Exhaustivité avec never', en: 'Exhaustiveness with never' },
          code: `type Forme = { type: "cercle" } | { type: "carre" };

function aire(f: Forme) {
  switch (f.type) {
    case "cercle": return 1;
    case "carre": return 2;
    default:
      const _jamais: never = f; // Erreur si un cas manque
      throw new Error("Forme inconnue");
  }
}`,
          note: {
            fr: `Assigner le cas restant à never force le compilateur à vérifier l'exhaustivité : ajoutez une variante à Forme et chaque switch incomplet devient une erreur. Filet de sécurité gratuit lors des refactorings.`,
            en: `Assigning the remaining case to never makes the compiler check exhaustiveness: add a variant to Forme and every incomplete switch becomes an error. A free safety net during refactors.`,
          },
        },
        {
          id: 'ts-as-const',
          title: { fr: 'as const', en: 'as const' },
          code: `const config = {
  mode: "production",
  ports: [80, 443],
} as const;
// → { readonly mode: "production"; readonly ports: readonly [80, 443] }

type Mode = typeof config.mode; // "production", pas string`,
          note: {
            fr: `as const fige tout en littéraux readonly : indispensable pour dériver des types précis depuis des données (listes de routes, configs). Sans lui, "production" serait élargi en string.`,
            en: `as const freezes everything into readonly literals: essential to derive precise types from data (route lists, configs). Without it, "production" would widen to string.`,
          },
        },
        {
          id: 'ts-satisfies',
          title: { fr: 'satisfies', en: 'satisfies' },
          code: `type Palette = Record<string, string | [number, number, number]>;

const couleurs = {
  rouge: [255, 0, 0],
  bleu: "#00f",
} satisfies Palette;

couleurs.rouge[0]; // OK : TS sait que rouge est un tuple
// Avec ": Palette", rouge serait string | [number, ...] → erreur`,
          note: {
            fr: `satisfies vérifie la conformité à un type SANS élargir l'inférence : on garde les types précis de chaque propriété. C'est le meilleur des deux mondes entre annotation et inférence pure (TS 4.9+).`,
            en: `satisfies checks conformance to a type WITHOUT widening inference: each property keeps its precise type. The best of both worlds between annotation and pure inference (TS 4.9+).`,
          },
        },
      ],
    },
    {
      id: 'generics',
      title: { fr: 'Génériques', en: 'Generics' },
      items: [
        {
          id: 'ts-generic-function',
          title: { fr: 'Fonction générique', en: 'Generic function' },
          code: `function premier<T>(liste: T[]): T | undefined {
  return liste[0];
}

const n = premier([1, 2, 3]);     // n: number | undefined
const s = premier(["a", "b"]);    // s: string | undefined
// T est inféré depuis l'argument — pas besoin de premier<number>(...)`,
          note: {
            fr: `Un générique relie les types d'entrée et de sortie : le type circule à travers la fonction au lieu de se dégrader en any. Dans 95 % des cas, T est inféré automatiquement à l'appel.`,
            en: `A generic links input and output types: the type flows through the function instead of degrading to any. In 95% of cases, T is inferred automatically at the call site.`,
          },
        },
        {
          id: 'ts-generic-constraint',
          title: { fr: 'Contrainte extends', en: 'extends constraint' },
          code: `function plusLong<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

plusLong("abc", "de");      // OK — string a length
plusLong([1, 2], [3]);      // OK — array a length
plusLong(10, 20);           // Erreur : number n'a pas length`,
          note: {
            fr: `\`T extends X\` restreint les types acceptés ET autorise l'accès aux membres de X dans le corps. Sans contrainte, T est opaque : impossible d'appeler .length dessus.`,
            en: `\`T extends X\` restricts accepted types AND grants access to X's members in the body. Without a constraint, T is opaque: you can't call .length on it.`,
          },
        },
        {
          id: 'ts-keyof-generic',
          title: { fr: 'Accès sûr avec keyof', en: 'Safe access with keyof' },
          code: `function prop<T, K extends keyof T>(obj: T, cle: K): T[K] {
  return obj[cle];
}

const user = { nom: "Ada", age: 36 };
prop(user, "nom");   // string
prop(user, "age");   // number
prop(user, "email"); // Erreur : "email" n'existe pas sur user`,
          note: {
            fr: `Le duo \`K extends keyof T\` + type indexé \`T[K]\` est LE pattern d'accès dynamique typé : la clé est vérifiée et le type de retour est exact pour chaque clé. À connaître par cœur.`,
            en: `The \`K extends keyof T\` + indexed type \`T[K]\` duo is THE typed dynamic-access pattern: the key is checked and the return type is exact per key. Worth knowing by heart.`,
          },
        },
        {
          id: 'ts-generic-default',
          title: { fr: 'Paramètre par défaut', en: 'Default type parameter' },
          code: `interface Reponse<T = unknown> {
  status: number;
  data: T;
}

const brute: Reponse = { status: 200, data: "?" };  // data: unknown
const typee: Reponse<{ id: number }> = {
  status: 200,
  data: { id: 1 },
};`,
          note: {
            fr: `\`<T = unknown>\` rend le générique facultatif : les appels simples restent légers, les appels précis gardent toute la sécurité. Préférez unknown à any comme défaut pour forcer le narrowing en aval.`,
            en: `\`<T = unknown>\` makes the generic optional: simple uses stay lightweight, precise uses keep full safety. Prefer unknown over any as the default to force downstream narrowing.`,
          },
        },
        {
          id: 'ts-generic-interface',
          title: { fr: 'Types génériques réutilisables', en: 'Reusable generic types' },
          code: `type Pagine<T> = {
  items: T[];
  total: number;
  page: number;
};

async function listerUsers(): Promise<Pagine<{ id: number }>> {
  return { items: [{ id: 1 }], total: 1, page: 1 };
}`,
          note: {
            fr: `Les wrappers génériques (Pagine<T>, Resultat<T>, ApiReponse<T>) éliminent la duplication des enveloppes d'API : on écrit la structure une fois et on la paramètre partout.`,
            en: `Generic wrappers (Paginated<T>, Result<T>, ApiResponse<T>) remove duplication of API envelopes: write the structure once and parameterize it everywhere.`,
          },
        },
      ],
    },
    {
      id: 'utility-types',
      title: { fr: 'Types utilitaires', en: 'Utility types' },
      items: [
        {
          id: 'ts-partial-required',
          title: { fr: 'Partial & Required', en: 'Partial & Required' },
          code: `interface User { id: number; nom: string; email: string }

function maj(id: number, patch: Partial<User>) { /* ... */ }
maj(1, { nom: "Ada" });        // OK : tout est optionnel

type Complet = Required<User>; // l'inverse : tout obligatoire`,
          note: {
            fr: `Partial<T> rend toutes les propriétés optionnelles : parfait pour les patchs de mise à jour. Required<T> fait l'inverse. Dérivez ces variantes au lieu de dupliquer l'interface à la main.`,
            en: `Partial<T> makes every property optional: perfect for update patches. Required<T> does the opposite. Derive these variants instead of duplicating the interface by hand.`,
          },
        },
        {
          id: 'ts-pick-omit',
          title: { fr: 'Pick & Omit', en: 'Pick & Omit' },
          code: `interface User { id: number; nom: string; motDePasse: string }

type UserPublic = Omit<User, "motDePasse">; // tout sauf motDePasse
type UserRef = Pick<User, "id" | "nom">;    // seulement id et nom

const safe: UserPublic = { id: 1, nom: "Ada" };`,
          note: {
            fr: `Pick garde des clés, Omit en retire : les deux maintiennent un lien vivant avec le type source. Renommez un champ de User et tous les types dérivés suivent — contrairement au copier-coller.`,
            en: `Pick keeps keys, Omit removes them: both keep a live link to the source type. Rename a field on User and every derived type follows — unlike copy-paste.`,
          },
        },
        {
          id: 'ts-record',
          title: { fr: 'Record', en: 'Record' },
          code: `type Role = "admin" | "editeur" | "lecteur";

const droits: Record<Role, string[]> = {
  admin: ["lire", "ecrire", "supprimer"],
  editeur: ["lire", "ecrire"],
  lecteur: ["lire"],
}; // oublier une clé = erreur de compilation`,
          note: {
            fr: `Record<K, V> type un objet-dictionnaire. Avec une union de littéraux en clé, le compilateur exige l'exhaustivité : impossible d'oublier un rôle en ajoutant une variante.`,
            en: `Record<K, V> types a dictionary object. With a literal union as the key, the compiler enforces exhaustiveness: you can't forget a role when adding a variant.`,
          },
        },
        {
          id: 'ts-keyof-typeof',
          title: { fr: 'keyof & typeof', en: 'keyof & typeof' },
          code: `const THEMES = { clair: "#fff", sombre: "#000" } as const;

type Themes = typeof THEMES;        // le type de la valeur
type NomTheme = keyof typeof THEMES; // "clair" | "sombre"

function appliquer(t: NomTheme) { document.body.dataset.theme = t; }`,
          note: {
            fr: `typeof (en position de type) capture le type d'une valeur existante, keyof en extrait les clés. Le combo \`keyof typeof obj\` dérive une union de littéraux depuis un objet : une seule source de vérité.`,
            en: `typeof (in type position) captures an existing value's type, keyof extracts its keys. The \`keyof typeof obj\` combo derives a literal union from an object: a single source of truth.`,
          },
        },
        {
          id: 'ts-returntype-awaited',
          title: { fr: 'ReturnType & Awaited', en: 'ReturnType & Awaited' },
          code: `async function chargerUser() {
  return { id: 1, nom: "Ada" };
}

type Promesse = ReturnType<typeof chargerUser>; // Promise<{...}>
type User = Awaited<Promesse>;                  // { id: number; nom: string }
// raccourci : Awaited<ReturnType<typeof chargerUser>>`,
          note: {
            fr: `Quand une fonction est la source de vérité (client d'API, lib externe), extrayez son type de retour au lieu de le redéclarer. Awaited déballe les Promise, même imbriquées.`,
            en: `When a function is the source of truth (API client, external lib), extract its return type instead of redeclaring it. Awaited unwraps Promises, even nested ones.`,
          },
        },
        {
          id: 'ts-mapped-types',
          title: { fr: 'Mapped types', en: 'Mapped types' },
          code: `type Drapeaux<T> = {
  [K in keyof T]: boolean; // transforme chaque propriété
};

interface Form { nom: string; email: string }
type Touche = Drapeaux<Form>; // { nom: boolean; email: boolean }

type Readonly2<T> = { readonly [K in keyof T]: T[K] }; // ainsi est fait Readonly`,
          note: {
            fr: `\`[K in keyof T]\` itère sur les clés d'un type pour produire un nouveau type : c'est ainsi que Partial, Readonly et Record sont implémentés. À dégainer quand les utilitaires intégrés ne suffisent plus.`,
            en: `\`[K in keyof T]\` iterates over a type's keys to produce a new type: this is how Partial, Readonly and Record are implemented. Reach for it when the built-in utilities aren't enough.`,
          },
        },
        {
          id: 'ts-template-literal-types',
          title: { fr: 'Template literal types', en: 'Template literal types' },
          code: `type Evenement = "click" | "focus";
type Handler = \`on\${Capitalize<Evenement>}\`; // "onClick" | "onFocus"

type Route = \`/users/\${number}\`;
const ok: Route = "/users/42";   // OK
const ko: Route = "/users/abc";  // Erreur`,
          note: {
            fr: `Les template literal types construisent des unions de chaînes par combinaison : noms d'événements, routes, clés CSS. Combinés à Capitalize/Uppercase, ils typent des conventions de nommage entières.`,
            en: `Template literal types build string unions by combination: event names, routes, CSS keys. Combined with Capitalize/Uppercase, they can type entire naming conventions.`,
          },
        },
      ],
    },
    {
      id: 'functions',
      title: { fr: 'Fonctions & objets', en: 'Functions & objects' },
      items: [
        {
          id: 'ts-optional-default-params',
          title: { fr: 'Paramètres optionnels & défauts', en: 'Optional & default params' },
          code: `function saluer(nom: string, titre?: string) {
  return titre ? \`\${titre} \${nom}\` : nom; // titre: string | undefined
}

function paginer(page = 1, taille = 20) { /* types inférés : number */ }

paginer();        // OK
paginer(2);       // OK`,
          note: {
            fr: `\`?\` ajoute | undefined au paramètre et le rend omissible ; une valeur par défaut fait pareil tout en garantissant une valeur dans le corps (plus de | undefined à gérer).`,
            en: `\`?\` adds | undefined to the parameter and makes it omissible; a default value does the same while guaranteeing a value inside the body (no | undefined left to handle).`,
          },
        },
        {
          id: 'ts-readonly',
          title: { fr: 'readonly', en: 'readonly' },
          code: `interface Config {
  readonly apiUrl: string;
}

function traiter(liste: readonly number[]) {
  liste.push(4);        // Erreur : push n'existe pas sur readonly
  return [...liste, 4]; // OK : on copie au lieu de muter
}`,
          note: {
            fr: `readonly interdit la réassignation à la compilation seulement (aucun gel à l'exécution, contrairement à Object.freeze). Typer les paramètres en readonly documente qu'une fonction ne mute pas son entrée.`,
            en: `readonly forbids reassignment at compile time only (no runtime freeze, unlike Object.freeze). Typing parameters as readonly documents that a function does not mutate its input.`,
          },
        },
        {
          id: 'ts-unknown-vs-any',
          title: { fr: 'unknown vs any', en: 'unknown vs any' },
          code: `function parser(json: string): unknown {
  return JSON.parse(json); // unknown, pas any
}

const data = parser('{"x":1}');
data.x;                            // Erreur : il faut vérifier d'abord
if (typeof data === "object" && data !== null && "x" in data) {
  // ici on peut travailler en sécurité
}`,
          note: {
            fr: `any désactive le typage et contamine tout ce qu'il touche ; unknown accepte tout mais force un narrowing avant usage. Règle simple : aux frontières (JSON, API, catch), toujours unknown.`,
            en: `any disables typing and contaminates everything it touches; unknown accepts anything but forces narrowing before use. Simple rule: at boundaries (JSON, API, catch), always unknown.`,
          },
        },
        {
          id: 'ts-overloads',
          title: { fr: 'Surcharges de fonction', en: 'Function overloads' },
          code: `function creer(type: "div"): HTMLDivElement;
function creer(type: "canvas"): HTMLCanvasElement;
function creer(type: string): HTMLElement {
  return document.createElement(type); // implémentation unique
}

const c = creer("canvas"); // HTMLCanvasElement — type précis`,
          note: {
            fr: `Les surcharges donnent un type de retour différent selon les arguments. La signature d'implémentation n'est pas visible des appelants. Souvent, une union ou un générique conditionnel suffit — gardez les overloads pour les cas vraiment distincts.`,
            en: `Overloads give a different return type depending on the arguments. The implementation signature is invisible to callers. Often a union or conditional generic is enough — keep overloads for genuinely distinct cases.`,
          },
        },
        {
          id: 'ts-non-null-assertion',
          title: { fr: 'Assertion non-null !', en: 'Non-null assertion !' },
          code: `const input = document.querySelector("input"); // HTMLInputElement | null

input!.focus();   // ! : "je jure que ce n'est pas null"
// → TypeError à l'exécution si l'élément n'existe pas !

if (input) input.focus(); // version sûre : narrowing explicite`,
          note: {
            fr: `\`!\` supprime null/undefined du type sans aucune vérification réelle : c'est une promesse faite au compilateur, pas une protection. Préférez un if, \`?.\` ou un throw explicite ; réservez \`!\` aux cas garantis par construction.`,
            en: `\`!\` removes null/undefined from the type with zero actual checking: it's a promise to the compiler, not a protection. Prefer an if, \`?.\` or an explicit throw; reserve \`!\` for cases guaranteed by construction.`,
          },
        },
      ],
    },
    {
      id: 'config-gotchas',
      title: { fr: 'tsconfig & pièges', en: 'tsconfig & gotchas' },
      items: [
        {
          id: 'ts-strict-mode',
          title: { fr: 'strict: true', en: 'strict: true' },
          code: `// tsconfig.json — la base non négociable
{
  "compilerOptions": {
    "strict": true,              // active toute la famille strict*
    "noUncheckedIndexedAccess": true // arr[i] devient T | undefined
  }
}`,
          note: {
            fr: `Sans strict, TypeScript laisse passer null/undefined et les any implicites : on perd l'essentiel de la valeur de l'outil. Activez-le dès le premier jour ; le rétrofitter sur un gros projet est douloureux.`,
            en: `Without strict, TypeScript lets null/undefined and implicit any slip through: most of the tool's value is lost. Enable it from day one; retrofitting it onto a large project is painful.`,
          },
        },
        {
          id: 'ts-type-erasure',
          title: { fr: "Les types disparaissent à l'exécution", en: 'Types are erased at runtime' },
          code: `interface User { nom: string }

function charger(json: string) {
  return JSON.parse(json) as User; // aucune vérification réelle !
}

const u = charger('{"prenom":"Ada"}'); // compile… u.nom === undefined
// Validez les données externes (zod, valibot, guards manuels)`,
          note: {
            fr: `Les types sont effacés à la compilation : \`as User\` ne valide rien à l'exécution. Toute donnée externe (API, JSON, localStorage) doit être validée par du vrai code — c'est le piège n°1 des débutants TS.`,
            en: `Types are erased at compile time: \`as User\` validates nothing at runtime. Any external data (API, JSON, localStorage) must be validated by real code — the number one trap for TS beginners.`,
          },
        },
        {
          id: 'ts-enum-vs-union',
          title: { fr: 'enum vs union de littéraux', en: 'enum vs literal union' },
          code: `enum Statut { Actif = "actif", Inactif = "inactif" } // génère du JS

// Alternative sans coût à l'exécution :
const STATUTS = ["actif", "inactif"] as const;
type Statut2 = (typeof STATUTS)[number]; // "actif" | "inactif"
// + STATUTS reste itérable pour les <select>, validations, etc.`,
          note: {
            fr: `enum génère un objet JavaScript à l'exécution et a des comportements surprenants (enums numériques peu sûrs). Le pattern \`as const\` + union donne les mêmes garanties sans code émis, et la liste reste itérable.`,
            en: `enum emits a JavaScript object at runtime and has surprising behaviors (numeric enums are unsound). The \`as const\` + union pattern gives the same guarantees with no emitted code, and the list stays iterable.`,
          },
        },
        {
          id: 'ts-import-type',
          title: { fr: 'import type', en: 'import type' },
          code: `import type { User } from "./models";       // effacé à la compilation
import { type Config, charger } from "./api"; // mix valeur + type

const u: User = await charger();`,
          note: {
            fr: `import type garantit que l'import disparaît du JS émis : pas de dépendance circulaire fantôme, pas d'effet de bord importé. Indispensable avec verbatimModuleSyntax ou les transpileurs fichier-par-fichier (esbuild, SWC, Vite).`,
            en: `import type guarantees the import vanishes from the emitted JS: no phantom circular dependency, no imported side effect. Essential with verbatimModuleSyntax or per-file transpilers (esbuild, SWC, Vite).`,
          },
        },
        {
          id: 'ts-double-assertion',
          title: { fr: 'Double assertion (as unknown as)', en: 'Double assertion (as unknown as)' },
          code: `const valeur = "42" as number;            // Erreur : types trop éloignés
const force = "42" as unknown as number;  // compile… et ment

// Mieux : convertir réellement
const vrai = Number("42");                // number, pour de vrai`,
          note: {
            fr: `\`as unknown as T\` court-circuite toutes les vérifications : le compilateur accepte n'importe quoi et le bug explose à l'exécution. Si vous en avez besoin, c'est presque toujours le signe qu'il faut convertir ou valider la donnée.`,
            en: `\`as unknown as T\` bypasses every check: the compiler accepts anything and the bug blows up at runtime. If you need it, it's almost always a sign you should convert or validate the data instead.`,
          },
        },
        {
          id: 'ts-catch-unknown',
          title: { fr: 'catch et unknown', en: 'catch and unknown' },
          code: `try {
  await fetch("/api");
} catch (e) {           // e: unknown en strict (useUnknownInCatchVariables)
  if (e instanceof Error) {
    console.error(e.message); // accès sûr
  } else {
    console.error(String(e)); // on peut throw n'importe quoi en JS
  }
}`,
          note: {
            fr: `En JavaScript on peut lancer n'importe quelle valeur, pas seulement des Error : TS type donc e en unknown. Le réflexe \`instanceof Error\` avant d'accéder à .message évite un second crash dans le handler d'erreur.`,
            en: `JavaScript lets you throw any value, not just Errors: TS therefore types e as unknown. The \`instanceof Error\` reflex before touching .message avoids a second crash inside the error handler.`,
          },
        },
      ],
    },
    {
      id: 'ts-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'ts-bp-no-i-prefix',
          title: { fr: 'Pas de préfixe I pour les interfaces', en: 'No I prefix for interfaces' },
          code: `interface User { id: string; name: string }   // ✓
interface IUser { id: string; name: string }  // ✗ convention C#/Java`,
          note: {
            fr: `Le préfixe I vient de C#/Java ; en TS l'outillage (hover, autocomplete) distingue déjà types et valeurs, le préfixe n'ajoute que du bruit visuel.`,
            en: `The I prefix comes from C#/Java; TS tooling (hover, autocomplete) already distinguishes types from values, so the prefix only adds visual noise.`,
          },
        },
        {
          id: 'ts-bp-assert-never-helper',
          title: { fr: "Centraliser les vérifications d'exhaustivité", en: 'Centralize exhaustiveness checks' },
          code: `function assertNever(x: never): never {
  throw new Error(\`Cas non géré: \${JSON.stringify(x)}\`);
}
// switch (f.type) { ... default: return assertNever(f) }`,
          note: {
            fr: `Une fonction assertNever réutilisable évite de retaper le piège 'never' dans chaque switch et donne un message d'erreur utile si un cas est oublié à l'exécution.`,
            en: `A reusable assertNever function avoids retyping the never trick in every switch and gives a useful runtime error message when a case is missed.`,
          },
        },
        {
          id: 'ts-bp-readonly-by-default',
          title: { fr: 'readonly par défaut sur les structures de données', en: 'readonly by default on data structures' },
          code: `interface Config {
  readonly apiUrl: string;
  readonly retries: readonly number[];
}`,
          note: {
            fr: `readonly documente l'intention et bloque les réassignations accidentelles à la compilation ; le retirer explicitement signale clairement qu'une mutation est voulue.`,
            en: `readonly documents intent and blocks accidental reassignment at compile time; explicitly removing it clearly signals that mutation is intended.`,
          },
        },
        {
          id: 'ts-bp-derive-dont-duplicate',
          title: { fr: 'Dériver les types plutôt que les dupliquer', en: 'Derive types instead of duplicating them' },
          code: `type UserPatch = Partial<Pick<User, "name" | "email">>;
// jamais : interface UserPatch { name?: string; email?: string }`,
          note: {
            fr: `Dupliquer manuellement une interface partielle se désynchronise silencieusement du type source au premier renommage ; dériver via Pick/Partial garde un lien vivant.`,
            en: `Manually duplicating a partial interface silently drifts from the source type on the first rename; deriving via Pick/Partial keeps a live link.`,
          },
        },
        {
          id: 'ts-bp-validate-external-data',
          title: { fr: 'Valider les données aux frontières', en: 'Validate data at runtime boundaries' },
          code: `import { z } from "zod";
const UserSchema = z.object({ id: z.string(), age: z.number() });
const user = UserSchema.parse(await res.json()); // valide vraiment`,
          note: {
            fr: `Un type TS décrit une intention de compilation, pas une garantie d'exécution : sans validation réelle (zod, valibot), une API qui change de forme corrompt silencieusement l'app.`,
            en: `A TS type expresses a compile-time intent, not a runtime guarantee: without real validation (zod, valibot), an API that changes shape silently corrupts the app.`,
          },
        },
      ],
    },
  ],
};
