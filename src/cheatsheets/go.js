/**
 * Cheatsheet Go — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'go',
  lang: 'go',
  sections: [
    {
      id: 'basics',
      title: { fr: 'Bases & idiomes', en: 'Basics & idioms' },
      items: [
        {
          id: 'go-short-declaration',
          title: { fr: 'Déclaration courte :=', en: 'Short declaration :=' },
          code: `nom := "Ada"            // déclare ET assigne (type inféré)
var age int = 36        // forme longue, explicite
var actif bool          // zéro value : false
nom, age = "Lin", 28    // = pour réassigner (pas :=)
x, err := calcul()      // ok si AU MOINS une variable est nouvelle`,
          note: {
            fr: `:= n'est valide que dans une fonction et déclare une nouvelle variable. Piège : := dans un bloc if/for peut masquer (shadow) une variable extérieure, notamment err.`,
            en: `:= is only valid inside a function and declares a new variable. Gotcha: := inside an if/for block can shadow an outer variable, especially err.`,
          },
        },
        {
          id: 'go-zero-values',
          title: { fr: 'Zero values', en: 'Zero values' },
          code: `var n int       // 0
var s string    // "" (jamais nil)
var p *int      // nil
var sl []int    // nil — mais len(sl) == 0 et append marchent
var m map[string]int // nil — lecture ok, ÉCRITURE = panic`,
          note: {
            fr: `Toute variable déclarée est utilisable immédiatement : pas de "undefined". Piège majeur : écrire dans une map nil panique, il faut make(map[string]int) d'abord.`,
            en: `Every declared variable is immediately usable: no "undefined". Major gotcha: writing to a nil map panics, you need make(map[string]int) first.`,
          },
        },
        {
          id: 'go-const-iota',
          title: { fr: 'const & iota', en: 'const & iota' },
          code: `const MaxRetries = 3   // constante non typée

type Niveau int
const (
    Debug Niveau = iota // 0 — iota s'incrémente par ligne
    Info                // 1
    Warn                // 2
    Erreur              // 3
)`,
          note: {
            fr: `iota redémarre à 0 dans chaque bloc const et s'incrémente à chaque ligne : c'est l'idiome standard pour les enums. Go n'a pas de vrai type enum, juste des constantes typées.`,
            en: `iota resets to 0 in each const block and increments per line: it is the standard idiom for enums. Go has no real enum type, just typed constants.`,
          },
        },
        {
          id: 'go-for-only-loop',
          title: { fr: 'for — la seule boucle', en: 'for — the only loop' },
          code: `for i := 0; i < 3; i++ { }   // for classique
for n < 100 { n *= 2 }       // équivalent de while
for { break }                // boucle infinie
for i, v := range slice { _ = i; _ = v }
for range 5 { }              // Go 1.22+ : range sur un entier`,
          note: {
            fr: `Pas de while ni de do/while : for couvre tout. Depuis Go 1.22, range 5 itère 5 fois sans variable — pratique pour répéter N fois.`,
            en: `No while or do/while: for covers everything. Since Go 1.22, range 5 iterates 5 times without a variable — handy to repeat N times.`,
          },
        },
        {
          id: 'go-switch',
          title: { fr: 'switch sans break', en: 'switch without break' },
          code: `switch jour {
case "sam", "dim":          // plusieurs valeurs par case
    fmt.Println("week-end") // pas de break : sortie implicite
case "ven":
    fmt.Println("presque")
default:
    fmt.Println("semaine")
}
switch { case n > 100: fmt.Println("grand") } // switch sans expression = if/else chaîné`,
          note: {
            fr: `Contrairement à C/JS, chaque case sort automatiquement : pas de fallthrough accidentel (le mot-clé fallthrough existe si on le veut vraiment). Le switch sans expression remplace élégamment les if/else if.`,
            en: `Unlike C/JS, each case exits automatically: no accidental fallthrough (the fallthrough keyword exists if you really want it). The expressionless switch elegantly replaces if/else if chains.`,
          },
        },
        {
          id: 'go-multiple-returns',
          title: { fr: 'Retours multiples', en: 'Multiple return values' },
          code: `func diviser(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division par zéro")
    }
    return a / b, nil
}
q, err := diviser(10, 2)
_, err2 := diviser(1, 0) // _ ignore une valeur`,
          note: {
            fr: `Le pattern (valeur, error) est LE idiome Go : pas d'exceptions pour le flux normal. Le blank identifier _ jette explicitement une valeur — le compilateur refuse les variables inutilisées.`,
            en: `The (value, error) pattern is THE Go idiom: no exceptions for normal flow. The blank identifier _ explicitly discards a value — the compiler rejects unused variables.`,
          },
        },
      ],
    },
    {
      id: 'slices-maps',
      title: { fr: 'Slices & maps', en: 'Slices & maps' },
      items: [
        {
          id: 'go-slice-make-append',
          title: { fr: 'make, append, len/cap', en: 'make, append, len/cap' },
          code: `s := []int{1, 2, 3}          // littéral
s = append(s, 4, 5)          // append RETOURNE le slice
ids := make([]int, 0, 100)   // len 0, cap 100 : évite les réallocations
fmt.Println(len(s), cap(s))  // longueur vs capacité
a = append(a, b...)          // concatène deux slices`,
          note: {
            fr: `Toujours réassigner le résultat d'append : si la capacité est dépassée, un nouveau tableau sous-jacent est alloué. Pré-dimensionner avec make(cap) quand la taille est connue évite des copies.`,
            en: `Always reassign the result of append: when capacity is exceeded, a new backing array is allocated. Pre-sizing with make(cap) when the size is known avoids copies.`,
          },
        },
        {
          id: 'go-slice-aliasing',
          title: { fr: 'Slicing & backing array partagé', en: 'Slicing & shared backing array' },
          code: `s := []int{1, 2, 3, 4, 5}
sub := s[1:3]        // [2 3] — MÊME tableau sous-jacent
sub[0] = 99
fmt.Println(s)       // [1 99 3 4 5] — s modifié aussi !
indep := slices.Clone(s[1:3]) // copie indépendante (Go 1.21+)`,
          note: {
            fr: `Un slice est une vue (pointeur + len + cap) sur un tableau : slicer ne copie rien. Source classique de bugs : modifier un sous-slice modifie l'original. Cloner quand on veut l'indépendance.`,
            en: `A slice is a view (pointer + len + cap) over an array: slicing copies nothing. Classic bug source: mutating a sub-slice mutates the original. Clone when you need independence.`,
          },
        },
        {
          id: 'go-copy',
          title: { fr: 'copy', en: 'copy' },
          code: `src := []int{1, 2, 3}
dst := make([]int, len(src)) // dst doit avoir la bonne taille
n := copy(dst, src)          // copie min(len(dst), len(src))
fmt.Println(n, dst)          // 3 [1 2 3]
vide := []int{}
copy(vide, src)              // copie 0 élément — piège silencieux !`,
          note: {
            fr: `copy ne fait pas grandir la destination : si dst est trop court (ou vide), la copie est partielle sans erreur. D'où l'idiome make(len(src)) juste avant.`,
            en: `copy never grows the destination: if dst is too short (or empty), the copy is silently partial. Hence the make(len(src)) idiom right before.`,
          },
        },
        {
          id: 'go-map-comma-ok',
          title: { fr: 'Maps & idiome comma-ok', en: 'Maps & comma-ok idiom' },
          code: `ages := map[string]int{"Ada": 36}
ages["Lin"] = 28             // insertion / mise à jour
v := ages["Bob"]             // 0 — zero value si absent !
v, ok := ages["Bob"]         // ok == false : absent
if _, ok := ages["Ada"]; ok {
    fmt.Println("présente")
}`,
          note: {
            fr: `Lire une clé absente renvoie la zero value, pas une erreur : impossible de distinguer "absent" de "valeur zéro" sans le second retour ok. Toujours utiliser comma-ok quand l'absence compte.`,
            en: `Reading a missing key returns the zero value, not an error: you cannot tell "missing" from "zero value" without the second ok return. Always use comma-ok when absence matters.`,
          },
        },
        {
          id: 'go-map-delete-order',
          title: { fr: 'delete & ordre aléatoire', en: 'delete & random order' },
          code: `delete(ages, "Bob")      // pas d'erreur si la clé n'existe pas
for k, v := range ages { // ordre ALÉATOIRE volontairement
    fmt.Println(k, v)
}
// ordre stable : trier les clés d'abord
keys := slices.Sorted(maps.Keys(ages)) // Go 1.23+`,
          note: {
            fr: `L'ordre d'itération d'une map est volontairement randomisé par le runtime pour empêcher d'en dépendre. Pour une sortie déterministe (tests, affichage), trier les clés avant de parcourir.`,
            en: `Map iteration order is deliberately randomized by the runtime to prevent relying on it. For deterministic output (tests, display), sort the keys before iterating.`,
          },
        },
        {
          id: 'go-range-variable',
          title: { fr: 'La variable de range (piège réparé en 1.22)', en: 'The range variable (gotcha fixed in 1.22)' },
          code: `for _, v := range items {
    go func() { fmt.Println(v) }() // Go 1.22+ : v est NEUVE à chaque tour
}
// Avant 1.22 : toutes les goroutines voyaient la DERNIÈRE valeur
// (une seule variable v partagée). L'ancien correctif : v := v
for i := range s { s[i] *= 2 } // modifier : passer par l'index, v est une COPIE`,
          note: {
            fr: `Depuis Go 1.22, chaque itération a sa propre variable de boucle : le bug historique des closures est corrigé. Reste vrai : v est une copie, modifier v ne modifie jamais le slice — utiliser s[i].`,
            en: `Since Go 1.22, each iteration gets its own loop variable: the historical closure bug is fixed. Still true: v is a copy, mutating v never mutates the slice — use s[i].`,
          },
        },
      ],
    },
    {
      id: 'structs-interfaces',
      title: { fr: 'Structs, méthodes & interfaces', en: 'Structs, methods & interfaces' },
      items: [
        {
          id: 'go-struct-literal',
          title: { fr: 'Structs & littéraux', en: 'Structs & literals' },
          code: `type User struct {
    Name string \`json:"name"\` // tag pour encoding/json
    Age  int    \`json:"age"\`
}
u := User{Name: "Ada", Age: 36} // champs nommés (idiomatique)
p := &User{Name: "Lin"}         // pointeur, Age vaut 0
fmt.Println(p.Name)             // déréférencement automatique`,
          note: {
            fr: `Toujours nommer les champs dans les littéraux : User{"Ada", 36} casse si on réordonne la struct. Majuscule = exporté (visible hors du package), minuscule = privé.`,
            en: `Always name fields in literals: User{"Ada", 36} breaks if the struct is reordered. Uppercase = exported (visible outside the package), lowercase = private.`,
          },
        },
        {
          id: 'go-receivers',
          title: { fr: 'Receivers valeur vs pointeur', en: 'Value vs pointer receivers' },
          code: `func (u User) Hello() string {   // valeur : reçoit une COPIE
    return "Bonjour " + u.Name
}
func (u *User) Birthday() {       // pointeur : peut MODIFIER
    u.Age++
}
u := User{Name: "Ada", Age: 36}
u.Birthday() // Go prend &u automatiquement
fmt.Println(u.Age) // 37`,
          note: {
            fr: `Receiver pointeur pour muter ou éviter de copier une grosse struct ; receiver valeur pour les petits types immuables. Règle d'or : ne pas mélanger les deux sur un même type.`,
            en: `Pointer receiver to mutate or avoid copying a large struct; value receiver for small immutable types. Golden rule: do not mix both on the same type.`,
          },
        },
        {
          id: 'go-implicit-interfaces',
          title: { fr: 'Interfaces implicites', en: 'Implicit interfaces' },
          code: `type Notifier interface {
    Notify(msg string) error
}
type EmailSender struct{ addr string }
func (e EmailSender) Notify(msg string) error { // satisfait Notifier
    return nil                                  // sans le déclarer !
}
var n Notifier = EmailSender{addr: "a@b.c"}
var _ Notifier = (*EmailSender)(nil) // vérif à la compilation`,
          note: {
            fr: `Pas de mot-clé implements : un type satisfait une interface dès qu'il a les bonnes méthodes. Idiome Go : définir les interfaces côté consommateur, petites (1-2 méthodes), et accepter des interfaces / retourner des structs.`,
            en: `No implements keyword: a type satisfies an interface as soon as it has the right methods. Go idiom: define interfaces on the consumer side, keep them small (1-2 methods), accept interfaces / return structs.`,
          },
        },
        {
          id: 'go-embedding',
          title: { fr: 'Embedding (composition)', en: 'Embedding (composition)' },
          code: `type Logger struct{ prefix string }
func (l Logger) Log(msg string) { fmt.Println(l.prefix, msg) }

type Server struct {
    Logger        // embarqué : pas d'héritage, de la composition
    port   int
}
s := Server{Logger: Logger{prefix: "[srv]"}, port: 8080}
s.Log("démarré") // méthode promue : s.Log == s.Logger.Log`,
          note: {
            fr: `Go n'a pas d'héritage : l'embedding promeut champs et méthodes du type embarqué, c'est tout. Pas de polymorphisme de sous-type — pour ça, on passe par les interfaces.`,
            en: `Go has no inheritance: embedding promotes fields and methods of the embedded type, nothing more. No subtype polymorphism — use interfaces for that.`,
          },
        },
        {
          id: 'go-stringer',
          title: { fr: 'fmt.Stringer & io.Reader', en: 'fmt.Stringer & io.Reader' },
          code: `func (u User) String() string {      // satisfait fmt.Stringer
    return fmt.Sprintf("%s (%d ans)", u.Name, u.Age)
}
fmt.Println(u)  // "Ada (36 ans)" — fmt l'utilise automatiquement

var r io.Reader = strings.NewReader("données")
data, _ := io.ReadAll(r) // tout ce qui "lit" est un io.Reader`,
          note: {
            fr: `Stringer et io.Reader/Writer sont les interfaces les plus puissantes de la stdlib : fichiers, réseau, buffers, compression... tout s'interconnecte via Reader/Writer. Implémenter String() rend les logs lisibles gratuitement.`,
            en: `Stringer and io.Reader/Writer are the most powerful stdlib interfaces: files, network, buffers, compression... everything composes via Reader/Writer. Implementing String() makes logs readable for free.`,
          },
        },
        {
          id: 'go-type-assertion',
          title: { fr: 'Type assertion & type switch', en: 'Type assertion & type switch' },
          code: `var v any = "bonjour"          // any == interface{}
s, ok := v.(string)            // assertion sûre : ok == true
n, ok := v.(int)               // ok == false, n == 0 (pas de panic)
switch x := v.(type) {         // type switch
case string:
    fmt.Println("texte :", x)
case int, float64:
    fmt.Println("nombre :", x)
}`,
          note: {
            fr: `v.(string) sans le second retour panique si le type ne correspond pas : préférer la forme comma-ok ou le type switch. Si on fait beaucoup d'assertions, c'est souvent le signe qu'une interface ou des generics seraient mieux.`,
            en: `v.(string) without the second return panics on type mismatch: prefer the comma-ok form or a type switch. Doing many assertions is often a sign an interface or generics would fit better.`,
          },
        },
        {
          id: 'go-interface-internals',
          title: { fr: "Anatomie d'une interface : (type, valeur)", en: 'Interface anatomy: (type, value)' },
          code: `var w io.Writer          // paire (type=nil, valeur=nil) : w == nil -> true
var b *bytes.Buffer      // b == nil -> true (pointeur nil)
w = b                    // paire (type=*bytes.Buffer, valeur=nil)
fmt.Println(w == nil)    // false ! le TYPE n'est plus nil`,
          note: {
            fr: `En interne, une valeur d'interface est une paire (type concret, valeur). w == nil ne vaut true que si les DEUX champs sont nil : dès qu'un pointeur typé (même nil) y est stocké, le champ type se remplit et l'interface n'est plus nil.`,
            en: `Internally, an interface value is a (concrete type, value) pair. w == nil is only true when BOTH fields are nil: as soon as a typed pointer (even nil) is stored in it, the type field gets set and the interface stops being nil.`,
          },
        },
      ],
    },
    {
      id: 'errors',
      title: { fr: 'Gestion des erreurs', en: 'Error handling' },
      items: [
        {
          id: 'go-error-check',
          title: { fr: 'if err != nil — le rituel', en: 'if err != nil — the ritual' },
          code: `f, err := os.Open("config.json")
if err != nil {
    return fmt.Errorf("ouverture config: %w", err) // remonter avec contexte
}
defer f.Close() // fermeture garantie à la sortie de la fonction`,
          note: {
            fr: `Les erreurs sont des valeurs : on les traite immédiatement après chaque appel, pas de try/catch. Toujours ajouter du contexte en remontant — "open config" est plus utile que "no such file" tout nu.`,
            en: `Errors are values: handle them right after each call, no try/catch. Always add context when propagating — "open config" beats a bare "no such file".`,
          },
        },
        {
          id: 'go-errorf-wrap',
          title: { fr: 'Wrapper avec fmt.Errorf %w', en: 'Wrapping with fmt.Errorf %w' },
          code: `err := fmt.Errorf("traitement user %d: %w", id, errDB)
// %w EMBALLE l'erreur : la chaîne reste inspectable
fmt.Println(errors.Unwrap(err) == errDB) // true
// %v ne ferait que formater le texte : la cause serait perdue`,
          note: {
            fr: `%w préserve l'erreur d'origine dans une chaîne que errors.Is/As peuvent parcourir ; %v aplatit en simple texte. Wrapper avec %w crée un couplage : n'exposer la cause que si l'appelant doit pouvoir la tester.`,
            en: `%w preserves the original error in a chain errors.Is/As can walk; %v flattens to plain text. Wrapping with %w creates coupling: only expose the cause if callers need to test for it.`,
          },
        },
        {
          id: 'go-errors-is-as',
          title: { fr: 'errors.Is & errors.As', en: 'errors.Is & errors.As' },
          code: `if errors.Is(err, os.ErrNotExist) {  // compare aux SENTINELLES
    // remonte toute la chaîne de wrap
}
var pathErr *fs.PathError
if errors.As(err, &pathErr) {        // extrait un TYPE concret
    fmt.Println("chemin fautif :", pathErr.Path)
}
// err == os.ErrNotExist : FAUX si l'erreur est wrappée !`,
          note: {
            fr: `Is compare à une valeur sentinelle, As extrait un type — tous deux parcourent la chaîne de wrapping. Ne jamais comparer avec == ni parser err.Error() : ça casse dès que quelqu'un wrap l'erreur.`,
            en: `Is compares against a sentinel value, As extracts a type — both walk the wrap chain. Never compare with == or parse err.Error(): it breaks as soon as someone wraps the error.`,
          },
        },
        {
          id: 'go-sentinel-errors',
          title: { fr: 'Erreurs sentinelles & types', en: 'Sentinel errors & error types' },
          code: `var ErrNotFound = errors.New("introuvable") // sentinelle exportée

type ValidationError struct{ Field string }
func (e *ValidationError) Error() string {
    return "champ invalide : " + e.Field
}
// usage : return fmt.Errorf("user %d: %w", id, ErrNotFound)
// test  : errors.Is(err, ErrNotFound)`,
          note: {
            fr: `Une sentinelle (var Err... exportée) suffit quand l'appelant veut juste savoir "quoi" ; un type d'erreur custom quand il a besoin de données (champ, code...). Les deux font partie de l'API publique : à ajouter avec parcimonie.`,
            en: `A sentinel (exported var Err...) is enough when callers just need to know "what"; a custom error type when they need data (field, code...). Both are part of your public API: add sparingly.`,
          },
        },
        {
          id: 'go-defer-panic-recover',
          title: { fr: 'defer, panic & recover', en: 'defer, panic & recover' },
          code: `func safeRun(fn func()) (err error) {
    defer func() { // les defer s'exécutent en ordre LIFO
        if r := recover(); r != nil { // ne marche QUE dans un defer
            err = fmt.Errorf("panique récupérée: %v", r)
        }
    }()
    fn() // si fn panique, on transforme en error
    return nil
}`,
          note: {
            fr: `panic est réservé aux bugs irrécupérables (index hors limites, invariant cassé), jamais au contrôle de flux. recover en bordure (handler HTTP, worker) convertit la panique en erreur au lieu de tuer le process.`,
            en: `panic is for unrecoverable bugs (index out of range, broken invariant), never for control flow. recover at boundaries (HTTP handler, worker) converts the panic into an error instead of killing the process.`,
          },
        },
        {
          id: 'go-errors-join',
          title: { fr: 'errors.Join : combiner plusieurs erreurs', en: 'errors.Join: combining multiple errors' },
          code: `errValidation := errors.New("champ requis")
errReseau := errors.New("timeout")
err := errors.Join(errValidation, errReseau) // agrège sans en choisir une
fmt.Println(err) // 2 lignes : "champ requis" puis "timeout"
errors.Is(err, errReseau) // true — Is/As parcourent aussi les erreurs jointes`,
          note: {
            fr: `errors.Join (Go 1.20+) fusionne plusieurs erreurs indépendantes en une seule, sans perdre l'identité de chacune : errors.Is/As continuent de fonctionner sur chaque erreur jointe. Utile pour rapporter plusieurs échecs de validation d'un coup.`,
            en: `errors.Join (Go 1.20+) merges several independent errors into one without losing each one's identity: errors.Is/As still work against each joined error. Handy for reporting several validation failures at once.`,
          },
        },
      ],
    },
    {
      id: 'concurrency',
      title: { fr: 'Goroutines & channels', en: 'Goroutines & channels' },
      items: [
        {
          id: 'go-goroutine-waitgroup',
          title: { fr: 'go + sync.WaitGroup', en: 'go + sync.WaitGroup' },
          code: `var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)                  // AVANT de lancer la goroutine
    go func() {
        defer wg.Done()        // décrémente même en cas de panique
        fetch(url)             // url : ok depuis Go 1.22
    }()
}
wg.Wait() // bloque jusqu'à ce que tout soit fini`,
          note: {
            fr: `main ne attend PAS les goroutines : sans Wait, le programme peut se terminer avant elles. Add doit être appelé avant go, jamais dans la goroutine (course entre Add et Wait). Go 1.25 ajoute wg.Go(fn) qui fait Add+Done.`,
            en: `main does NOT wait for goroutines: without Wait, the program may exit before they run. Call Add before go, never inside the goroutine (race between Add and Wait). Go 1.25 adds wg.Go(fn) which does Add+Done.`,
          },
        },
        {
          id: 'go-channels-basics',
          title: { fr: 'Channels : envoyer, recevoir, fermer', en: 'Channels: send, receive, close' },
          code: `ch := make(chan int)        // non bufferisé : envoi BLOQUE
go func() {
    for i := range 3 { ch <- i }
    close(ch)               // seul l'ÉMETTEUR ferme
}()
for v := range ch {         // range s'arrête à la fermeture
    fmt.Println(v)
}
v, ok := <-ch               // ok == false : channel fermé`,
          note: {
            fr: `Sur un channel non bufferisé, l'envoi bloque jusqu'à ce qu'un récepteur soit prêt : c'est une synchronisation, pas une file. Envoyer sur un channel fermé panique ; recevoir renvoie la zero value avec ok == false.`,
            en: `On an unbuffered channel, a send blocks until a receiver is ready: it is synchronization, not a queue. Sending on a closed channel panics; receiving returns the zero value with ok == false.`,
          },
        },
        {
          id: 'go-buffered-channels',
          title: { fr: 'Channels bufferisés', en: 'Buffered channels' },
          code: `jobs := make(chan int, 8)  // buffer de 8 : envoi non bloquant
sem := make(chan struct{}, 4) // sémaphore : max 4 en parallèle
for _, t := range tasks {
    sem <- struct{}{}      // prend un jeton (bloque si plein)
    go func() {
        defer func() { <-sem }() // rend le jeton
        run(t)
    }()
}`,
          note: {
            fr: `Le buffer absorbe les pics : l'envoi ne bloque que quand il est plein. L'idiome chan struct{} (0 octet) sert de sémaphore pour limiter la concurrence. Un buffer ne corrige jamais un deadlock, il le retarde.`,
            en: `The buffer absorbs bursts: sends only block when it is full. The chan struct{} idiom (0 bytes) works as a semaphore to cap concurrency. A buffer never fixes a deadlock, it only delays it.`,
          },
        },
        {
          id: 'go-select',
          title: { fr: 'select : multiplexer des channels', en: 'select: multiplexing channels' },
          code: `select {
case msg := <-ch1:
    fmt.Println("reçu :", msg)
case ch2 <- valeur:            // un envoi aussi
    fmt.Println("envoyé")
case <-time.After(2 * time.Second):
    fmt.Println("timeout")     // garde-fou classique
default:
    fmt.Println("rien de prêt") // rend le select non bloquant
}`,
          note: {
            fr: `select attend le premier case prêt ; si plusieurs le sont, il en choisit un au hasard (équité). default le rend non bloquant — à éviter dans une boucle serrée, ça consomme 100% d'un CPU.`,
            en: `select waits for the first ready case; if several are ready, it picks one at random (fairness). default makes it non-blocking — avoid it in a tight loop, it burns 100% of a CPU.`,
          },
        },
        {
          id: 'go-mutex',
          title: { fr: 'sync.Mutex & données partagées', en: 'sync.Mutex & shared data' },
          code: `type Compteur struct {
    mu sync.Mutex // protège n (le déclarer juste au-dessus)
    n  int
}
func (c *Compteur) Incr() {
    c.mu.Lock()
    defer c.mu.Unlock() // jamais oublié, même si panique
    c.n++
}
// Détecter les courses : go test -race`,
          note: {
            fr: `n++ depuis plusieurs goroutines sans mutex est une data race : résultat indéfini. Le mantra Go : "partager la mémoire en communiquant" (channels), mais pour un simple compteur/cache, un mutex est plus simple. Toujours tester avec -race.`,
            en: `n++ from multiple goroutines without a mutex is a data race: undefined behavior. The Go mantra: "share memory by communicating" (channels), but for a simple counter/cache a mutex is simpler. Always test with -race.`,
          },
        },
        {
          id: 'go-context',
          title: { fr: 'context : annulation & timeout', en: 'context: cancellation & timeout' },
          code: `ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
defer cancel() // TOUJOURS, sinon fuite de ressources

req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
resp, err := http.DefaultClient.Do(req) // s'annule au timeout

select {
case <-ctx.Done():
    return ctx.Err() // context.DeadlineExceeded ou Canceled
case res := <-work:
    return res
}`,
          note: {
            fr: `Le context se propage en premier paramètre (ctx context.Context) à travers toute la pile d'appels : annuler en haut stoppe tout en bas. Ne jamais le stocker dans une struct, et toujours defer cancel().`,
            en: `Context flows as the first parameter (ctx context.Context) through the whole call stack: cancelling at the top stops everything below. Never store it in a struct, and always defer cancel().`,
          },
        },
        {
          id: 'go-goroutine-leak',
          title: { fr: 'Le piège de la goroutine qui fuit', en: 'The leaking goroutine gotcha' },
          code: `// FUITE : si personne ne lit ch, la goroutine bloque POUR TOUJOURS
go func() { ch <- calculLong() }()
if err := autreTruc(); err != nil {
    return err // ch jamais lu => goroutine zombie + mémoire retenue
}
// Correctifs : buffer de 1 (l'envoi n'attend pas)...
ch := make(chan int, 1)
// ...ou select { case ch <- v: case <-ctx.Done(): return }`,
          note: {
            fr: `Une goroutine bloquée sur un channel n'est jamais collectée par le GC : sur un serveur, ces fuites s'accumulent à chaque requête. Règle : toute goroutine doit avoir une sortie garantie (buffer, context, close).`,
            en: `A goroutine blocked on a channel is never garbage-collected: on a server these leaks pile up on every request. Rule: every goroutine must have a guaranteed exit (buffer, context, close).`,
          },
        },
      ],
    },
    {
      id: 'tooling',
      title: { fr: 'Outillage & tests', en: 'Tooling & tests' },
      items: [
        {
          id: 'go-modules',
          title: { fr: 'go mod : dépendances', en: 'go mod: dependencies' },
          code: `go mod init github.com/moi/projet  # crée go.mod
go get github.com/go-chi/chi/v5    # ajoute une dépendance
go get -u ./...                    # met tout à jour
go mod tidy                        # ajoute le manquant, retire l'inutile
go run . && go build -o app .      # exécuter / compiler`,
          note: {
            fr: `go.mod + go.sum versionnent les dépendances de façon reproductible ; les deux se commitent. go mod tidy avant chaque commit garde le module propre — la CI échoue souvent s'il n'a pas été lancé.`,
            en: `go.mod + go.sum pin dependencies reproducibly; commit both. Run go mod tidy before every commit to keep the module clean — CI often fails when it was skipped.`,
          },
        },
        {
          id: 'go-table-tests',
          title: { fr: 'Tests table-driven', en: 'Table-driven tests' },
          code: `func TestDiviser(t *testing.T) {
    cas := []struct {
        nom      string
        a, b, ok int
    }{
        {"simple", 10, 2, 5},
        {"négatif", -9, 3, -3},
    }
    for _, c := range cas {
        t.Run(c.nom, func(t *testing.T) { // sous-test nommé
            if got, _ := diviser(c.a, c.b); got != c.ok {
                t.Errorf("diviser(%d,%d) = %d, attendu %d", c.a, c.b, got, c.ok)
            }
        })
    }
}`,
          note: {
            fr: `LE pattern de test Go : une table de cas + t.Run pour des sous-tests nommés, exécutables individuellement avec go test -run TestDiviser/négatif. Ajouter un cas = ajouter une ligne.`,
            en: `THE Go testing pattern: a table of cases + t.Run for named subtests, runnable individually with go test -run TestDiviser/negative. Adding a case = adding one line.`,
          },
        },
        {
          id: 'go-test-flags',
          title: { fr: 'go test : les flags utiles', en: 'go test: the useful flags' },
          code: `go test ./...                # tous les packages
go test -run TestDiviser -v  # un seul test, verbeux
go test -race ./...          # détecteur de data races
go test -cover ./...         # couverture
go test -bench . -benchmem   # benchmarks + allocations`,
          note: {
            fr: `-race en CI est non négociable dès qu'il y a des goroutines : il détecte les courses réelles à l'exécution. Les fichiers _test.go ne sont jamais inclus dans le binaire final.`,
            en: `-race in CI is non-negotiable once goroutines exist: it detects real races at runtime. _test.go files are never included in the final binary.`,
          },
        },
        {
          id: 'go-fmt-vet',
          title: { fr: 'gofmt, go vet & staticcheck', en: 'gofmt, go vet & staticcheck' },
          code: `gofmt -w .       # formate (AUCUNE option de style : zéro débat)
go vet ./...     # bugs probables : Printf faux, copies de mutex...
# Linters tiers incontournables :
# staticcheck ./...        (analyse approfondie)
# golangci-lint run        (agrégateur standard en CI)`,
          note: {
            fr: `gofmt est volontairement sans configuration : tout le code Go du monde a le même style, fin des débats de formatage. go vet attrape des vrais bugs que le compilateur laisse passer — l'activer en CI coûte zéro.`,
            en: `gofmt is deliberately non-configurable: all Go code in the world shares one style, ending formatting debates. go vet catches real bugs the compiler allows — enabling it in CI costs nothing.`,
          },
        },
        {
          id: 'go-generics',
          title: { fr: 'Generics (1.18+)', en: 'Generics (1.18+)' },
          code: `func Map[T, U any](s []T, f func(T) U) []U {
    out := make([]U, 0, len(s))
    for _, v := range s { out = append(out, f(v)) }
    return out
}
doubles := Map([]int{1, 2}, func(n int) int { return n * 2 })

func Max[T cmp.Ordered](a, b T) T { // contrainte : types ordonnables
    if a > b { return a }
    return b
}`,
          note: {
            fr: `Les contraintes ([T any], [T cmp.Ordered]) bornent les types acceptés ; l'inférence évite presque toujours d'écrire Map[int, int](...). Voir aussi les packages slices et maps de la stdlib, déjà génériques.`,
            en: `Constraints ([T any], [T cmp.Ordered]) bound the accepted types; inference almost always avoids writing Map[int, int](...). See also the stdlib slices and maps packages, already generic.`,
          },
        },
        {
          id: 'go-build-tags',
          title: { fr: 'Build tags & cross-compilation', en: 'Build tags & cross-compilation' },
          code: `//go:build linux && !cgo
// (en tête de fichier : compilé seulement sous Linux sans cgo)

# Cross-compilation : un binaire statique pour une autre cible
GOOS=linux GOARCH=arm64 go build -o app .
go env GOOS GOARCH   # voir la cible courante`,
          note: {
            fr: `Le suffixe de fichier marche aussi : main_windows.go n'est compilé que sous Windows. La cross-compilation est triviale en Go (pas de toolchain à installer) tant qu'on n'utilise pas cgo — d'où sa popularité pour les CLI.`,
            en: `File suffixes work too: main_windows.go only compiles on Windows. Cross-compilation is trivial in Go (no toolchain to install) as long as you avoid cgo — hence its popularity for CLIs.`,
          },
        },
      ],
    },
    {
      id: 'go-stdlib',
      title: { fr: 'Bibliothèque standard', en: 'Standard library' },
      items: [
        {
          id: 'go-json-encoding',
          title: { fr: 'encoding/json : Marshal & Unmarshal', en: 'encoding/json: Marshal & Unmarshal' },
          code: `type User struct {
    Name string \`json:"name"\`
    Age  int    \`json:"age,omitempty"\`
}
data, err := json.Marshal(User{Name: "Ada", Age: 36}) // -> []byte
var u User
err = json.Unmarshal(data, &u)   // &u : Unmarshal écrit dans le pointeur`,
          note: {
            fr: `Marshal sérialise une struct en JSON en respectant les tags struct (json:"nom", omitempty pour omettre un champ vide) ; Unmarshal fait l'inverse et exige un POINTEUR pour écrire le résultat. Seuls les champs exportés (majuscule) sont (dé)sérialisés.`,
            en: `Marshal serializes a struct to JSON following its struct tags (json:"name", omitempty to skip an empty field); Unmarshal does the reverse and requires a POINTER to write the result into. Only exported (capitalized) fields are (de)serialized.`,
          },
        },
        {
          id: 'go-http-handler',
          title: { fr: 'net/http : handler & ListenAndServe', en: 'net/http: handler & ListenAndServe' },
          code: `func hello(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Bonjour %s", r.URL.Query().Get("nom"))
}
func main() {
    http.HandleFunc("/hello", hello)
    log.Fatal(http.ListenAndServe(":8080", nil)) // bloque jusqu'à erreur
}`,
          note: {
            fr: `Un handler est juste func(http.ResponseWriter, *http.Request) ; HandleFunc l'enregistre sur une route via le mux par défaut. Toute fonction avec cette signature satisfait déjà l'interface http.Handler — pas besoin de framework pour un serveur minimal.`,
            en: `A handler is just func(http.ResponseWriter, *http.Request); HandleFunc registers it on a route via the default mux. Any function with that signature already satisfies the http.Handler interface — no framework needed for a minimal server.`,
          },
        },
        {
          id: 'go-embedded-interfaces',
          title: { fr: 'Interfaces embarquées : io.ReadWriter', en: 'Embedded interfaces: io.ReadWriter' },
          code: `type ReadWriter interface {
    Reader   // embarque io.Reader : Read(p []byte) (int, error)
    Writer   // embarque io.Writer : Write(p []byte) (int, error)
}
var rw io.ReadWriter = someBuffer // satisfait les DEUX méthodes`,
          note: {
            fr: `Une interface peut en embarquer d'autres : io.ReadWriter n'ajoute aucune méthode, elle exige simplement les méthodes de Reader ET Writer réunies. C'est la composition d'interfaces, l'équivalent de l'embedding de struct côté contrat.`,
            en: `An interface can embed others: io.ReadWriter adds no method of its own, it simply requires both Reader's and Writer's methods together. This is interface composition — the contract-side equivalent of struct embedding.`,
          },
        },
      ],
    },
    {
      id: 'go-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'go-bp-small-interfaces',
          title: { fr: 'Petites interfaces, côté consommateur', en: 'Small consumer-side interfaces' },
          code: `type Reader interface {
    Read(p []byte) (n int, err error) // une seule méthode
}`,
          note: {
            fr: `Plus une interface a de méthodes, plus elle est difficile à implémenter et à mocker : le style Go privilégie 1-2 méthodes, déclarées là où elles sont consommées.`,
            en: `The more methods an interface has, the harder it is to implement and mock: Go style favors 1-2 methods, declared where they are consumed.`,
          },
        },
        {
          id: 'go-bp-wrap-errors-context',
          title: { fr: 'Toujours contextualiser une erreur', en: 'Always add context to an error' },
          code: `if err != nil {
    return fmt.Errorf("lecture config %q: %w", path, err)
}`,
          note: {
            fr: `Une erreur brute remontée sans contexte oblige à deviner où ça a cassé dans une pile d'appels profonde ; %w garde la cause exploitable par errors.Is/As.`,
            en: `A bare error propagated with no context forces guessing where it broke deep in a call stack; %w keeps the cause usable by errors.Is/As.`,
          },
        },
        {
          id: 'go-bp-typed-nil-gotcha',
          title: { fr: 'Le nil typé dans une interface error', en: 'Typed nil inside an error interface' },
          code: `func check() error {
    var e *MonErreur = nil
    return e            // interface NON nil, piège !
}
if err := check(); err != nil { // toujours vrai
    fmt.Println("erreur alors qu'il n'y en a pas")
}`,
          note: {
            fr: `Une interface error contenant un pointeur nil typé n'est PAS égale à nil : elle porte un type. Retournez explicitement nil, pas une variable pointeur potentiellement nil.`,
            en: `An error interface holding a typed nil pointer is NOT equal to nil: it still carries a type. Return an explicit nil, not a possibly-nil pointer variable.`,
          },
        },
        {
          id: 'go-bp-defer-close-check',
          title: { fr: "Vérifier l'erreur de Close quand elle compte", en: 'Check the Close error when it matters' },
          code: `f, err := os.Create("out.txt")
if err != nil { return err }
defer func() {
    if cerr := f.Close(); cerr != nil && err == nil {
        err = cerr
    }
}()`,
          note: {
            fr: `defer f.Close() seul avale silencieusement une erreur d'écriture différée (buffer non flushé, disque plein) : capturez-la quand c'est critique.`,
            en: `A bare defer f.Close() silently swallows a deferred write error (unflushed buffer, full disk): capture it when it matters.`,
          },
        },
        {
          id: 'go-bp-goroutine-lifecycle',
          title: { fr: 'Toute goroutine a un propriétaire et une sortie', en: 'Every goroutine has an owner and an exit' },
          code: `ctx, cancel := context.WithCancel(context.Background())
go worker(ctx)     // sait s'arrêter via ctx.Done()
defer cancel()     // le propriétaire décide de la fin`,
          note: {
            fr: `Une goroutine lancée sans mécanisme d'arrêt (context, channel, WaitGroup) devient impossible à stopper proprement et fuit à chaque appel.`,
            en: `A goroutine started with no stop mechanism (context, channel, WaitGroup) becomes impossible to stop cleanly and leaks on every call.`,
          },
        },
      ],
    },
  ],
};
