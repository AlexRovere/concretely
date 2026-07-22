/**
 * Cheatsheet Java — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'java',
  lang: 'js',
  sections: [
    {
      id: 'basics',
      title: { fr: 'Bases modernes (17+)', en: 'Modern basics (17+)' },
      items: [
        {
          id: 'java-var',
          title: { fr: 'Inférence locale avec var', en: 'Local inference with var' },
          code: `var nom = "Ada";                  // String inféré
var scores = new ArrayList<Integer>(); // type complet inféré
var entry = Map.entry("a", 1);    // pratique pour les génériques verbeux
// var x;          // erreur : initialisation obligatoire
// var f = () -> 1; // erreur : pas pour les lambdas`,
          note: {
            fr: `var (Java 10) n'existe qu'en local : le type est inféré à la compilation, rien de dynamique. Idéal quand le type est évident à droite ; à éviter si le lecteur doit deviner.`,
            en: `var (Java 10) is local-only: the type is inferred at compile time, nothing dynamic. Great when the type is obvious on the right side; avoid it when the reader has to guess.`,
          },
        },
        {
          id: 'java-records',
          title: { fr: 'Records : DTO en une ligne', en: 'Records: one-line DTOs' },
          code: `record Point(int x, int y) {}     // ctor, accesseurs, equals, hashCode, toString
var p = new Point(1, 2);
System.out.println(p.x());        // accesseur sans get : p.x()
System.out.println(p.equals(new Point(1, 2))); // true — égalité par valeur
// p.x = 3;  // impossible : un record est immuable`,
          note: {
            fr: `Le record (Java 16) remplace 90 % des usages de Lombok @Value : immuable, égalité par valeur, toString lisible. Pour un objet mutable ou avec héritage, restez sur une classe.`,
            en: `Records (Java 16) replace 90% of Lombok @Value usage: immutable, value-based equality, readable toString. For a mutable object or inheritance, keep a regular class.`,
          },
        },
        {
          id: 'java-sealed-switch',
          title: { fr: 'sealed + switch pattern matching', en: 'sealed + switch pattern matching' },
          code: `sealed interface Forme permits Cercle, Carre {}
record Cercle(double r) implements Forme {}
record Carre(double cote) implements Forme {}

double aire = switch (forme) {       // switch exhaustif (Java 21)
  case Cercle c -> Math.PI * c.r() * c.r();
  case Carre s  -> s.cote() * s.cote();
};  // pas de default : le compilateur sait que c'est complet`,
          note: {
            fr: `sealed (17) + pattern matching pour switch (21) : le compilateur vérifie l'exhaustivité. Ajoutez un cas à l'interface et tous les switch incomplets cassent à la compilation — fini les default silencieux.`,
            en: `sealed (17) + pattern matching for switch (21): the compiler checks exhaustiveness. Add a case to the interface and every incomplete switch fails to compile — no more silent defaults.`,
          },
        },
        {
          id: 'java-text-blocks',
          title: { fr: 'Text blocks """', en: 'Text blocks """' },
          code: `var json = """
    {
      "nom": "Ada",
      "age": 36
    }
    """;   // l'indentation commune est retirée automatiquement
// fini les "{\\n" + "  \\"nom\\"..." illisibles`,
          note: {
            fr: `Les text blocks (15) gardent les retours à la ligne et retirent l'indentation commune (alignée sur le """ fermant). Parfait pour SQL, JSON, HTML — sans échapper les guillemets.`,
            en: `Text blocks (15) keep newlines and strip the common indentation (aligned with the closing """). Perfect for SQL, JSON, HTML — no quote escaping needed.`,
          },
        },
        {
          id: 'java-instanceof-pattern',
          title: { fr: 'instanceof avec pattern', en: 'Pattern matching instanceof' },
          code: `if (obj instanceof String s && s.length() > 3) {
  System.out.println(s.toUpperCase()); // s déjà typé String
}
// avant : if (obj instanceof String) { String s = (String) obj; ... }`,
          note: {
            fr: `L'enhanced instanceof (16) déclare et cast en une fois : la variable n'existe que là où le test est vrai. Supprime le cast redondant, source classique de ClassCastException après refactoring.`,
            en: `Enhanced instanceof (16) declares and casts in one step: the variable only exists where the test holds. Removes the redundant cast, a classic ClassCastException source after refactoring.`,
          },
        },
        {
          id: 'java-equals-vs-eqeq',
          title: { fr: '== vs equals (et le cache Integer)', en: '== vs equals (and the Integer cache)' },
          code: `Integer a = 127, b = 127;
System.out.println(a == b);        // true — cache de -128 à 127 !
Integer c = 128, d = 128;
System.out.println(c == d);        // false — deux objets distincts
System.out.println(c.equals(d));   // true — comparez TOUJOURS avec equals
System.out.println("ab".equals(s)); // ordre sûr si s peut être null`,
          note: {
            fr: `== compare les références, equals le contenu. Le piège : Integer met en cache -128..127, donc == "marche" en test et casse en prod avec de grandes valeurs. equals partout pour les objets.`,
            en: `== compares references, equals compares content. The trap: Integer caches -128..127, so == "works" in tests and breaks in prod with larger values. Use equals everywhere for objects.`,
          },
        },
        {
          id: 'java-equals-hashcode-contract',
          title: { fr: 'Le contrat equals()/hashCode()', en: 'The equals()/hashCode() contract' },
          code: `@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Point p)) return false;
    return x == p.x && y == p.y;
}
@Override
public int hashCode() { return Objects.hash(x, y); }`,
          note: {
            fr: `Règle d'or : deux objets equals() DOIVENT avoir le même hashCode(). La casser corrompt silencieusement HashMap/HashSet (un objet devient introuvable après insertion). Utilisez Objects.hash(...) plutôt qu'un calcul manuel.`,
            en: `Golden rule: two equals() objects MUST have the same hashCode(). Breaking it silently corrupts HashMap/HashSet (an object becomes unfindable after insertion). Use Objects.hash(...) instead of a hand-rolled calculation.`,
          },
        },
        {
          id: 'java-enum-behavior',
          title: { fr: 'Enum avec comportement par constante', en: 'Enum with per-constant behavior' },
          code: `enum Operation {
    PLUS { public int apply(int a, int b) { return a + b; } },
    MINUS { public int apply(int a, int b) { return a - b; } };
    public abstract int apply(int a, int b);
}
int r = Operation.PLUS.apply(2, 3);  // 5`,
          note: {
            fr: `Chaque constante peut redéfinir une méthode abstraite avec son propre corps — plus sûr qu'un switch externe car le compilateur impose une implémentation par constante, y compris pour une nouvelle valeur ajoutée.`,
            en: `Each constant can override an abstract method with its own body — safer than an external switch because the compiler enforces an implementation per constant, including for any newly added value.`,
          },
        },
      ],
    },
    {
      id: 'collections',
      title: { fr: 'Collections', en: 'Collections' },
      items: [
        {
          id: 'java-list-of',
          title: { fr: 'List.of / Map.of : immuables !', en: 'List.of / Map.of: immutable!' },
          code: `var jours = List.of("lun", "mar", "mer");
var ages = Map.of("Ada", 36, "Alan", 41);
// jours.add("jeu");  // UnsupportedOperationException à l'exécution !
var mutable = new ArrayList<>(jours);  // copie modifiable si besoin
// List.of(null) => NullPointerException : null interdit aussi`,
          note: {
            fr: `Les fabriques List.of/Map.of/Set.of (9) renvoient des collections vraiment immuables : add/remove lèvent UnsupportedOperationException et null est refusé. Le compilateur ne prévient pas — c'est un crash à l'exécution.`,
            en: `The List.of/Map.of/Set.of factories (9) return truly immutable collections: add/remove throw UnsupportedOperationException and null is rejected. The compiler won't warn you — it crashes at runtime.`,
          },
        },
        {
          id: 'java-arraylist-vs-linkedlist',
          title: { fr: 'ArrayList vs LinkedList', en: 'ArrayList vs LinkedList' },
          code: `var liste = new ArrayList<String>();  // le bon choix dans ~99 % des cas
liste.add("a");          // amorti O(1)
liste.get(0);            // O(1) — accès direct au tableau
// LinkedList : get(i) est O(n), et le cache CPU déteste
// les nœuds éparpillés ; ArrayDeque bat LinkedList même en file`,
          note: {
            fr: `Spoiler : ArrayList gagne presque toujours. LinkedList promet des insertions O(1) mais il faut d'abord atteindre le nœud (O(n)) et la localité mémoire est catastrophique. Pour une file/pile : ArrayDeque.`,
            en: `Spoiler: ArrayList wins almost every time. LinkedList promises O(1) insertions but you must reach the node first (O(n)) and memory locality is terrible. For a queue/stack: ArrayDeque.`,
          },
        },
        {
          id: 'java-hashmap-helpers',
          title: { fr: 'HashMap : getOrDefault, computeIfAbsent, merge', en: 'HashMap: getOrDefault, computeIfAbsent, merge' },
          code: `var compteur = new HashMap<String, Integer>();
compteur.merge("a", 1, Integer::sum);       // compteur idiomatique
int n = compteur.getOrDefault("z", 0);      // pas de null à gérer
var index = new HashMap<String, List<String>>();
index.computeIfAbsent("k", k -> new ArrayList<>()).add("v");
// fini le if (map.get(k) == null) { map.put(k, ...); }`,
          note: {
            fr: `Ces trois méthodes (8) éliminent le pattern get-puis-put et ses null checks. merge pour les compteurs, computeIfAbsent pour les multi-maps : une seule recherche de clé au lieu de deux.`,
            en: `These three methods (8) kill the get-then-put pattern and its null checks. merge for counters, computeIfAbsent for multi-maps: a single key lookup instead of two.`,
          },
        },
        {
          id: 'java-views',
          title: { fr: 'Les vues : subList, keySet… des pièges', en: 'Views: subList, keySet… traps' },
          code: `var liste = new ArrayList<>(List.of(1, 2, 3, 4, 5));
var sub = liste.subList(0, 2);   // VUE sur liste, pas une copie
sub.clear();                     // ...vide aussi le début de liste !
System.out.println(liste);       // [3, 4, 5]
map.keySet().remove("k");        // retire l'entrée de la map
var copie = List.copyOf(sub);    // vraie copie indépendante`,
          note: {
            fr: `subList, keySet, values, entrySet sont des vues : modifier la vue modifie la source, et modifier la source invalide la vue (ConcurrentModificationException). Pour une copie indépendante : List.copyOf ou new ArrayList<>(...).`,
            en: `subList, keySet, values, entrySet are views: mutating the view mutates the source, and mutating the source invalidates the view (ConcurrentModificationException). For an independent copy: List.copyOf or new ArrayList<>(...).`,
          },
        },
        {
          id: 'java-comparator',
          title: { fr: 'Comparator.comparing + thenComparing', en: 'Comparator.comparing + thenComparing' },
          code: `users.sort(Comparator.comparing(User::nom)
    .thenComparing(User::age, Comparator.reverseOrder()));
// tri null-safe :
users.sort(Comparator.comparing(User::nom,
    Comparator.nullsLast(Comparator.naturalOrder())));`,
          note: {
            fr: `comparing + thenComparing composent des tris multi-critères lisibles, fini les compareTo manuels bourrés de if. Attention : un champ null fait exploser comparing — enveloppez avec nullsFirst/nullsLast.`,
            en: `comparing + thenComparing compose readable multi-key sorts, no more hand-written compareTo full of ifs. Careful: a null field blows up comparing — wrap with nullsFirst/nullsLast.`,
          },
        },
        {
          id: 'java-removeif',
          title: { fr: 'Modifier en itérant : removeIf', en: 'Mutating while iterating: removeIf' },
          code: `for (var s : liste) {
  // if (s.isEmpty()) liste.remove(s);  // ConcurrentModificationException !
}
liste.removeIf(String::isEmpty);          // la bonne façon
map.values().removeIf(v -> v == 0);       // marche aussi via les vues
// ou : var it = liste.iterator(); ... it.remove();`,
          note: {
            fr: `Supprimer pendant un for-each lève ConcurrentModificationException (parfois… seulement parfois, c'est le pire). removeIf est sûr, expressif, et souvent plus rapide qu'un Iterator manuel.`,
            en: `Removing inside a for-each throws ConcurrentModificationException (sometimes… only sometimes, which is worse). removeIf is safe, expressive, and often faster than a manual Iterator.`,
          },
        },
      ],
    },
    {
      id: 'streams',
      title: { fr: 'Streams & Optional', en: 'Streams & Optional' },
      items: [
        {
          id: 'java-stream-pipeline',
          title: { fr: 'filter / map / collect', en: 'filter / map / collect' },
          code: `var noms = users.stream()
    .filter(u -> u.age() >= 18)   // garde les majeurs
    .map(User::nom)               // transforme en String
    .sorted()
    .toList();                    // Java 16+ : .toList() direct
// rien ne s'exécute avant l'opération terminale (toList)`,
          note: {
            fr: `Un stream est paresseux : filter/map ne font rien tant qu'une opération terminale (toList, count, forEach…) n'est pas appelée. Depuis Java 16, .toList() remplace collect(Collectors.toList()) — et renvoie une liste non modifiable.`,
            en: `A stream is lazy: filter/map do nothing until a terminal operation (toList, count, forEach…) runs. Since Java 16, .toList() replaces collect(Collectors.toList()) — and returns an unmodifiable list.`,
          },
        },
        {
          id: 'java-collectors',
          title: { fr: 'Collectors : groupingBy, joining', en: 'Collectors: groupingBy, joining' },
          code: `Map<String, List<User>> parVille = users.stream()
    .collect(Collectors.groupingBy(User::ville));
Map<String, Long> compte = users.stream()
    .collect(Collectors.groupingBy(User::ville, Collectors.counting()));
String csv = noms.stream()
    .collect(Collectors.joining(", ", "[", "]")); // "[a, b, c]"`,
          note: {
            fr: `groupingBy remplace les boucles « créer la liste si absente puis ajouter ». Le second argument (counting, mapping, summingInt…) agrège chaque groupe. joining gère séparateur, préfixe et suffixe d'un coup.`,
            en: `groupingBy replaces the "create list if missing then add" loops. The second argument (counting, mapping, summingInt…) aggregates each group. joining handles separator, prefix and suffix in one go.`,
          },
        },
        {
          id: 'java-optional',
          title: { fr: 'Optional : LE bon usage', en: 'Optional: THE right way' },
          code: `Optional<User> findUser(String id) { ... }  // retour de méthode : OUI
String nom = findUser("42")
    .map(User::nom)
    .orElse("inconnu");           // jamais .get() sans vérifier
findUser("42").ifPresent(u -> log(u));
// NON : champ Optional, paramètre Optional, Optional.get() nu`,
          note: {
            fr: `Optional est conçu pour les retours de méthode : il force l'appelant à gérer l'absence via map/orElse/ifPresent. En champ ou en paramètre c'est un anti-pattern (non sérialisable, alourdit l'API). Et .get() sans isPresent = NoSuchElementException.`,
            en: `Optional is designed for return types: it forces the caller to handle absence via map/orElse/ifPresent. As a field or parameter it's an anti-pattern (not serializable, bloats the API). And bare .get() = NoSuchElementException.`,
          },
        },
        {
          id: 'java-flatmap',
          title: { fr: 'flatMap : aplatir les imbrications', en: 'flatMap: flatten nesting' },
          code: `// List<Commande> -> toutes les lignes de toutes les commandes
var lignes = commandes.stream()
    .flatMap(c -> c.lignes().stream())  // Stream<Stream<T>> -> Stream<T>
    .toList();
// aussi sur Optional : opt.flatMap(this::autreOptional)
// évite Optional<Optional<User>>`,
          note: {
            fr: `map sur une fonction qui renvoie un stream donne un Stream<Stream<T>> inutilisable ; flatMap fusionne les niveaux. Même logique sur Optional pour chaîner des méthodes qui renvoient elles-mêmes un Optional.`,
            en: `map over a function returning a stream yields an unusable Stream<Stream<T>>; flatMap merges the levels. Same logic on Optional to chain methods that themselves return an Optional.`,
          },
        },
        {
          id: 'java-stream-pitfalls',
          title: { fr: 'Pièges : réutilisation, effets de bord', en: 'Pitfalls: reuse, side effects' },
          code: `var s = liste.stream();
s.count();
// s.count();  // IllegalStateException : stream déjà consommé !
var total = new int[1];
liste.stream().forEach(x -> total[0] += x);  // effet de bord : NON
int ok = liste.stream().mapToInt(Integer::intValue).sum(); // OUI`,
          note: {
            fr: `Un stream se consomme une seule fois : repartez de la collection pour un second parcours. Et muter un état externe dans forEach/map casse la lisibilité (et le parallélisme) — préférez reduce/sum/collect.`,
            en: `A stream can be consumed only once: go back to the collection for a second pass. And mutating external state in forEach/map breaks readability (and parallelism) — prefer reduce/sum/collect.`,
          },
        },
        {
          id: 'java-parallel-stream',
          title: { fr: 'parallelStream : prudence', en: 'parallelStream: handle with care' },
          code: `// tentant... mais mesurez avant :
long n = grosseListe.parallelStream()
    .filter(this::calculCouteux)   // CPU-bound + gros volume : OK
    .count();
// petit volume, I/O, ou lambda avec état partagé : plus LENT et bugué
// tout le monde partage le ForkJoinPool.commonPool()`,
          note: {
            fr: `parallelStream n'est rentable que pour un gros volume ET un calcul CPU-bound sans état partagé. Pour de l'I/O ou de petites listes, le coût de découpage dépasse le gain — et le commonPool est partagé par toute la JVM.`,
            en: `parallelStream only pays off for large volumes AND CPU-bound work with no shared state. For I/O or small lists, the splitting overhead exceeds the gain — and the commonPool is shared by the whole JVM.`,
          },
        },
      ],
    },
    {
      id: 'exceptions',
      title: { fr: 'Exceptions & null', en: 'Exceptions & null' },
      items: [
        {
          id: 'java-checked-unchecked',
          title: { fr: 'Checked vs unchecked', en: 'Checked vs unchecked' },
          code: `// checked : le compilateur force throws ou try/catch
void lire() throws IOException { Files.readString(path); }
// unchecked (RuntimeException) : rien d'imposé
int x = Integer.parseInt("abc");  // NumberFormatException possible
// pattern courant : envelopper en unchecked
catch (IOException e) { throw new UncheckedIOException(e); }`,
          note: {
            fr: `Les checked exceptions (IOException…) doivent être déclarées ou attrapées ; les unchecked (NullPointerException…) non. Le débat fait rage : les API modernes (et les lambdas, incompatibles avec throws) préfèrent les unchecked enveloppant la cause.`,
            en: `Checked exceptions (IOException…) must be declared or caught; unchecked (NullPointerException…) need not. The debate rages on: modern APIs (and lambdas, which can't throw checked) prefer unchecked wrapping the cause.`,
          },
        },
        {
          id: 'java-try-with-resources',
          title: { fr: 'try-with-resources : LE bon pattern', en: 'try-with-resources: THE right pattern' },
          code: `try (var in = Files.newBufferedReader(path);
     var out = Files.newBufferedWriter(dest)) {
  out.write(in.readLine());
}   // close() automatique, dans l'ordre inverse, même si exception
// fini le finally { if (in != null) try { in.close() } catch ... }`,
          note: {
            fr: `Tout AutoCloseable déclaré dans le try est fermé automatiquement, même en cas d'exception — et une exception de close() est attachée en « suppressed » au lieu d'écraser l'originale. Le finally manuel se trompe presque toujours sur ce point.`,
            en: `Any AutoCloseable declared in the try is closed automatically, even on exception — and a close() exception is attached as "suppressed" instead of clobbering the original. Hand-written finally almost always gets this wrong.`,
          },
        },
        {
          id: 'java-multi-catch',
          title: { fr: 'Multi-catch', en: 'Multi-catch' },
          code: `try {
  process(data);
} catch (IOException | SQLException e) {  // un seul bloc pour les deux
  log.error("échec du traitement", e);
  throw new ServiceException("traitement impossible", e);
}
// interdit si l'un est sous-classe de l'autre`,
          note: {
            fr: `catch (A | B e) évite de dupliquer le même bloc de gestion. La variable e est implicitement final et typée comme l'ancêtre commun. Refusé si un type est sous-classe de l'autre (le parent suffit alors).`,
            en: `catch (A | B e) avoids duplicating the same handling block. The variable e is implicitly final and typed as the common ancestor. Rejected if one type subclasses the other (the parent alone suffices).`,
          },
        },
        {
          id: 'java-requirenonnull',
          title: { fr: 'Objects.requireNonNull : échouer tôt', en: 'Objects.requireNonNull: fail fast' },
          code: `record Service(Repo repo) {
  Service {
    Objects.requireNonNull(repo, "repo ne doit pas être null");
  }
}
var v = Objects.requireNonNullElse(param, "défaut"); // avec repli
// le NPE pointe ICI, pas 3 couches plus loin au premier usage`,
          note: {
            fr: `Valider les arguments à l'entrée fait éclater le NullPointerException au bon endroit, avec un message clair — au lieu d'un NPE mystérieux loin de la cause. Les « helpful NPE » (JEP 358) sont apparues en Java 14 mais désactivées par défaut ; elles indiquent la variable null depuis Java 15, activées par défaut.`,
            en: `Validating arguments at the boundary makes the NullPointerException blow up in the right place, with a clear message — instead of a mysterious NPE far from the cause. "Helpful NPEs" (JEP 358) landed in Java 14 but off by default; they name the null variable by default since Java 15.`,
          },
        },
        {
          id: 'java-exception-cause',
          title: { fr: 'La chaîne des causes', en: 'The cause chain' },
          code: `try {
  dao.save(user);
} catch (SQLException e) {
  // TOUJOURS passer la cause, jamais l'avaler :
  throw new PersistenceException("sauvegarde impossible", e);
}
// e.getCause() remonte la chaîne ; la stack trace affiche "Caused by:"`,
          note: {
            fr: `Relancer sans la cause (throw new X(msg)) détruit la stack trace d'origine : impossible de déboguer. Passez toujours l'exception attrapée en second argument — le « Caused by: » du log raconte alors toute l'histoire.`,
            en: `Rethrowing without the cause (throw new X(msg)) destroys the original stack trace: debugging becomes impossible. Always pass the caught exception as second argument — the log's "Caused by:" then tells the whole story.`,
          },
        },
        {
          id: 'java-nio-files',
          title: { fr: 'NIO : Files & Path', en: 'NIO: Files & Path' },
          code: `Path path = Path.of("data.txt");
List<String> lines = Files.readAllLines(path);
Files.writeString(path, "contenu", StandardOpenOption.APPEND);
boolean exists = Files.exists(path);
try (Stream<Path> files = Files.list(Path.of("."))) {
    files.forEach(System.out::println);
}`,
          note: {
            fr: `Files/Path (java.nio.file, depuis Java 7) remplace l'ancien java.io.File : opérations en une ligne (readAllLines, writeString), exceptions plus précises (NoSuchFileException), et Files.list renvoie un Stream à fermer via try-with-resources.`,
            en: `Files/Path (java.nio.file, since Java 7) replaces the old java.io.File: one-line operations (readAllLines, writeString), more precise exceptions (NoSuchFileException), and Files.list returns a Stream that must be closed via try-with-resources.`,
          },
        },
      ],
    },
    {
      id: 'concurrency',
      title: { fr: 'Concurrence', en: 'Concurrency' },
      items: [
        {
          id: 'java-virtual-threads',
          title: { fr: 'Virtual threads (21) : le game changer', en: 'Virtual threads (21): the game changer' },
          code: `// des millions de threads légers, gérés par la JVM :
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
  for (var url : urls) {
    executor.submit(() -> fetch(url));  // un thread virtuel par tâche
  }
}   // attend la fin de toutes les tâches
Thread.ofVirtual().start(() -> traiter());  // ou à la main`,
          note: {
            fr: `Les virtual threads (21) rendent le code bloquant scalable : un thread virtuel en attente d'I/O libère son thread porteur. Plus besoin de réactif/callback pour la plupart des serveurs — un thread par requête redevient viable. Piège : éviter les longs blocs synchronized (pinning).`,
            en: `Virtual threads (21) make blocking code scalable: a virtual thread waiting on I/O releases its carrier thread. No more reactive/callbacks needed for most servers — thread-per-request is viable again. Gotcha: avoid long synchronized blocks (pinning).`,
          },
        },
        {
          id: 'java-completablefuture',
          title: { fr: 'CompletableFuture en bref', en: 'CompletableFuture in short' },
          code: `CompletableFuture.supplyAsync(() -> fetchUser(id))
    .thenApply(User::nom)                 // transformation
    .thenCombine(fetchScoreAsync(id),     // combine 2 futures
        (nom, score) -> nom + " : " + score)
    .exceptionally(e -> "erreur : " + e.getMessage())
    .thenAccept(System.out::println);     // consommation finale`,
          note: {
            fr: `CompletableFuture chaîne des étapes asynchrones sans bloquer : thenApply transforme, thenCombine fusionne, exceptionally rattrape. Avec les virtual threads, du code bloquant simple suffit souvent — gardez CompletableFuture pour le vrai parallélisme de tâches.`,
            en: `CompletableFuture chains async steps without blocking: thenApply transforms, thenCombine merges, exceptionally recovers. With virtual threads, plain blocking code is often enough — keep CompletableFuture for true task parallelism.`,
          },
        },
        {
          id: 'java-locks',
          title: { fr: 'synchronized vs ReentrantLock', en: 'synchronized vs ReentrantLock' },
          code: `synchronized (verrou) { solde += montant; }  // simple, suffisant souvent

private final ReentrantLock lock = new ReentrantLock();
lock.lock();
try { solde += montant; }       // ReentrantLock : tryLock, timeout,
finally { lock.unlock(); }      // équité, plusieurs Conditions
// le finally est OBLIGATOIRE, sinon verrou perdu à jamais`,
          note: {
            fr: `synchronized est plus simple et se libère tout seul ; ReentrantLock ajoute tryLock(timeout), l'équité et plusieurs Conditions — mais exige le unlock dans un finally. Avec les virtual threads (avant Java 24), préférez ReentrantLock pour éviter le pinning.`,
            en: `synchronized is simpler and releases itself; ReentrantLock adds tryLock(timeout), fairness and multiple Conditions — but demands unlock in a finally. With virtual threads (before Java 24), prefer ReentrantLock to avoid pinning.`,
          },
        },
        {
          id: 'java-atomic',
          title: { fr: 'AtomicInteger : compteur sans verrou', en: 'AtomicInteger: lock-free counter' },
          code: `private final AtomicInteger compteur = new AtomicInteger();
compteur.incrementAndGet();          // atomique, sans synchronized
compteur.addAndGet(5);
compteur.compareAndSet(10, 0);       // CAS : remet à 0 si vaut 10
// int compteur++; depuis plusieurs threads = valeurs perdues
// (lecture + addition + écriture : 3 étapes interruptibles)`,
          note: {
            fr: `compteur++ n'est pas atomique : deux threads peuvent lire la même valeur et perdre un incrément. AtomicInteger utilise une instruction CPU compare-and-swap, plus léger qu'un verrou. Pour un compteur très disputé : LongAdder.`,
            en: `counter++ is not atomic: two threads can read the same value and lose an increment. AtomicInteger uses a CPU compare-and-swap instruction, lighter than a lock. For a heavily contended counter: LongAdder.`,
          },
        },
        {
          id: 'java-concurrenthashmap',
          title: { fr: 'ConcurrentHashMap', en: 'ConcurrentHashMap' },
          code: `var cache = new ConcurrentHashMap<String, User>();
cache.computeIfAbsent(id, this::charger);  // atomique : 1 seul thread calcule
cache.merge(id, 1, Integer::sum);          // compteur thread-safe
// HashMap partagée entre threads = corruption silencieuse
// Collections.synchronizedMap : verrou global, bien plus lent
// piège : pas de fonction longue/bloquante dans computeIfAbsent`,
          note: {
            fr: `Une HashMap modifiée par plusieurs threads se corrompt silencieusement (boucles infinies, données perdues). ConcurrentHashMap segmente les verrous et rend computeIfAbsent/merge atomiques — la base d'un cache. Évitez les calculs bloquants dans compute : ils verrouillent le bucket.`,
            en: `A HashMap mutated by several threads corrupts silently (infinite loops, lost data). ConcurrentHashMap stripes its locks and makes computeIfAbsent/merge atomic — the basis of a cache. Avoid blocking work inside compute: it locks the bucket.`,
          },
        },
        {
          id: 'java-executor-shutdown',
          title: { fr: 'ExecutorService : shutdown propre', en: 'ExecutorService: clean shutdown' },
          code: `var pool = Executors.newFixedThreadPool(4);
pool.submit(tache);
pool.shutdown();                          // refuse les nouvelles tâches
if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
  pool.shutdownNow();                     // interrompt ce qui reste
}
// Java 19+ : ExecutorService est AutoCloseable -> try-with-resources`,
          note: {
            fr: `Sans shutdown, les threads non-daemon du pool empêchent la JVM de s'arrêter — le programme « pend » à la fin du main. Depuis Java 19, ExecutorService est AutoCloseable : un try-with-resources attend les tâches et ferme proprement.`,
            en: `Without shutdown, the pool's non-daemon threads keep the JVM alive — the program "hangs" at the end of main. Since Java 19, ExecutorService is AutoCloseable: a try-with-resources awaits tasks and closes cleanly.`,
          },
        },
      ],
    },
    {
      id: 'tooling',
      title: { fr: 'Outillage', en: 'Tooling' },
      items: [
        {
          id: 'java-maven-gradle',
          title: { fr: 'Maven vs Gradle en 2 lignes', en: 'Maven vs Gradle in 2 lines' },
          code: `// Maven : XML déclaratif, conventions rigides, écosystème énorme
mvn clean verify          // compile + tests + packaging
// Gradle : Kotlin/Groovy DSL, builds incrémentaux + cache, plus rapide
./gradlew build --scan    // le wrapper fige la version de Gradle
// les deux : utilisez TOUJOURS le wrapper (mvnw / gradlew) commité`,
          note: {
            fr: `Maven : prévisible, verbeux, le standard en entreprise. Gradle : flexible et rapide (cache, incrémental) mais le DSL se transforme vite en code à maintenir. Dans les deux cas, commitez le wrapper pour que tout le monde build avec la même version.`,
            en: `Maven: predictable, verbose, the enterprise standard. Gradle: flexible and fast (cache, incremental) but the DSL quickly becomes code to maintain. Either way, commit the wrapper so everyone builds with the same version.`,
          },
        },
        {
          id: 'java-junit5',
          title: { fr: 'JUnit 5 (+ parameterized)', en: 'JUnit 5 (+ parameterized)' },
          code: `@Test
void calcule_le_total() {
  assertEquals(42, panier.total());
  assertThrows(IllegalStateException.class, panier::valider);
}
@ParameterizedTest
@ValueSource(strings = { "", " ", "\\t" })
void rejette_les_blancs(String input) {
  assertFalse(Validator.isValid(input));  // 1 test, 3 cas
}`,
          note: {
            fr: `JUnit 5 (Jupiter) : plus de classes/méthodes publiques obligatoires, assertThrows intégré, @DisplayName lisible. @ParameterizedTest avec @ValueSource/@CsvSource/@MethodSource factorise les cas limites au lieu de copier-coller des tests.`,
            en: `JUnit 5 (Jupiter): no more mandatory public classes/methods, built-in assertThrows, readable @DisplayName. @ParameterizedTest with @ValueSource/@CsvSource/@MethodSource factors out edge cases instead of copy-pasting tests.`,
          },
        },
        {
          id: 'java-jshell',
          title: { fr: 'jshell : le REPL méconnu', en: 'jshell: the overlooked REPL' },
          code: `$ jshell                      // livré avec le JDK depuis Java 9
jshell> var l = List.of(1, 2, 3)
jshell> l.stream().map(x -> x * 2).toList()
$2 ==> [2, 4, 6]              // résultat immédiat, sans classe ni main
jshell> /vars                 // liste les variables ; /exit pour sortir`,
          note: {
            fr: `jshell (9) permet de tester une API, un stream ou un bout d'algorithme en secondes — sans créer de classe, de main ni de projet. Point-virgule optionnel, imports java.util déjà faits. Sous-utilisé alors qu'il est dans chaque JDK.`,
            en: `jshell (9) lets you try an API, a stream or an algorithm snippet in seconds — no class, no main, no project. Semicolons optional, java.util already imported. Underused even though it ships with every JDK.`,
          },
        },
        {
          id: 'java-cli-tools',
          title: { fr: 'javap, jar, java -jar, java Fichier.java', en: 'javap, jar, java -jar, java File.java' },
          code: `java Hello.java               // 11+ : exécute un .java direct, sans javac
java -jar app.jar             // lance un jar exécutable (Main-Class du manifest)
jar tf app.jar                // liste le contenu du jar
javap -c MaClasse             // désassemble le bytecode (voir ce que fait javac)
jps                           // liste les JVM en cours ; jstack <pid> : thread dump`,
          note: {
            fr: `java Fichier.java (11) lance un script sans compilation explicite — et Java 25 simplifie encore les programmes avec main() seul. javap répond à « que génère vraiment le compilateur ? » et jps/jstack sont vos premiers réflexes face à une JVM qui bloque.`,
            en: `java File.java (11) runs a script with no explicit compilation — and Java 25 further simplifies single-main programs. javap answers "what does the compiler really emit?" and jps/jstack are your first reflexes when a JVM hangs.`,
          },
        },
        {
          id: 'java-jvm-flags',
          title: { fr: 'Flags JVM utiles', en: 'Useful JVM flags' },
          code: `java -Xmx512m -Xms512m -jar app.jar   // plafonne le tas (Xms=Xmx : stable)
java -XX:+HeapDumpOnOutOfMemoryError \\
     -XX:HeapDumpPath=/tmp/dump.hprof -jar app.jar
java -XX:MaxRAMPercentage=75 -jar app.jar  // en conteneur : % de la RAM
java -XX:+PrintFlagsFinal -version | grep MaxHeap  // valeurs effectives`,
          note: {
            fr: `-Xmx évite qu'un conteneur soit OOM-killé ; HeapDumpOnOutOfMemoryError capture l'état mémoire au crash (à analyser avec Eclipse MAT) — gratuit en fonctionnement normal, inestimable le jour J. En Docker/K8s, MaxRAMPercentage s'adapte à la limite du conteneur.`,
            en: `-Xmx keeps a container from being OOM-killed; HeapDumpOnOutOfMemoryError captures the memory state at crash time (analyze with Eclipse MAT) — free in normal operation, priceless on the bad day. In Docker/K8s, MaxRAMPercentage adapts to the container limit.`,
          },
        },
        {
          id: 'java-records-jackson',
          title: { fr: 'Records + Jackson', en: 'Records + Jackson' },
          code: `record UserDto(String nom, int age,
    @JsonProperty("email_pro") String email) {}  // mapping de nom
var mapper = new ObjectMapper();
UserDto u = mapper.readValue(json, UserDto.class);  // désérialisation directe
String out = mapper.writeValueAsString(u);
// Jackson 2.12+ : aucun @JsonCreator nécessaire pour les records`,
          note: {
            fr: `Depuis Jackson 2.12, les records se (dé)sérialisent nativement via leur constructeur canonique : zéro annotation pour le cas simple, des DTO immuables sans setters. @JsonProperty sur un composant gère les noms qui divergent du JSON.`,
            en: `Since Jackson 2.12, records (de)serialize natively through their canonical constructor: zero annotations for the simple case, immutable DTOs without setters. @JsonProperty on a component handles names that differ from the JSON.`,
          },
        },
      ],
    },
    {
      id: 'java-generics',
      title: { fr: 'Génériques', en: 'Generics' },
      items: [
        {
          id: 'java-generics-bounded',
          title: { fr: 'Types bornés : <T extends X>', en: 'Bounded types: <T extends X>' },
          code: `static <T extends Comparable<T>> T max(List<T> items) {
    T best = items.get(0);
    for (T item : items) if (item.compareTo(best) > 0) best = item;
    return best;
}`,
          note: {
            fr: `extends borne T aux sous-types de Comparable<T> (et Object implicitement) : ça donne accès à compareTo() sans cast, tout en gardant le typage statique de T à l'appel.`,
            en: `extends bounds T to Comparable<T> subtypes (and implicitly Object): it gives access to compareTo() without a cast, while keeping T statically typed at the call site.`,
          },
        },
        {
          id: 'java-generics-wildcard-extends',
          title: { fr: '? extends : lire un producer', en: '? extends: reading a producer' },
          code: `static double sum(List<? extends Number> numbers) {
    double total = 0;
    for (Number n : numbers) total += n.doubleValue();  // lecture OK
    // numbers.add(1);  // ERREUR : écriture interdite
    return total;
}
sum(List.of(1, 2, 3));       // List<Integer> accepté
sum(List.of(1.5, 2.5));      // List<Double> accepté aussi`,
          note: {
            fr: `List<? extends Number> accepte une liste de N'IMPORTE QUEL sous-type de Number en lecture, mais interdit l'écriture (le compilateur ne sait pas quel sous-type précis c'est) — le PECS : Producer Extends.`,
            en: `List<? extends Number> accepts a list of ANY Number subtype for reading, but forbids writing (the compiler doesn't know the exact subtype) — PECS: Producer Extends.`,
          },
        },
        {
          id: 'java-generics-wildcard-super',
          title: { fr: '? super : écrire dans un consumer', en: '? super: writing into a consumer' },
          code: `static void addNumbers(List<? super Integer> list) {
    list.add(1);          // écriture OK : Integer ou un ancêtre
    // Integer n = list.get(0);  // lecture limitée à Object
}
List<Number> nums = new ArrayList<>();
addNumbers(nums);          // List<Number> accepte des Integer`,
          note: {
            fr: `List<? super Integer> accepte une liste d'Integer OU d'un de ses ancêtres, et autorise l'écriture d'Integer — la lecture ne renvoie qu'un Object. PECS : Consumer Super.`,
            en: `List<? super Integer> accepts a list of Integer OR one of its ancestors, and allows writing Integer values — reading only returns an Object. PECS: Consumer Super.`,
          },
        },
      ],
    },
    {
      id: 'java-time',
      title: { fr: 'java.time', en: 'java.time' },
      items: [
        {
          id: 'java-time-localdate',
          title: { fr: 'LocalDate / LocalDateTime', en: 'LocalDate / LocalDateTime' },
          code: `LocalDate today = LocalDate.now();
LocalDate birthday = LocalDate.of(1990, Month.MARCH, 15);
LocalDate nextWeek = today.plusWeeks(1);
Period age = Period.between(birthday, today);
System.out.println(age.getYears() + " ans");`,
          note: {
            fr: `LocalDate/LocalDateTime sont IMMUABLES (plusWeeks renvoie une nouvelle instance) et sans fuseau horaire — parfaits pour une date de naissance ou un rendez-vous "mur" indépendant du lieu.`,
            en: `LocalDate/LocalDateTime are IMMUTABLE (plusWeeks returns a new instance) and timezone-free — perfect for a birthdate or a "wall clock" appointment independent of location.`,
          },
        },
        {
          id: 'java-time-instant-zone',
          title: { fr: 'Instant & ZonedDateTime : le temps absolu', en: 'Instant & ZonedDateTime: absolute time' },
          code: `Instant now = Instant.now();                      // point UTC unique
ZonedDateTime paris = now.atZone(ZoneId.of("Europe/Paris"));
ZonedDateTime tokyo = now.atZone(ZoneId.of("Asia/Tokyo"));
long epochSeconds = now.getEpochSecond();`,
          note: {
            fr: `Instant représente un point sur la ligne du temps (UTC, epoch), indépendant de tout fuseau — l'idéal pour horodater un événement serveur. ZonedDateTime l'affiche localement pour un utilisateur.`,
            en: `Instant represents a point on the timeline (UTC, epoch), independent of any timezone — ideal for timestamping a server event. ZonedDateTime displays it locally for a user.`,
          },
        },
        {
          id: 'java-time-duration',
          title: { fr: 'Duration & Period : mesurer un écart', en: 'Duration & Period: measuring a gap' },
          code: `Duration elapsed = Duration.between(start, Instant.now());
System.out.println(elapsed.toMillis() + " ms");
Period until = Period.between(LocalDate.now(), deadline);
if (elapsed.compareTo(Duration.ofSeconds(30)) > 0) { /* timeout */ }`,
          note: {
            fr: `Duration mesure un écart en temps machine (secondes/nanos, pour un timeout ou un chrono) ; Period mesure un écart calendaire (années/mois/jours, pour un âge ou une échéance). Ne pas les confondre.`,
            en: `Duration measures a machine-time gap (seconds/nanos, for a timeout or a stopwatch); Period measures a calendar gap (years/months/days, for an age or a deadline). Don't mix them up.`,
          },
        },
      ],
    },
    {
      id: 'java-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'java-bp-immutability',
          title: { fr: "Favoriser l'immutabilité", en: 'Favor immutability' },
          code: `public final class Money {
    private final long cents;
    public Money(long cents) { this.cents = cents; }
}`,
          note: {
            fr: `Un objet immuable (final, pas de setters) est thread-safe par construction et élimine toute une classe de bugs liés à un état partagé modifié en douce.`,
            en: `An immutable object (final, no setters) is thread-safe by construction and eliminates a whole class of bugs from quietly shared mutable state.`,
          },
        },
        {
          id: 'java-bp-composition',
          title: { fr: "Composition plutôt qu'héritage", en: 'Favor composition over inheritance' },
          code: `class OrderService {
    private final PaymentGateway gateway;
    OrderService(PaymentGateway gateway) { this.gateway = gateway; }
}`,
          note: {
            fr: `Hériter d'une classe expose son implémentation interne et se casse si la classe mère change ; composer via une interface injectée reste stable et testable.`,
            en: `Inheriting from a class exposes its internals and breaks if the parent changes; composing via an injected interface stays stable and testable.`,
          },
        },
        {
          id: 'java-bp-logging',
          title: { fr: 'Utiliser un logger, jamais System.out', en: 'Use a logger, never System.out' },
          code: `private static final Logger log = LoggerFactory.getLogger(OrderService.class);
log.error("échec de paiement pour {}", orderId, e);`,
          note: {
            fr: `System.out.println/e.printStackTrace ne peuvent pas être filtrés, routés ou désactivés en prod ; un logger (SLF4J) gère niveaux, format et destination.`,
            en: `System.out.println/e.printStackTrace can't be filtered, routed, or disabled in prod; a logger (SLF4J) handles levels, formatting, and destinations.`,
          },
        },
        {
          id: 'java-bp-custom-exceptions',
          title: { fr: 'Exceptions métier spécifiques', en: 'Specific domain exceptions' },
          code: `public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String id) { super("Commande introuvable : " + id); }
}`,
          note: {
            fr: `throw new RuntimeException("...") oblige l'appelant à parser un message pour savoir quoi faire ; un type dédié permet un catch ciblé et un traitement adapté.`,
            en: `throw new RuntimeException("...") forces the caller to parse a message to know what happened; a dedicated type enables targeted catches and proper handling.`,
          },
        },
        {
          id: 'java-bp-builder',
          title: { fr: 'Builder pour les constructeurs à nombreux paramètres', en: 'Builder for constructors with many parameters' },
          code: `var req = HttpRequest.newBuilder(uri).timeout(d).GET().build();`,
          note: {
            fr: `Au-delà de 3-4 paramètres, un constructeur devient ambigu (ordre, types identiques) ; un builder nomme chaque valeur et permet des défauts clairs.`,
            en: `Beyond 3-4 parameters, a constructor becomes ambiguous (order, identical types); a builder names each value and allows clear defaults.`,
          },
        },
      ],
    },
  ],
};
