/**
 * Cheatsheet JavaScript — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'js',
  lang: 'js',
  sections: [
    {
      id: 'types',
      title: { fr: 'Types & coercition', en: 'Types & coercion' },
      items: [
        {
          id: 'js-typeof',
          title: { fr: 'typeof (et le piège null)', en: 'typeof (and the null trap)' },
          code: `typeof 42          // 'number'\ntypeof 'a'         // 'string'\ntypeof undefined   // 'undefined'\ntypeof null        // 'object'  (!) bug historique\ntypeof [1, 2]      // 'object'  — utiliser Array.isArray\ntypeof (() => {})  // 'function'`,
          note: {
            fr: `typeof null renvoie 'object' depuis 1995 et ne sera jamais corrigé. Pour les tableaux, utilisez Array.isArray().`,
            en: `typeof null has returned 'object' since 1995 and will never be fixed. For arrays, use Array.isArray().`,
          },
        },
        {
          id: 'js-equality',
          title: { fr: '=== plutôt que ==', en: '=== rather than ==' },
          code: `'' == '0'   // false\n0  == ''    // true  (!) coercition\n0  === ''   // false — toujours ===\nnull == undefined   // true (seul cas utile de ==)\nnull === undefined  // false`,
          note: {
            fr: `== applique des coercitions non transitives ; === compare type + valeur. Seule exception tolérée : x == null pour tester null ET undefined.`,
            en: `== applies non-transitive coercions; === compares type + value. Only tolerated exception: x == null to test both null AND undefined.`,
          },
        },
        {
          id: 'js-truthy-falsy',
          title: { fr: 'Truthy / falsy : la liste', en: 'Truthy / falsy: the list' },
          code: `// Les 7 valeurs falsy — tout le reste est truthy :\n// false, 0, 0n, '', null, undefined, NaN\nif ([])   console.log('truthy')  // tableau vide = truthy (!)\nif ({})   console.log('truthy')  // objet vide = truthy (!)\nif ('0')  console.log('truthy')  // chaîne non vide = truthy`,
          note: {
            fr: `Apprendre la liste des falsy par cœur évite 90 % des surprises : [] et {} sont truthy, '0' aussi.`,
            en: `Learning the falsy list by heart avoids 90% of surprises: [] and {} are truthy, so is '0'.`,
          },
        },
        {
          id: 'js-nan',
          title: { fr: 'NaN & Number.isNaN', en: 'NaN & Number.isNaN' },
          code: `NaN === NaN            // false — NaN n'est égal à rien\nNumber.isNaN(NaN)      // true  — le bon test\nisNaN('abc')           // true  (!) coercit en Number d'abord\nNumber.isNaN('abc')    // false — pas de coercition\nObject.is(NaN, NaN)    // true  — alternative`,
          note: {
            fr: `Le isNaN global coercit son argument (isNaN('abc') === true) ; Number.isNaN ne dit vrai que pour la vraie valeur NaN.`,
            en: `Global isNaN coerces its argument (isNaN('abc') === true); Number.isNaN is only true for the actual NaN value.`,
          },
        },
        {
          id: 'js-conversions',
          title: { fr: 'Conversions explicites', en: 'Explicit conversions' },
          code: `Number('42')      // 42\nNumber('42px')    // NaN — strict\nparseInt('42px')  // 42  — tolérant (préciser la base : parseInt(s, 10))\nString(42)        // '42'\nBoolean('')       // false\n+'3' + 1          // 4 — éviter, préférer Number()`,
          note: {
            fr: `Préférez Number()/String()/Boolean() aux astuces implicites (+x, ''+x, !!x) : même résultat mais l'intention est lisible.`,
            en: `Prefer Number()/String()/Boolean() over implicit tricks (+x, ''+x, !!x): same result but the intent is readable.`,
          },
        },
      ],
    },
    {
      id: 'strings',
      title: { fr: 'Chaînes', en: 'Strings' },
      items: [
        {
          id: 'js-template-literals',
          title: { fr: 'Template literals', en: 'Template literals' },
          code: `const nom = 'Ada';\nconst msg = \`Bonjour \${nom} !\`;        // interpolation\nconst multi = \`ligne 1\nligne 2\`;                              // multi-lignes natif\nconst calc = \`total : \${2 + 3} €\`;     // expression quelconque`,
          note: {
            fr: `Les backticks permettent interpolation et multi-lignes — finies les concaténations avec +. L'expression dans \${} peut être n'importe quoi.`,
            en: `Backticks enable interpolation and multi-line strings — no more + concatenation. The expression inside \${} can be anything.`,
          },
        },
        {
          id: 'js-slice-split-replace',
          title: { fr: 'slice / split / replaceAll', en: 'slice / split / replaceAll' },
          code: `'JavaScript'.slice(0, 4)        // 'Java' (fin exclue)\n'JavaScript'.slice(-6)          // 'Script' (index négatif ok)\n'a,b,c'.split(',')              // ['a', 'b', 'c']\n'a-b-a'.replace('a', 'X')       // 'X-b-a' — 1re occurrence seulement\n'a-b-a'.replaceAll('a', 'X')    // 'X-b-X' (ES2021)`,
          note: {
            fr: `replace() avec une chaîne ne remplace que la première occurrence — replaceAll() ou une regex /g pour tout remplacer.`,
            en: `replace() with a string only replaces the first occurrence — use replaceAll() or a /g regex to replace everything.`,
          },
        },
        {
          id: 'js-pad-trim',
          title: { fr: 'padStart / padEnd / trim', en: 'padStart / padEnd / trim' },
          code: `'5'.padStart(2, '0')      // '05' — formatage d'heures\n'7'.padEnd(4, '.')        // '7...'\n'  ok  '.trim()           // 'ok'\n'  ok  '.trimStart()      // 'ok  '\n'  ok  '.trimEnd()        // '  ok'`,
          note: {
            fr: `padStart est l'outil idéal pour les zéros de tête (heures, identifiants) ; trim nettoie les saisies utilisateur avant validation.`,
            en: `padStart is the go-to tool for leading zeros (times, IDs); trim cleans user input before validation.`,
          },
        },
        {
          id: 'js-includes-startswith',
          title: { fr: 'includes / startsWith / endsWith', en: 'includes / startsWith / endsWith' },
          code: `'JavaScript'.includes('Script')    // true\n'JavaScript'.startsWith('Java')    // true\n'image.png'.endsWith('.png')       // true\n// avant ES6 : s.indexOf(x) !== -1 — plus lisible aujourd'hui :\nconst estImage = nom => nom.endsWith('.png') || nom.endsWith('.jpg');`,
          note: {
            fr: `Ces trois méthodes remplacent les comparaisons indexOf() !== -1 : booléen direct, intention claire. Sensibles à la casse.`,
            en: `These three methods replace indexOf() !== -1 comparisons: direct boolean, clear intent. Case-sensitive.`,
          },
        },
        {
          id: 'js-string-misc',
          title: { fr: 'repeat / at / toLowerCase', en: 'repeat / at / toLowerCase' },
          code: `'ab'.repeat(3)            // 'ababab'\n'hello'.at(-1)            // 'o' — dernier caractère (ES2022)\n'HELLO'.toLowerCase()     // 'hello'\n'héllo'.localeCompare('hello')  // comparaison sensible à la locale\n'a'.codePointAt(0)        // 97`,
          note: {
            fr: `at(-1) (ES2022) évite le verbeux s[s.length - 1]. Pour trier des chaînes accentuées, localeCompare est plus fiable que <.`,
            en: `at(-1) (ES2022) avoids the verbose s[s.length - 1]. To sort accented strings, localeCompare is more reliable than <.`,
          },
        },
      ],
    },
    {
      id: 'arrays',
      title: { fr: 'Tableaux', en: 'Arrays' },
      items: [
        {
          id: 'js-map-filter-reduce',
          title: { fr: 'map / filter / reduce', en: 'map / filter / reduce' },
          code: `const nums = [1, 2, 3, 4];\nnums.map(n => n * 2)          // [2, 4, 6, 8] — transformer\nnums.filter(n => n % 2 === 0) // [2, 4]       — garder\nnums.reduce((acc, n) => acc + n, 0)  // 10    — agréger\n// chaînables :\nnums.filter(n => n > 1).map(n => n * 10)  // [20, 30, 40]`,
          note: {
            fr: `Le trio fondamental : map transforme, filter sélectionne, reduce agrège. Aucun ne modifie le tableau d'origine.`,
            en: `The fundamental trio: map transforms, filter selects, reduce aggregates. None mutates the original array.`,
          },
        },
        {
          id: 'js-find-some-every',
          title: { fr: 'find / some / every', en: 'find / some / every' },
          code: `const users = [{ id: 1, actif: true }, { id: 2, actif: false }];\nusers.find(u => u.id === 2)        // { id: 2, actif: false }\nusers.findIndex(u => u.id === 2)   // 1\nusers.some(u => u.actif)           // true  — au moins un\nusers.every(u => u.actif)          // false — tous`,
          note: {
            fr: `find renvoie le premier élément (ou undefined), some/every répondent oui/non. Tous s'arrêtent dès que la réponse est connue.`,
            en: `find returns the first element (or undefined), some/every answer yes/no. All short-circuit as soon as the answer is known.`,
          },
        },
        {
          id: 'js-flat-flatmap',
          title: { fr: 'flat / flatMap', en: 'flat / flatMap' },
          code: `[1, [2, [3, [4]]]].flat()         // [1, 2, [3, [4]]] — 1 niveau\n[1, [2, [3, [4]]]].flat(Infinity) // [1, 2, 3, 4]\n// flatMap = map + flat(1) en une passe :\n['a b', 'c'].flatMap(s => s.split(' '))  // ['a', 'b', 'c']`,
          note: {
            fr: `flat() n'aplatit qu'un niveau par défaut — passer Infinity pour tout aplatir. flatMap est idéal pour produire 0..n éléments par entrée.`,
            en: `flat() only flattens one level by default — pass Infinity to flatten everything. flatMap is ideal for producing 0..n elements per input.`,
          },
        },
        {
          id: 'js-sort',
          title: { fr: 'sort : le piège lexicographique', en: 'sort: the lexicographic trap' },
          code: `[10, 1, 5].sort()                 // [1, 10, 5] (!) tri en chaînes\n[10, 1, 5].sort((a, b) => a - b)  // [1, 5, 10] — comparateur numérique\n// sort MUTE le tableau ; copie immuable (ES2023) :\nconst triés = [10, 1, 5].toSorted((a, b) => a - b);\n// chaînes accentuées :\n['éb', 'ea'].sort((a, b) => a.localeCompare(b));`,
          note: {
            fr: `Sans comparateur, sort convertit en chaînes : [10, 1, 5] donne [1, 10, 5]. Et sort mute le tableau — toSorted (ES2023) renvoie une copie.`,
            en: `Without a comparator, sort converts to strings: [10, 1, 5] yields [1, 10, 5]. And sort mutates the array — toSorted (ES2023) returns a copy.`,
          },
        },
        {
          id: 'js-at-slice',
          title: { fr: 'at(-1) / slice', en: 'at(-1) / slice' },
          code: `const arr = [1, 2, 3, 4];\narr.at(-1)        // 4 — dernier élément (ES2022)\narr.at(-2)        // 3\narr.slice(1, 3)   // [2, 3] — copie partielle, fin exclue\narr.slice()       // copie superficielle complète\narr.slice(-2)     // [3, 4]`,
          note: {
            fr: `at(-1) remplace arr[arr.length - 1]. slice copie sans muter — contrairement à splice qui modifie le tableau en place.`,
            en: `at(-1) replaces arr[arr.length - 1]. slice copies without mutating — unlike splice, which modifies the array in place.`,
          },
        },
        {
          id: 'js-array-spread',
          title: { fr: 'Spread & déstructuration', en: 'Spread & destructuring' },
          code: `const a = [1, 2], b = [3, 4];\nconst fusion = [...a, ...b];        // [1, 2, 3, 4]\nconst copie = [...a];               // copie superficielle\nconst [premier, ...reste] = fusion; // premier = 1, reste = [2, 3, 4]\nconst [x, , z] = [1, 2, 3];         // x = 1, z = 3 — trou possible\nconst max = Math.max(...fusion);    // 4`,
          note: {
            fr: `Le spread fusionne et copie sans muter ; la déstructuration extrait par position. La copie reste superficielle (les objets imbriqués sont partagés).`,
            en: `Spread merges and copies without mutating; destructuring extracts by position. The copy stays shallow (nested objects are shared).`,
          },
        },
      ],
    },
    {
      id: 'objects',
      title: { fr: 'Objets', en: 'Objects' },
      items: [
        {
          id: 'js-obj-destructuring',
          title: { fr: 'Déstructuration (+ renommage, défauts)', en: 'Destructuring (+ rename, defaults)' },
          code: `const user = { nom: 'Ada', age: 36 };\nconst { nom, age } = user;            // nom = 'Ada', age = 36\nconst { nom: pseudo } = user;         // renommage : pseudo = 'Ada'\nconst { ville = 'Paris' } = user;     // défaut : ville = 'Paris'\n// directement dans les paramètres :\nfunction saluer({ nom, ville = '?' }) { return \`\${nom} (\${ville})\`; }`,
          note: {
            fr: `La syntaxe { prop: nouveauNom = défaut } combine renommage et valeur par défaut. Très utile en signature de fonction pour des options nommées.`,
            en: `The { prop: newName = default } syntax combines renaming and default value. Very useful in function signatures for named options.`,
          },
        },
        {
          id: 'js-obj-spread-rest',
          title: { fr: 'Spread / rest sur objets', en: 'Object spread / rest' },
          code: `const base = { a: 1, b: 2 };\nconst étendu = { ...base, c: 3 };      // { a: 1, b: 2, c: 3 }\nconst surchargé = { ...base, a: 99 };  // le dernier gagne : a = 99\nconst { a, ...sansA } = étendu;        // rest : sansA = { b: 2, c: 3 }\nconst maj = { ...base, ...(actif && { statut: 'on' }) }; // ajout conditionnel`,
          note: {
            fr: `En cas de clés en double, la dernière écrase — pratique pour des overrides de config. Le rest ...sansA permet d'exclure une propriété sans muter.`,
            en: `On duplicate keys, the last one wins — handy for config overrides. Rest ...withoutA lets you exclude a property without mutating.`,
          },
        },
        {
          id: 'js-optional-chaining',
          title: { fr: 'Optional chaining ?. et ??', en: 'Optional chaining ?. and ??' },
          code: `const user = { profil: null };\nuser.profil?.email           // undefined — pas d'erreur\nuser.adresse?.ville          // undefined même si adresse absente\nuser.notifier?.()            // appel seulement si la méthode existe\nconst port = config.port ?? 3000;  // ?? : défaut si null/undefined\nconst n = 0 ?? 42;           // 0 (!) — || aurait donné 42`,
          note: {
            fr: `?. court-circuite sur null/undefined sans lever d'erreur. ?? ne remplace que null/undefined — contrairement à || qui écrase aussi 0, '' et false.`,
            en: `?. short-circuits on null/undefined without throwing. ?? only replaces null/undefined — unlike ||, which also overrides 0, '' and false.`,
          },
        },
        {
          id: 'js-object-entries',
          title: { fr: 'Object.keys / entries / fromEntries', en: 'Object.keys / entries / fromEntries' },
          code: `const prix = { pomme: 2, poire: 3 };\nObject.keys(prix)     // ['pomme', 'poire']\nObject.values(prix)   // [2, 3]\nObject.entries(prix)  // [['pomme', 2], ['poire', 3]]\n// transformer un objet via entries -> map -> fromEntries :\nconst doublés = Object.fromEntries(\n  Object.entries(prix).map(([k, v]) => [k, v * 2])\n); // { pomme: 4, poire: 6 }`,
          note: {
            fr: `entries/fromEntries forment un aller-retour objet <-> tableau de paires : on profite de map/filter sur les objets.`,
            en: `entries/fromEntries form a round trip between object and array of pairs: you get map/filter on objects.`,
          },
        },
        {
          id: 'js-structuredclone',
          title: { fr: 'structuredClone vs spread', en: 'structuredClone vs spread' },
          code: `const orig = { nom: 'Ada', adresse: { ville: 'Paris' } };\nconst shallow = { ...orig };          // copie SUPERFICIELLE\nshallow.adresse.ville = 'Lyon';\norig.adresse.ville                    // 'Lyon' (!) objet partagé\nconst deep = structuredClone(orig);   // copie PROFONDE\ndeep.adresse.ville = 'Tokyo';\norig.adresse.ville                    // 'Lyon' — indépendant`,
          note: {
            fr: `Le spread ne copie que le premier niveau : les objets imbriqués restent partagés. structuredClone clone en profondeur, mais lève une DataCloneError si l'objet contient une fonction (il ne l'ignore pas silencieusement).`,
            en: `Spread only copies the first level: nested objects stay shared. structuredClone deep-clones, but throws a DataCloneError if the object contains a function (it does not silently ignore it).`,
          },
        },
      ],
    },
    {
      id: 'functions',
      title: { fr: 'Fonctions & closures', en: 'Functions & closures' },
      items: [
        {
          id: 'js-arrow-vs-function',
          title: { fr: 'Arrow vs function (this)', en: 'Arrow vs function (this)' },
          code: `const compteur = {\n  n: 0,\n  // function : this = l'objet appelant — ok pour une méthode\n  incr() { this.n++; },\n  // arrow : this hérité du contexte de création — PAS l'objet (!)\n  bad: () => { /* this.n serait undefined ici */ },\n  // arrow utile DANS une méthode (callback garde le this) :\n  tousLes(ms) { setInterval(() => this.incr(), ms); },\n};`,
          note: {
            fr: `Les arrows n'ont pas de this propre : elles capturent celui du contexte englobant. Méthodes d'objet = raccourci incr(), callbacks internes = arrow.`,
            en: `Arrows have no own this: they capture the enclosing context's. Object methods = shorthand incr(), inner callbacks = arrow.`,
          },
        },
        {
          id: 'js-default-rest-params',
          title: { fr: 'Paramètres par défaut & rest', en: 'Default & rest parameters' },
          code: `function saluer(nom = 'inconnu') { return \`Salut \${nom}\`; }\nsaluer()            // 'Salut inconnu'\nsaluer(undefined)   // 'Salut inconnu' — undefined déclenche le défaut\nsaluer(null)        // 'Salut null' (!) null ne le déclenche pas\nfunction somme(...nums) { return nums.reduce((a, b) => a + b, 0); }\nsomme(1, 2, 3)      // 6 — rest collecte les arguments en tableau`,
          note: {
            fr: `Seul undefined active la valeur par défaut — null passe tel quel. Le rest ...nums remplace l'objet arguments des vieilles fonctions.`,
            en: `Only undefined triggers the default value — null passes through. Rest ...nums replaces the legacy arguments object.`,
          },
        },
        {
          id: 'js-closure-counter',
          title: { fr: 'Closure : le compteur', en: 'Closure: the counter' },
          code: `function créerCompteur() {\n  let n = 0;                 // variable privée, capturée\n  return () => ++n;          // la closure garde l'accès à n\n}\nconst c1 = créerCompteur();\nconst c2 = créerCompteur();  // état indépendant\nc1(); c1();   // 2\nc2();         // 1 — chaque appel crée sa propre portée`,
          note: {
            fr: `Une closure « se souvient » des variables de sa portée de création, même après le retour de la fonction. C'est la base de l'encapsulation en JS.`,
            en: `A closure "remembers" the variables of its creation scope, even after the function has returned. It is the basis of encapsulation in JS.`,
          },
        },
        {
          id: 'js-iife-module',
          title: { fr: 'IIFE / module pattern', en: 'IIFE / module pattern' },
          code: `// IIFE : exécutée immédiatement, portée isolée\nconst api = (() => {\n  let secret = 0;                       // invisible de l'extérieur\n  return {\n    incr: () => ++secret,\n    lire: () => secret,\n  };\n})();\napi.incr(); api.lire();  // 1 — secret reste privé`,
          note: {
            fr: `Le module pattern expose une API publique tout en gardant l'état privé via closure. Aujourd'hui les modules ES (import/export) couvrent l'essentiel du besoin.`,
            en: `The module pattern exposes a public API while keeping state private via closure. Nowadays ES modules (import/export) cover most of this need.`,
          },
        },
      ],
    },
    {
      id: 'async',
      title: { fr: 'Asynchrone', en: 'Async' },
      items: [
        {
          id: 'js-promise-basics',
          title: { fr: 'Promise de base', en: 'Promise basics' },
          code: `const attendre = ms => new Promise(resolve => setTimeout(resolve, ms));\nattendre(500)\n  .then(() => console.log('500 ms plus tard'))\n  .catch(err => console.error(err))\n  .finally(() => console.log('toujours exécuté'));\n// états : pending -> fulfilled OU rejected (définitif)`,
          note: {
            fr: `Une promesse ne se résout qu'une fois : pending puis fulfilled ou rejected, sans retour en arrière. then/catch renvoient une promesse — d'où le chaînage.`,
            en: `A promise settles only once: pending then fulfilled or rejected, with no going back. then/catch return a promise — hence chaining.`,
          },
        },
        {
          id: 'js-async-await',
          title: { fr: 'async/await + try/catch', en: 'async/await + try/catch' },
          code: `async function charger(id) {\n  try {\n    const user = await getUser(id);     // pause jusqu'à résolution\n    const posts = await getPosts(user); // dépend de user : séquentiel ok\n    return { user, posts };\n  } catch (err) {\n    console.error('échec :', err);      // rejets ET throws synchrones\n    throw err;                          // re-propager si non géré ici\n  }\n}`,
          note: {
            fr: `await suspend la fonction async sans bloquer le thread. try/catch attrape à la fois les rejets de promesses et les erreurs synchrones.`,
            en: `await suspends the async function without blocking the thread. try/catch catches both promise rejections and synchronous errors.`,
          },
        },
        {
          id: 'js-promise-combinators',
          title: { fr: 'Promise.all / allSettled / race', en: 'Promise.all / allSettled / race' },
          code: `// all : tout ou rien — rejette dès le 1er échec\nconst [a, b] = await Promise.all([fetchA(), fetchB()]);\n// allSettled : attend tout, jamais de rejet global\nconst résultats = await Promise.allSettled([fetchA(), fetchB()]);\n// -> [{ status: 'fulfilled', value }, { status: 'rejected', reason }]\n// race : la 1re réglée gagne (succès OU échec) — ex. timeout\nconst rapide = await Promise.race([fetchA(), timeout(5000)]);`,
          note: {
            fr: `all pour des dépendances obligatoires, allSettled pour collecter succès et échecs, race pour un timeout ou « le premier qui répond ».`,
            en: `all for mandatory dependencies, allSettled to collect successes and failures, race for a timeout or "first to respond".`,
          },
        },
        {
          id: 'js-fetch-json',
          title: { fr: 'fetch + JSON', en: 'fetch + JSON' },
          code: `const res = await fetch('/api/users');\nif (!res.ok) {                       // (!) fetch ne rejette PAS sur 404/500\n  throw new Error(\`HTTP \${res.status}\`);\n}\nconst data = await res.json();       // .json() est aussi async\n// envoi :\nawait fetch('/api/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ nom: 'Ada' }),\n});`,
          note: {
            fr: `fetch ne rejette que sur erreur réseau — un 404 ou 500 est une réponse « réussie » : toujours vérifier res.ok. res.json() renvoie une promesse.`,
            en: `fetch only rejects on network errors — a 404 or 500 is a "successful" response: always check res.ok. res.json() returns a promise.`,
          },
        },
        {
          id: 'js-await-loop',
          title: { fr: 'await dans une boucle : le piège', en: 'await in a loop: the trap' },
          code: `// SÉQUENTIEL — 3 requêtes l'une après l'autre (lent) :\nfor (const id of ids) {\n  résultats.push(await fetchUser(id));\n}\n// PARALLÈLE — lancées ensemble, attendues ensemble :\nconst résultats = await Promise.all(ids.map(id => fetchUser(id)));`,
          note: {
            fr: `await dans un for sérialise les appels : 3 x 200 ms = 600 ms. map + Promise.all les lance en parallèle (~200 ms) — sauf si l'ordre séquentiel est voulu.`,
            en: `await inside a for loop serializes calls: 3 x 200 ms = 600 ms. map + Promise.all launches them in parallel (~200 ms) — unless sequential order is intended.`,
          },
        },
        {
          id: 'js-event-loop',
          title: { fr: 'Event loop : microtâches vs macrotâches', en: 'Event loop: microtasks vs macrotasks' },
          code: `console.log('1')                        // synchrone\nsetTimeout(() => console.log('2'), 0)   // macrotâche (timer)\nPromise.resolve().then(() => console.log('3')) // microtâche\nconsole.log('4')                        // synchrone\n// ordre réel : 1, 4, 3, 2 — les microtâches se vident avant la macrotâche suivante`,
          note: {
            fr: `Après chaque tâche synchrone, la file des microtâches (Promise.then, queueMicrotask) se vide entièrement avant qu'une seule macrotâche (setTimeout, I/O) ne s'exécute — d'où l'ordre 1, 4, 3, 2.`,
            en: `After each synchronous task, the microtask queue (Promise.then, queueMicrotask) drains completely before a single macrotask (setTimeout, I/O) runs — hence the 1, 4, 3, 2 order.`,
          },
        },
      ],
    },
    {
      id: 'misc',
      title: { fr: 'Map/Set & divers', en: 'Map/Set & misc' },
      items: [
        {
          id: 'js-map-vs-object',
          title: { fr: 'Map vs objet', en: 'Map vs object' },
          code: `const m = new Map();\nm.set('a', 1).set(42, 'ok');   // clés de N'IMPORTE quel type\nm.get(42)                      // 'ok' — un objet aurait stringifié la clé\nm.has('a')                     // true\nm.size                         // 2 — direct (vs Object.keys(o).length)\nfor (const [clé, val] of m) { /* ordre d'insertion garanti */ }`,
          note: {
            fr: `Map accepte toute valeur comme clé (objets inclus), expose size et itère dans l'ordre d'insertion. L'objet reste idéal pour des structures fixes type record.`,
            en: `Map accepts any value as a key (objects included), exposes size and iterates in insertion order. Plain objects remain ideal for fixed record-like structures.`,
          },
        },
        {
          id: 'js-set-dedupe',
          title: { fr: 'Set : dédoublonnage', en: 'Set: deduplication' },
          code: `const uniques = [...new Set([1, 2, 2, 3, 1])];  // [1, 2, 3]\nconst vus = new Set();\nvus.add('a'); vus.add('a');     // ignoré : déjà présent\nvus.has('a')                    // true — recherche O(1)\nvus.size                        // 1`,
          note: {
            fr: `[...new Set(arr)] est l'idiome standard de dédoublonnage. has() est en O(1) — bien plus rapide que includes() sur de gros volumes.`,
            en: `[...new Set(arr)] is the standard dedupe idiom. has() is O(1) — much faster than includes() on large datasets.`,
          },
        },
        {
          id: 'js-json',
          title: { fr: 'JSON.parse / stringify', en: 'JSON.parse / stringify' },
          code: `const s = JSON.stringify({ nom: 'Ada', age: 36 });  // '{"nom":"Ada","age":36}'\nconst o = JSON.parse(s);                            // objet reconstruit\nJSON.stringify(o, null, 2)         // indenté (lisible / debug)\n// pertes : undefined, fonctions et symbols disparaissent\nJSON.stringify({ a: undefined, f: () => {} })       // '{}'\nJSON.stringify(new Date())         // chaîne ISO — pas un objet Date au parse`,
          note: {
            fr: `stringify ignore undefined, fonctions et symbols, et sérialise les Date en chaînes ISO (non reconverties au parse). JSON.parse lève sur du JSON invalide : try/catch sur des données externes.`,
            en: `stringify drops undefined, functions and symbols, and serializes Dates as ISO strings (not converted back on parse). JSON.parse throws on invalid JSON: try/catch on external data.`,
          },
        },
        {
          id: 'js-intl',
          title: { fr: 'Intl.NumberFormat / DateTimeFormat', en: 'Intl.NumberFormat / DateTimeFormat' },
          code: `new Intl.NumberFormat('fr-FR', {\n  style: 'currency', currency: 'EUR',\n}).format(1234.5)                     // '1 234,50 €'\nnew Intl.NumberFormat('en-US').format(1234.5)  // '1,234.5'\nnew Intl.DateTimeFormat('fr-FR', {\n  dateStyle: 'long',\n}).format(new Date('2026-06-06'))     // '6 juin 2026'`,
          note: {
            fr: `Intl formate nombres, devises et dates selon la locale, sans bibliothèque externe. Réutilisez l'instance de formatter : sa création est coûteuse.`,
            en: `Intl formats numbers, currencies and dates per locale, with no external library. Reuse the formatter instance: creating one is expensive.`,
          },
        },
        {
          id: 'js-debounce',
          title: { fr: 'Débounce minimal', en: 'Minimal debounce' },
          code: `function debounce(fn, délai = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);               // annule l'appel en attente\n    timer = setTimeout(() => fn(...args), délai);\n  };\n}\nconst surSaisie = debounce(q => rechercher(q), 300);\ninput.addEventListener('input', e => surSaisie(e.target.value));`,
          note: {
            fr: `Le débounce n'exécute fn qu'après un silence de N ms — indispensable pour les champs de recherche ou le resize. La closure sur timer garde l'état entre les appels.`,
            en: `Debounce only runs fn after N ms of silence — essential for search inputs or resize. The closure over timer keeps state between calls.`,
          },
        },
      ],
    },
    {
      id: 'classes',
      title: { fr: 'Classes (ES6+)', en: 'Classes (ES6+)' },
      items: [
        {
          id: 'js-class-basics',
          title: { fr: 'Classe : constructor & méthodes', en: 'Class: constructor & methods' },
          code: `class Compte {\n  constructor(solde = 0) {\n    this.solde = solde          // champ d'instance\n  }\n  crediter(montant) {\n    this.solde += montant\n    return this                 // permet le chaînage\n  }\n}\nconst c = new Compte(100).crediter(50)   // solde: 150`,
          note: {
            fr: `Une classe est du sucre syntaxique sur les prototypes : constructor initialise l'instance, les méthodes sont partagées via le prototype (pas copiées par instance).`,
            en: `A class is syntactic sugar over prototypes: constructor initializes the instance, methods are shared via the prototype (not copied per instance).`,
          },
        },
        {
          id: 'js-class-private-fields',
          title: { fr: 'Champs privés #x', en: 'Private fields #x' },
          code: `class Compteur {\n  #valeur = 0                   // privé : invisible hors de la classe\n  incrementer() { return ++this.#valeur }\n}\nconst c = new Compteur()\nc.incrementer()      // 1\nc.#valeur             // SyntaxError hors de la classe`,
          note: {
            fr: `Le préfixe # (ES2022) impose une vraie encapsulation vérifiée par le moteur JS, contrairement à la convention _valeur qui reste accessible de l'extérieur.`,
            en: `The # prefix (ES2022) enforces real encapsulation checked by the JS engine, unlike the _value convention which remains accessible from outside.`,
          },
        },
        {
          id: 'js-class-static',
          title: { fr: 'Membres static', en: 'Static members' },
          code: `class Compteur {\n  static instances = 0            // partagé par la classe, pas les instances\n  constructor() { Compteur.instances++ }\n  static reset() { Compteur.instances = 0 }\n}\nnew Compteur(); new Compteur()\nCompteur.instances     // 2`,
          note: {
            fr: `static attache une propriété ou méthode à la classe elle-même (fabriques, compteurs, constantes) plutôt qu'à chaque instance créée.`,
            en: `static attaches a property or method to the class itself (factories, counters, constants) rather than to each created instance.`,
          },
        },
        {
          id: 'js-class-inheritance',
          title: { fr: 'Héritage : extends & super', en: 'Inheritance: extends & super' },
          code: `class Animal {\n  constructor(nom) { this.nom = nom }\n  parler() { return \`\${this.nom} fait un bruit\` }\n}\nclass Chien extends Animal {\n  parler() { return \`\${super.parler()} : Ouaf !\` }   // super = accès au parent\n}\nnew Chien('Rex').parler()  // 'Rex fait un bruit : Ouaf !'`,
          note: {
            fr: `extends établit la chaîne de prototypes, super() doit être appelé dans le constructor enfant avant d'utiliser this ; super.methode() appelle l'implémentation du parent.`,
            en: `extends sets up the prototype chain, super() must be called in the child constructor before using this; super.method() calls the parent's implementation.`,
          },
        },
      ],
    },
    {
      id: 'fundamentals',
      title: { fr: 'Fondamentaux : portée, erreurs & modules', en: 'Fundamentals: scope, errors & modules' },
      items: [
        {
          id: 'js-hoisting-tdz',
          title: { fr: 'Hoisting & Temporal Dead Zone', en: 'Hoisting & Temporal Dead Zone' },
          code: `console.log(a)     // undefined — var hoisté et initialisé\nvar a = 1\nconsole.log(b)     // ReferenceError — TDZ : b existe mais inaccessible\nlet b = 2`,
          note: {
            fr: `var est hoisté ET initialisé à undefined ; let/const sont hoistés mais restent dans la Temporal Dead Zone jusqu'à leur déclaration — y accéder avant lève une erreur, ce qui évite des bugs silencieux.`,
            en: `var is hoisted AND initialized to undefined; let/const are hoisted but stay in the Temporal Dead Zone until their declaration — accessing them earlier throws, preventing silent bugs.`,
          },
        },
        {
          id: 'js-error-handling',
          title: { fr: 'throw, Error personnalisée & cause', en: 'throw, custom Error & cause' },
          code: `class ValidationError extends Error {\n  constructor(message, { cause } = {}) {\n    super(message, { cause })     // cause (ES2022) : chaîne l'erreur d'origine\n    this.name = 'ValidationError'\n  }\n}\nthrow new ValidationError('email invalide', { cause: err })`,
          note: {
            fr: `Étendre Error permet de créer des types d'erreurs distinguables (instanceof), et l'option cause (ES2022) préserve l'erreur d'origine sans la perdre dans un nouveau throw.`,
            en: `Extending Error lets you create distinguishable error types (instanceof), and the cause option (ES2022) preserves the original error instead of losing it in a new throw.`,
          },
        },
        {
          id: 'js-modules',
          title: { fr: 'Modules ES : import / export', en: 'ES modules: import / export' },
          code: `// math.js\nexport const PI = 3.14              // export nommé\nexport default function carre(x) { return x * x }  // export par défaut\n// app.js\nimport carre, { PI } from './math.js'    // défaut + nommé\nimport * as math from './math.js'        // tout sous un namespace`,
          note: {
            fr: `Un module peut avoir un seul export default mais autant d'exports nommés que nécessaire ; contrairement aux scripts classiques, un module a sa propre portée et est en mode strict par défaut.`,
            en: `A module can have one default export but as many named exports as needed; unlike classic scripts, a module has its own scope and is strict mode by default.`,
          },
        },
      ],
    },
    {
      id: 'js-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'js-bp-const-let',
          title: { fr: 'const par défaut, let si réassignation, jamais var', en: 'const by default, let when reassigning, never var' },
          code: `const utilisateurs = []        // jamais réassigné → const\nlet compteur = 0                // sera réassigné → let\nfor (let i = 0; i < 3; i++) {}  // let : scope de bloc, var fuit hors du for`,
          note: {
            fr: `var a une portée fonction et est hoisté sans TDZ, source de bugs classiques (fuite hors des boucles/blocs). const/let sont scoped au bloc et bien plus prévisibles.`,
            en: `var is function-scoped and hoisted without a TDZ, a classic bug source (leaking out of loops/blocks). const/let are block-scoped and far more predictable.`,
          },
        },
        {
          id: 'js-bp-immutability',
          title: { fr: 'Ne pas muter, retourner une copie', en: "Don't mutate, return a copy" },
          code: `function ajouterItem(liste, item) {\n  return [...liste, item]        // copie, jamais liste.push(item)\n}\nconst maj = { ...user, age: 37 } // jamais user.age = 37`,
          note: {
            fr: `Muter un tableau/objet partagé (props, state, cache) crée des bugs difficiles à tracer : d'autres parties du code gardent une référence à une valeur qu'elles croyaient stable.`,
            en: `Mutating a shared array/object (props, state, cache) creates hard-to-trace bugs: other code holding a reference expects that value to stay stable.`,
          },
        },
        {
          id: 'js-bp-error-handling',
          title: { fr: 'Ne jamais avaler une erreur silencieusement', en: 'Never swallow an error silently' },
          code: `try {\n  await sauvegarder(data)\n} catch (err) {\n  logger.error('sauvegarde échouée', err)\n  throw err   // ou notifier l'utilisateur — jamais un catch vide\n}`,
          note: {
            fr: `Un catch {} vide masque l'échec : l'appelant croit que tout s'est bien passé alors que l'opération a réellement échoué, ce qui corrompt l'état applicatif en silence.`,
            en: `An empty catch {} hides the failure: the caller believes everything succeeded while the operation actually failed, silently corrupting application state.`,
          },
        },
        {
          id: 'js-bp-guard-clauses',
          title: { fr: "Early return plutôt que l'imbrication", en: 'Early return over nesting' },
          code: `function traiter(user) {\n  if (!user) return null            // sortie immédiate\n  if (!user.actif) return null\n  return formater(user)             // cas nominal en dernier, non imbriqué\n}`,
          note: {
            fr: `Les retours anticipés éliminent les niveaux d'imbrication et rendent le cas nominal visible en un coup d'œil, contrairement à des if/else empilés sur 4+ niveaux.`,
            en: `Early returns remove nesting levels and make the happy path visible at a glance, unlike if/else stacked four levels deep.`,
          },
        },
        {
          id: 'js-bp-modules-scope',
          title: { fr: 'Encapsuler avec des modules ES, pas de globales', en: 'Encapsulate with ES modules, no globals' },
          code: `// utils.js\nexport function formaterPrix(n) { return \`\${n.toFixed(2)} €\` }\n// jamais : window.formaterPrix = ...`,
          note: {
            fr: `Chaque module a sa propre portée : exporter explicitement évite de polluer l'espace global et rend les dépendances traçables à l'import.`,
            en: `Each module has its own scope: exporting explicitly avoids polluting the global namespace and keeps dependencies traceable at the import site.`,
          },
        },
      ],
    },
  ],
};
