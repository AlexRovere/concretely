/**
 * Cheatsheet Rust — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'rust',
  lang: 'rust',
  sections: [
    {
      id: 'basics',
      title: { fr: 'Bases & idiomes', en: 'Basics & idioms' },
      items: [
        {
          id: 'rust-let-mut',
          title: { fr: 'let, mut et shadowing', en: 'let, mut and shadowing' },
          code: `let x = 5;          // immuable par défaut
let mut y = 10;     // mutable explicitement
y += 1;
let x = x * 2;      // shadowing : nouveau x, l'ancien disparaît
let x = x.to_string(); // peut même changer de type`,
          note: {
            fr: `Tout est immuable par défaut : mut est un signal de design, pas une corvée. Le shadowing permet de réutiliser un nom en changeant de type, très courant pour les conversions.`,
            en: `Everything is immutable by default: mut is a design signal, not a chore. Shadowing lets you reuse a name while changing the type, very common for conversions.`,
          },
        },
        {
          id: 'rust-expressions',
          title: { fr: 'Tout est expression', en: 'Everything is an expression' },
          code: `let note = if score > 90 { "A" } else { "B" }; // if = expression
let n = {
    let a = 2;
    a * a          // pas de ; => valeur du bloc
};
let r = loop { break 42; }; // loop peut renvoyer une valeur`,
          note: {
            fr: `Un bloc vaut sa dernière expression sans point-virgule ; ajouter un ; transforme l'expression en statement qui vaut (). C'est la cause classique du « expected X, found () ».`,
            en: `A block evaluates to its last semicolon-less expression; adding a ; turns it into a statement evaluating to (). That is the classic cause of "expected X, found ()".`,
          },
        },
        {
          id: 'rust-types-inference',
          title: { fr: 'Types & inférence', en: 'Types & inference' },
          code: `let a = 1_000_000;       // i32 par défaut
let b: u64 = 7;          // annotation explicite
let c = 2.5;             // f64 par défaut
let v: Vec<u8> = Vec::new();   // annotation requise ici
let n = "42".parse::<i32>().unwrap(); // turbofish ::<>`,
          note: {
            fr: `L'inférence est puissante mais locale : Vec::new() ou parse() ont besoin d'un indice de type (annotation ou turbofish). Les entiers ne se convertissent jamais implicitement : utilisez as ou From.`,
            en: `Inference is powerful but local: Vec::new() or parse() need a type hint (annotation or turbofish). Integers never convert implicitly: use as or From.`,
          },
        },
        {
          id: 'rust-string-vs-str',
          title: { fr: 'String vs &str', en: 'String vs &str' },
          code: `let s: &str = "littéral";        // tranche empruntée
let owned: String = s.to_string(); // possédée, sur le tas
fn salue(nom: &str) { println!("Salut {nom}"); }
salue(&owned);   // &String se déréférence en &str
salue("Ada");    // un littéral marche aussi`,
          note: {
            fr: `Prenez &str en paramètre : ça accepte à la fois &String et les littéraux grâce à la deref coercion. Renvoyez String quand la fonction crée ou possède le texte.`,
            en: `Take &str as a parameter: it accepts both &String and literals thanks to deref coercion. Return String when the function creates or owns the text.`,
          },
        },
        {
          id: 'rust-println-format',
          title: { fr: 'println! & format!', en: 'println! & format!' },
          code: `let nom = "Ada"; let pi = 3.14159;
println!("Bonjour {nom} !");        // capture directe (2021+)
println!("{:.2}", pi);              // 2 décimales -> 3.14
println!("{:?}", vec![1, 2]);       // Debug
println!("{:#?}", (1, "a"));        // Debug indenté ("pretty")
let msg = format!("{nom} a dit pi = {pi:.1}");`,
          note: {
            fr: `{} exige Display, {:?} exige Debug (souvent dérivé). La capture de variables dans les accolades évite les arguments positionnels et rend le code plus lisible.`,
            en: `{} requires Display, {:?} requires Debug (usually derived). Capturing variables inside the braces avoids positional arguments and reads better.`,
          },
        },
        {
          id: 'rust-loops',
          title: { fr: 'Boucles for, while, loop', en: 'for, while and loop' },
          code: `for i in 0..5 { print!("{i} "); }      // 0 1 2 3 4
for i in (1..=3).rev() { print!("{i} "); } // 3 2 1
for (i, c) in "abc".chars().enumerate() {
    println!("{i}: {c}");
}
while let Some(x) = pile.pop() { println!("{x}"); }`,
          note: {
            fr: `Pas de for à la C : on itère toujours sur un itérateur. 0..5 exclut la borne haute, 1..=3 l'inclut. while let boucle tant qu'un pattern matche, idéal pour vider une pile.`,
            en: `No C-style for: you always iterate over an iterator. 0..5 excludes the upper bound, 1..=3 includes it. while let loops as long as a pattern matches, ideal for draining a stack.`,
          },
        },
      ],
    },
    {
      id: 'ownership',
      title: { fr: 'Ownership & emprunts', en: 'Ownership & borrowing' },
      items: [
        {
          id: 'rust-move',
          title: { fr: 'Move : la valeur déménage', en: 'Move: the value relocates' },
          code: `let s1 = String::from("salut");
let s2 = s1;             // move : s1 n'est plus utilisable
// println!("{s1}");     // ERREUR : value borrowed after move
let s3 = s2.clone();     // copie profonde explicite
let n = 5; let m = n;    // i32 est Copy : n reste valide`,
          note: {
            fr: `Affecter ou passer une valeur non-Copy la déplace : l'ancien nom devient invalide, garantissant un seul propriétaire et zéro double-free. clone() est le coût explicite quand on veut deux copies.`,
            en: `Assigning or passing a non-Copy value moves it: the old name becomes invalid, guaranteeing a single owner and no double-free. clone() is the explicit cost when you want two copies.`,
          },
        },
        {
          id: 'rust-borrow-rules',
          title: { fr: 'Un écrivain OU n lecteurs', en: 'One writer OR n readers' },
          code: `let mut v = vec![1, 2, 3];
let a = &v;        // lecteur 1
let b = &v;        // lecteur 2 : OK, lectures multiples
println!("{a:?} {b:?}");
let m = &mut v;    // OK : a et b ne sont plus utilisés après
m.push(4);
// &v et &mut v en même temps => ERREUR du borrow checker`,
          note: {
            fr: `À tout instant : soit plusieurs &T, soit un seul &mut T, jamais les deux. C'est ce qui élimine les data races à la compilation. Les emprunts finissent à leur dernière utilisation (NLL), pas à la fin du bloc.`,
            en: `At any time: either many &T or exactly one &mut T, never both. That is what eliminates data races at compile time. Borrows end at their last use (NLL), not at the end of the block.`,
          },
        },
        {
          id: 'rust-pass-by-ref',
          title: { fr: 'Passer par référence', en: 'Passing by reference' },
          code: `fn longueur(s: &String) -> usize { s.len() }   // lit seulement
fn ajoute(s: &mut String) { s.push('!'); }     // modifie
let mut s = String::from("hé");
let l = longueur(&s);  // s reste utilisable après
ajoute(&mut s);        // emprunt mutable explicite à l'appel
println!("{s} ({l})");`,
          note: {
            fr: `Empruntez (&) au lieu de déplacer quand la fonction n'a pas besoin de posséder la valeur. Le &mut au site d'appel rend la mutation visible : on sait qui modifie quoi rien qu'en lisant l'appel.`,
            en: `Borrow (&) instead of moving when the function does not need to own the value. The &mut at the call site makes mutation visible: you know who modifies what just by reading the call.`,
          },
        },
        {
          id: 'rust-lifetimes-basic',
          title: { fr: 'Lifetimes de base', en: 'Basic lifetimes' },
          code: `// la référence renvoyée vit aussi longtemps que les entrées
fn plus_long<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() > b.len() { a } else { b }
}
// inutile avec un seul paramètre : élision automatique
fn premier(s: &str) -> &str { &s[..1] }`,
          note: {
            fr: `Un lifetime ne change pas la durée de vie : il relie la sortie aux entrées pour que le compilateur vérifie qu'aucune référence ne survit à sa donnée. L'élision couvre la plupart des cas simples.`,
            en: `A lifetime does not change how long anything lives: it ties the output to the inputs so the compiler can check no reference outlives its data. Elision covers most simple cases.`,
          },
        },
        {
          id: 'rust-slices',
          title: { fr: 'Slices : emprunter un morceau', en: 'Slices: borrowing a chunk' },
          code: `let v = vec![10, 20, 30, 40];
let milieu = &v[1..3];          // &[20, 30]
let mot = "bonjour le monde";
let premier = &mot[..7];        // "bonjour" (indices en octets !)
fn somme(xs: &[i32]) -> i32 { xs.iter().sum() }
somme(&v);  // &Vec<i32> se coerce en &[i32]`,
          note: {
            fr: `Préférez &[T] et &str en paramètres : ils acceptent Vec, tableaux et String sans copie. Attention : les indices de &str sont en octets, couper au milieu d'un caractère UTF-8 panique.`,
            en: `Prefer &[T] and &str as parameters: they accept Vec, arrays and String without copying. Careful: &str indices are bytes, slicing in the middle of a UTF-8 character panics.`,
          },
        },
      ],
    },
    {
      id: 'option-result',
      title: { fr: 'Option & Result', en: 'Option & Result' },
      items: [
        {
          id: 'rust-option-basics',
          title: { fr: 'Option : nul n\'existe pas', en: 'Option: no null here' },
          code: `let trouve: Option<i32> = vec![1, 2, 3].into_iter().find(|&x| x > 1);
let valeur = trouve.unwrap_or(0);        // défaut si None
let double = trouve.map(|x| x * 2);      // Some(4) ou None
if let Some(x) = trouve {
    println!("trouvé : {x}");
}`,
          note: {
            fr: `Pas de null : l'absence est un type, Option<T>, que le compilateur force à traiter. unwrap_or / map / and_then permettent de transformer sans déballer manuellement.`,
            en: `No null: absence is a type, Option<T>, which the compiler forces you to handle. unwrap_or / map / and_then let you transform without manual unwrapping.`,
          },
        },
        {
          id: 'rust-question-mark',
          title: { fr: 'L\'opérateur ?', en: 'The ? operator' },
          code: `use std::fs;

fn lire_config() -> Result<String, std::io::Error> {
    let brut = fs::read_to_string("config.toml")?; // propage l'erreur
    Ok(brut.trim().to_string())
}
// ? marche aussi sur Option dans une fn -> Option<T>`,
          note: {
            fr: `? déballe le succès ou fait un return early de l'erreur, en la convertissant via From si besoin. C'est LA façon idiomatique de propager : un unwrap() en prod est presque toujours un bug en attente.`,
            en: `? unwraps success or early-returns the error, converting it via From if needed. It is THE idiomatic way to propagate: an unwrap() in production code is almost always a bug waiting to happen.`,
          },
        },
        {
          id: 'rust-unwrap-family',
          title: { fr: 'unwrap, expect & alternatives', en: 'unwrap, expect & alternatives' },
          code: `let n: i32 = "42".parse().unwrap();          // panique si erreur
let n: i32 = "42".parse().expect("nombre attendu"); // panique + message
let n: i32 = "oops".parse().unwrap_or(0);    // défaut
let n: i32 = "oops".parse().unwrap_or_else(|_| calcul_couteux());
let n: i32 = "oops".parse().unwrap_or_default(); // 0 pour i32`,
          note: {
            fr: `expect > unwrap : le message dit quoi chercher quand ça panique. unwrap_or_else évalue paresseusement, contrairement à unwrap_or qui calcule son argument même en cas de succès.`,
            en: `expect beats unwrap: the message tells you what to look for when it panics. unwrap_or_else is lazy, unlike unwrap_or which evaluates its argument even on success.`,
          },
        },
        {
          id: 'rust-result-combinators',
          title: { fr: 'map, and_then, ok_or', en: 'map, and_then, ok_or' },
          code: `let r: Result<i32, _> = "5".parse::<i32>().map(|x| x * 10); // Ok(50)
let carre_pair: Result<i32, String> = "4".parse::<i32>()
    .map_err(|_| "entrée invalide".to_string())
    .and_then(|x| if x % 2 == 0 { Ok(x * x) } else { Err("nombre impair".to_string()) });
let opt = Some(3);
let res: Result<i32, &str> = opt.ok_or("valeur manquante"); // Option -> Result
let retour = res.ok();                                      // Result -> Option`,
          note: {
            fr: `map transforme la valeur, and_then enchaîne une opération qui peut elle-même échouer (évite le Result<Result<...>>). ok_or et ok() convertissent entre Option et Result, indispensable avec ?.`,
            en: `map transforms the value, and_then chains an operation that can itself fail (avoids Result<Result<...>>). ok_or and ok() convert between Option and Result, essential when using ?.`,
          },
        },
        {
          id: 'rust-match-vs-iflet',
          title: { fr: 'match vs if let / let else', en: 'match vs if let / let else' },
          code: `match recupere() {
    Ok(v) => println!("ok : {v}"),
    Err(e) => eprintln!("erreur : {e}"),  // tous les cas couverts
}
if let Ok(v) = recupere() { println!("{v}"); } // un seul cas utile
let Ok(v) = recupere() else {            // let else : sortie anticipée
    return;
};
println!("on continue avec {v}");`,
          note: {
            fr: `match quand tous les cas comptent, if let quand un seul vous intéresse. let else (1.65+) garde le code « happy path » à plat : le bloc else doit diverger (return, break, panic).`,
            en: `Use match when every case matters, if let when only one does. let else (1.65+) keeps the happy path flat: the else block must diverge (return, break, panic).`,
          },
        },
      ],
    },
    {
      id: 'collections-iterators',
      title: { fr: 'Collections & itérateurs', en: 'Collections & iterators' },
      items: [
        {
          id: 'rust-vec-basics',
          title: { fr: 'Vec : le tableau dynamique', en: 'Vec: the growable array' },
          code: `let mut v = vec![1, 2, 3];
v.push(4);
let dernier = v.pop();          // Option<i32>
let premier = v.first();        // Option<&i32>, pas de panique
let x = v[10];                  // ATTENTION : panique si hors borne
let sûr = v.get(10);            // None si hors borne`,
          note: {
            fr: `v[i] panique hors bornes, v.get(i) renvoie une Option : choisissez get quand l'indice vient de l'extérieur. push peut réallouer ; Vec::with_capacity(n) évite ça si la taille est connue.`,
            en: `v[i] panics out of bounds, v.get(i) returns an Option: pick get when the index comes from outside. push may reallocate; Vec::with_capacity(n) avoids that when the size is known.`,
          },
        },
        {
          id: 'rust-hashmap-entry',
          title: { fr: 'HashMap & entry API', en: 'HashMap & the entry API' },
          code: `use std::collections::HashMap;
let mut compte: HashMap<&str, i32> = HashMap::new();
for mot in "le chat et le chien".split_whitespace() {
    *compte.entry(mot).or_insert(0) += 1;   // un seul lookup
}
let n = compte.get("le").copied().unwrap_or(0); // 2`,
          note: {
            fr: `entry().or_insert() insère si absent puis renvoie un &mut : un seul hachage au lieu du combo contains_key + insert. or_insert_with(Vec::new) évite de construire le défaut inutilement.`,
            en: `entry().or_insert() inserts if missing then returns a &mut: one hash lookup instead of the contains_key + insert combo. or_insert_with(Vec::new) avoids building the default needlessly.`,
          },
        },
        {
          id: 'rust-iter-variants',
          title: { fr: 'iter vs into_iter vs iter_mut', en: 'iter vs into_iter vs iter_mut' },
          code: `let mut v = vec![1, 2, 3];
for x in v.iter()     { /* &i32  : on emprunte   */ }
for x in v.iter_mut() { *x += 1; /* &mut i32     */ }
for x in v.into_iter(){ /* i32   : consomme v    */ }
// for x in &v  ≡ v.iter()   ;   for x in v ≡ v.into_iter()`,
          note: {
            fr: `Trois saveurs : emprunter (&T), modifier (&mut T) ou consommer (T). Après into_iter() le Vec n'existe plus. Le for sucre &v / &mut v / v vers la bonne variante.`,
            en: `Three flavors: borrow (&T), modify (&mut T) or consume (T). After into_iter() the Vec is gone. The for loop sugars &v / &mut v / v into the right variant.`,
          },
        },
        {
          id: 'rust-map-filter-collect',
          title: { fr: 'map / filter / collect', en: 'map / filter / collect' },
          code: `let carres: Vec<i32> = (1..=5)
    .filter(|n| n % 2 == 1)     // 1, 3, 5
    .map(|n| n * n)             // 1, 9, 25
    .collect();                 // matérialise en Vec
let s: String = vec!["a", "b"].concat();
let nombres: Result<Vec<i32>, _> =
    ["1", "2", "x"].iter().map(|s| s.parse()).collect(); // Err !`,
          note: {
            fr: `Les itérateurs sont paresseux : rien ne s'exécute avant collect/sum/for. collect est polymorphe : Vec, String, HashMap... et même Result<Vec<T>, E> qui s'arrête à la première erreur.`,
            en: `Iterators are lazy: nothing runs until collect/sum/for. collect is polymorphic: Vec, String, HashMap... and even Result<Vec<T>, E> which short-circuits on the first error.`,
          },
        },
        {
          id: 'rust-fold-sum',
          title: { fr: 'fold, sum & réductions', en: 'fold, sum & reductions' },
          code: `let total: i32 = (1..=4).sum();             // 10
let produit: i32 = (1..=4).product();       // 24
let max = vec![3, 7, 2].into_iter().max();  // Some(7)
let phrase = ["a", "b", "c"].iter()
    .fold(String::new(), |mut acc, s| { acc.push_str(s); acc });
let n = (0..100).filter(|x| x % 3 == 0).count();`,
          note: {
            fr: `sum/product/max/count couvrent 90 % des réductions ; fold est l'outil général avec accumulateur. Notez l'annotation sur sum : le type de sortie doit souvent être précisé.`,
            en: `sum/product/max/count cover 90% of reductions; fold is the general accumulator tool. Note the annotation on sum: the output type often needs to be spelled out.`,
          },
        },
        {
          id: 'rust-iter-chains',
          title: { fr: 'zip, chain, enumerate, rev', en: 'zip, chain, enumerate, rev' },
          code: `let noms = ["Ada", "Alan"];
let ages = [36, 41];
for (nom, age) in noms.iter().zip(ages.iter()) {
    println!("{nom} a {age} ans");
}
let tout: Vec<i32> = (1..3).chain(10..12).collect(); // [1,2,10,11]
let paires: Vec<_> = "ab".chars().enumerate().collect(); // [(0,'a'),(1,'b')]`,
          note: {
            fr: `zip s'arrête au plus court des deux itérateurs, sans erreur : pratique mais source de bugs silencieux si les longueurs diffèrent. enumerate remplace le compteur manuel des boucles C.`,
            en: `zip stops at the shorter of the two iterators, with no error: handy but a source of silent bugs when lengths differ. enumerate replaces the manual counter of C-style loops.`,
          },
        },
      ],
    },
    {
      id: 'pattern-matching',
      title: { fr: 'Pattern matching', en: 'Pattern matching' },
      items: [
        {
          id: 'rust-match-exhaustive',
          title: { fr: 'match exhaustif', en: 'Exhaustive match' },
          code: `enum Feu { Rouge, Orange, Vert }
let action = match feu {
    Feu::Rouge => "stop",
    Feu::Orange => "ralentir",
    Feu::Vert => "passer",
}; // ajouter une variante ? le compilateur exige de la gérer
let msg = match code { 200 => "ok", 404 => "introuvable", _ => "autre" };`,
          note: {
            fr: `Le match doit couvrir tous les cas : ajouter une variante d'enum fait échouer la compilation partout où elle n'est pas gérée. Évitez le _ fourre-tout sur vos propres enums pour garder cette protection.`,
            en: `match must cover every case: adding an enum variant breaks compilation everywhere it is unhandled. Avoid the catch-all _ on your own enums to keep that safety net.`,
          },
        },
        {
          id: 'rust-destructuring',
          title: { fr: 'Destructuring', en: 'Destructuring' },
          code: `struct Point { x: i32, y: i32 }
let p = Point { x: 1, y: 2 };
let Point { x, y } = p;          // x = 1, y = 2
let (a, b, ..) = (1, 2, 3, 4);   // .. ignore le reste
match p {
    Point { x: 0, y } => println!("sur l'axe Y en {y}"),
    Point { x, .. } => println!("x = {x}"),
}`,
          note: {
            fr: `Le destructuring marche dans let, les paramètres de fonction et les bras de match. .. ignore les champs restants : utile, mais il masque les nouveaux champs ajoutés plus tard.`,
            en: `Destructuring works in let, function parameters and match arms. .. skips remaining fields: useful, but it hides fields added later.`,
          },
        },
        {
          id: 'rust-guards-bindings',
          title: { fr: 'Guards & @ bindings', en: 'Guards & @ bindings' },
          code: `let n = 4;
match n {
    x if x < 0 => println!("négatif"),
    0 => println!("zéro"),
    x @ 1..=5 => println!("petit : {x}"),  // @ capture la valeur
    _ => println!("grand"),
}
let msg = match point { (x, y) if x == y => "diagonale", _ => "ailleurs" };`,
          note: {
            fr: `Le guard if affine un pattern avec une condition arbitraire ; x @ pattern teste ET capture en même temps. Attention : un guard rend le bras non-exhaustif aux yeux du compilateur.`,
            en: `An if guard refines a pattern with an arbitrary condition; x @ pattern tests AND captures at once. Careful: a guard makes the arm non-exhaustive in the compiler's eyes.`,
          },
        },
        {
          id: 'rust-or-patterns',
          title: { fr: 'Patterns multiples avec |', en: 'Multiple patterns with |' },
          code: `match touche {
    'q' | 'Q' => quitter(),
    'a'..='z' => println!("lettre minuscule"),
    '0'..='9' => println!("chiffre"),
    _ => {}
}
if let Some(1 | 2 | 3) = choix { println!("podium !"); }`,
          note: {
            fr: `| combine plusieurs patterns sur un même bras et marche aussi dans if let. Les ranges ..= fonctionnent sur les chars et les entiers, parfait pour classer des caractères.`,
            en: `| combines several patterns into one arm and also works in if let. ..= ranges work on chars and integers, perfect for classifying characters.`,
          },
        },
        {
          id: 'rust-matches-macro',
          title: { fr: 'matches! pour un booléen', en: 'matches! for a boolean' },
          code: `let c = 'f';
let est_voyelle = matches!(c, 'a' | 'e' | 'i' | 'o' | 'u');
let actif = matches!(statut, Statut::Actif | Statut::Essai);
// équivalent verbeux :
// let actif = match statut { Statut::Actif | Statut::Essai => true, _ => false };`,
          note: {
            fr: `matches! condense « ce pattern matche-t-il ? » en une expression booléenne. Idéal dans les filter() et les assert!, où un match complet serait du bruit.`,
            en: `matches! condenses "does this pattern match?" into a boolean expression. Ideal inside filter() and assert!, where a full match would be noise.`,
          },
        },
      ],
    },
    {
      id: 'traits-generics',
      title: { fr: 'Traits & génériques', en: 'Traits & generics' },
      items: [
        {
          id: 'rust-derive',
          title: { fr: 'derive : traits gratuits', en: 'derive: traits for free' },
          code: `#[derive(Debug, Clone, PartialEq, Default)]
struct Config {
    hote: String,
    port: u16,
}
let c = Config { port: 8080, ..Default::default() };
println!("{c:?}");           // grâce à Debug
assert_eq!(c.clone(), c);    // grâce à Clone + PartialEq`,
          note: {
            fr: `derive génère l'implémentation standard : Debug pour {:?}, Clone, PartialEq, Hash, Default... Le combo ..Default::default() initialise les champs non précisés, très lisible pour les structs de config.`,
            en: `derive generates the standard implementation: Debug for {:?}, Clone, PartialEq, Hash, Default... The ..Default::default() combo fills unspecified fields, very readable for config structs.`,
          },
        },
        {
          id: 'rust-impl-trait-def',
          title: { fr: 'Définir et implémenter un trait', en: 'Defining and implementing a trait' },
          code: `trait Resume {
    fn resume(&self) -> String;
    fn apercu(&self) -> String {          // méthode par défaut
        format!("({}...)", &self.resume()[..3])
    }
}
impl Resume for Article {
    fn resume(&self) -> String { self.titre.clone() }
}`,
          note: {
            fr: `Un trait est une interface avec, en option, des méthodes par défaut que les implémenteurs héritent ou redéfinissent. C'est le seul mécanisme de polymorphisme : pas d'héritage de classes en Rust.`,
            en: `A trait is an interface with optional default methods that implementors inherit or override. It is the only polymorphism mechanism: there is no class inheritance in Rust.`,
          },
        },
        {
          id: 'rust-trait-bounds',
          title: { fr: 'Génériques & trait bounds', en: 'Generics & trait bounds' },
          code: `fn plus_grand<T: PartialOrd>(items: &[T]) -> Option<&T> {
    items.iter().reduce(|a, b| if a > b { a } else { b })
}
// syntaxe where, plus lisible avec plusieurs bornes :
fn affiche_tout<T>(items: &[T])
where T: std::fmt::Debug + Clone,
{
    for it in items { println!("{it:?}"); }
}`,
          note: {
            fr: `Les bounds déclarent ce que T sait faire ; sans borne, T ne sait rien (même pas se comparer). Le générique est monomorphisé : une version compilée par type concret, zéro coût à l'exécution.`,
            en: `Bounds declare what T can do; without bounds, T can do nothing (not even compare). Generics are monomorphized: one compiled version per concrete type, zero runtime cost.`,
          },
        },
        {
          id: 'rust-impl-vs-dyn',
          title: { fr: 'impl Trait vs dyn Trait', en: 'impl Trait vs dyn Trait' },
          code: `fn pairs() -> impl Iterator<Item = i32> {   // type concret caché
    (0..).filter(|n| n % 2 == 0)
}
fn fabrique(s: &str) -> Box<dyn Animal> {   // type choisi à l'exécution
    match s { "chat" => Box::new(Chat), _ => Box::new(Chien) }
}`,
          note: {
            fr: `impl Trait = un seul type concret connu du compilateur (statique, rapide) ; dyn Trait = dispatch dynamique via vtable, nécessaire quand le type varie à l'exécution. Préférez impl quand c'est possible.`,
            en: `impl Trait = one concrete type known to the compiler (static, fast); dyn Trait = dynamic dispatch via vtable, needed when the type varies at runtime. Prefer impl when possible.`,
          },
        },
        {
          id: 'rust-from-into',
          title: { fr: 'From / Into', en: 'From / Into' },
          code: `struct Celsius(f64);
impl From<f64> for Celsius {
    fn from(v: f64) -> Self { Celsius(v) }
}
let t: Celsius = 21.5.into();       // Into offert gratuitement
let t2 = Celsius::from(18.0);
fn chauffe(t: impl Into<Celsius>) { let _t: Celsius = t.into(); }`,
          note: {
            fr: `Implémentez toujours From, jamais Into : Into est dérivé automatiquement. C'est aussi le mécanisme derrière ? pour convertir les types d'erreur, et impl Into<T> rend les API flexibles.`,
            en: `Always implement From, never Into: Into is derived automatically. It is also the mechanism behind ? for converting error types, and impl Into<T> makes APIs flexible.`,
          },
        },
      ],
    },
    {
      id: 'cargo-tooling',
      title: { fr: 'Cargo & outillage', en: 'Cargo & tooling' },
      items: [
        {
          id: 'rust-cargo-essentials',
          title: { fr: 'Commandes cargo du quotidien', en: 'Everyday cargo commands' },
          code: `cargo new mon_projet      # nouveau binaire (--lib pour une lib)
cargo add serde --features derive  # ajoute une dépendance
cargo check               # vérifie sans produire de binaire (rapide)
cargo run -- --arg        # compile + exécute, args après --
cargo build --release     # binaire optimisé dans target/release`,
          note: {
            fr: `cargo check est 2 à 10x plus rapide que build : c'est la boucle de feedback par défaut pendant qu'on code. cargo add édite Cargo.toml et résout la dernière version compatible.`,
            en: `cargo check is 2-10x faster than build: it is the default feedback loop while coding. cargo add edits Cargo.toml and resolves the latest compatible version.`,
          },
        },
        {
          id: 'rust-clippy-fmt',
          title: { fr: 'clippy & fmt', en: 'clippy & fmt' },
          code: `cargo fmt                 # formate tout le projet (non négociable)
cargo clippy              # linter : centaines de lints idiomatiques
cargo clippy -- -D warnings   # échoue sur tout warning (CI)
cargo clippy --fix        # applique les corrections automatiques`,
          note: {
            fr: `clippy enseigne le Rust idiomatique : il signale les clone inutiles, les match simplifiables, etc. En CI, -D warnings empêche la dette de s'accumuler. fmt élimine tout débat de style.`,
            en: `clippy teaches idiomatic Rust: it flags needless clones, simplifiable matches, etc. In CI, -D warnings stops debt from piling up. fmt kills every style debate.`,
          },
        },
        {
          id: 'rust-tests',
          title: { fr: 'Tests intégrés', en: 'Built-in tests' },
          code: `#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn addition() { assert_eq!(ajoute(2, 2), 4); }
    #[test]
    #[should_panic(expected = "division par zéro")]
    fn division_zero() { divise(1, 0); }
}
// cargo test            lance tout ;  cargo test addition  filtre par nom`,
          note: {
            fr: `Les tests vivent dans le même fichier que le code, sous #[cfg(test)] qui les exclut du binaire final. cargo test lance tout en parallèle ; les doctests des commentaires /// sont aussi exécutés.`,
            en: `Tests live in the same file as the code, under #[cfg(test)] which excludes them from the final binary. cargo test runs everything in parallel; doctests in /// comments are also executed.`,
          },
        },
        {
          id: 'rust-modules',
          title: { fr: 'Modules & visibilité', en: 'Modules & visibility' },
          code: `// src/main.rs
mod reseau;               // charge src/reseau.rs (ou reseau/mod.rs)
use reseau::client::ping; // raccourci d'import

// src/reseau.rs
pub mod client {                       // pub : visible de l'extérieur
    pub fn ping() { println!("pong"); }
    fn interne() {}                    // privé au module
}`,
          note: {
            fr: `Tout est privé par défaut ; pub expose à la carte (pub(crate) limite au crate). L'arborescence des modules suit les fichiers : mod x; dans main.rs charge src/x.rs, pas besoin de déclarer chaque fichier ailleurs.`,
            en: `Everything is private by default; pub exposes selectively (pub(crate) limits to the crate). The module tree follows the files: mod x; in main.rs loads src/x.rs, no need to declare files anywhere else.`,
          },
        },
        {
          id: 'rust-features',
          title: { fr: 'Features de crate', en: 'Crate features' },
          code: `# Cargo.toml
[dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }

[features]
default = ["json"]        # features de VOTRE crate
json = ["dep:serde_json"] # active une dépendance optionnelle`,
          note: {
            fr: `Les features activent du code conditionnel (#[cfg(feature = "json")]) et des dépendances optionnelles : moins de features = compilation plus rapide. Elles sont additives : jamais de feature qui désactive du code.`,
            en: `Features enable conditional code (#[cfg(feature = "json")]) and optional dependencies: fewer features = faster builds. They are additive: never write a feature that disables code.`,
          },
        },
      ],
    },
    {
      id: 'rust-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'rust-bp-avoid-unwrap-prod',
          title: { fr: "Pas d'unwrap/expect sur le chemin critique", en: 'No unwrap/expect on the critical path' },
          code: `let port: u16 = std::env::var("PORT")
    .map_err(|_| "PORT manquant")?
    .parse()
    .map_err(|_| "PORT invalide")?;`,
          note: {
            fr: `unwrap()/expect() transforment une erreur récupérable en crash du process : réservez-les aux invariants prouvés (tests, prototypes) et propagez avec ? en production.`,
            en: `unwrap()/expect() turn a recoverable error into a process crash: reserve them for proven invariants (tests, prototypes) and propagate with ? in production.`,
          },
        },
        {
          id: 'rust-bp-newtype-pattern',
          title: { fr: 'Newtype pour les types métier', en: 'Newtype for domain types' },
          code: `struct UserId(u64);
struct OrderId(u64);
fn charger(id: UserId) { /* ... */ }
// charger(OrderId(3)) // ne compile pas : bonne chose`,
          note: {
            fr: `Deux u64 qui représentent des concepts différents se mélangent silencieusement ; un newtype fait du compilateur un garde-fou contre l'inversion d'arguments de même type primitif.`,
            en: `Two u64s representing different concepts mix silently; a newtype turns the compiler into a guard against swapping same-primitive-type arguments.`,
          },
        },
        {
          id: 'rust-bp-error-crates',
          title: { fr: 'thiserror pour les libs, anyhow pour les apps', en: 'thiserror for libraries, anyhow for apps' },
          code: `#[derive(thiserror::Error, Debug)]
enum ConfigError {
    #[error("fichier introuvable: {0}")]
    NotFound(String),
}`,
          note: {
            fr: `thiserror génère des types d'erreur précis et stables pour une API de bibliothèque ; anyhow simplifie la propagation d'erreurs hétérogènes dans une application où seul l'humain lit le message.`,
            en: `thiserror generates precise, stable error types for a library API; anyhow simplifies propagating heterogeneous errors in an app where only a human reads the message.`,
          },
        },
        {
          id: 'rust-bp-prefer-iterators',
          title: { fr: 'Itérateurs plutôt que boucles indexées', en: 'Iterators over indexed loops' },
          code: `let total: i32 = prices.iter().filter(|&&p| p > 0).sum();
// plutôt que : for i in 0..prices.len() { ... prices[i] ... }`,
          note: {
            fr: `Les chaînes d'itérateurs évitent les erreurs d'index hors-borne et se compilent souvent aussi vite qu'une boucle manuelle grâce au monomorphisme — plus sûr sans coût caché.`,
            en: `Iterator chains avoid out-of-bounds index errors and often compile as fast as a manual loop thanks to monomorphization — safer with no hidden cost.`,
          },
        },
        {
          id: 'rust-bp-clippy-ci-gate',
          title: { fr: 'clippy -D warnings comme porte CI', en: 'clippy -D warnings as a CI gate' },
          code: `cargo clippy --all-targets --all-features -- -D warnings`,
          note: {
            fr: `Sans ce flag, les warnings clippy s'accumulent sans jamais être corrigés : en faire une erreur bloquante en CI garde la base de code idiomatique dans la durée.`,
            en: `Without this flag, clippy warnings pile up and never get fixed: making them a hard CI failure keeps the codebase idiomatic over time.`,
          },
        },
      ],
    },
  ],
};
