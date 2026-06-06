/**
 * Cheatsheet Ruby — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'ruby',
  lang: 'ruby',
  sections: [
    {
      id: 'basics',
      title: { fr: 'Bases & idiomes', en: 'Basics & idioms' },
      items: [
        {
          id: 'ruby-everything-object',
          title: { fr: 'Tout est objet', en: 'Everything is an object' },
          code: `puts 5.even?          # true — méthode sur un entier
puts "abc".class      # String
puts nil.to_a.inspect # [] — même nil est un objet
puts 3.times.to_a.inspect # [0, 1, 2]`,
          note: {
            fr: `Pas de primitives : entiers, nil et booléens reçoivent des méthodes. On enchaîne donc naturellement les appels sur les littéraux.`,
            en: `No primitives: integers, nil and booleans receive methods. Chaining calls directly on literals is therefore natural.`,
          },
        },
        {
          id: 'ruby-symbols',
          title: { fr: 'Symbols vs strings', en: 'Symbols vs strings' },
          code: `:nom.object_id == :nom.object_id   # true — même objet
"nom".object_id == "nom".object_id # false — deux objets
h = { nom: "Ada", age: 36 }        # clés symboles (raccourci)
puts h[:nom]`,
          note: {
            fr: `Un symbole est immuable et unique en mémoire : idéal comme clé de hash ou identifiant. Une string sert pour du texte manipulable.`,
            en: `A symbol is immutable and unique in memory: ideal as a hash key or identifier. Use a string for text you manipulate.`,
          },
        },
        {
          id: 'ruby-truthy',
          title: { fr: 'Seuls nil et false sont falsy', en: 'Only nil and false are falsy' },
          code: `puts "oui" if 0    # affiche ! 0 est truthy
puts "oui" if ""   # affiche ! "" est truthy
puts "non" if nil  # rien`,
          note: {
            fr: `Contrairement à JS : 0, "" et [] sont tous truthy en Ruby.`,
            en: `Unlike JS: 0, "" and [] are all truthy in Ruby.`,
          },
        },
        {
          id: 'ruby-safe-navigation',
          title: { fr: 'Navigation sûre avec &.', en: 'Safe navigation with &.' },
          code: `user = nil
puts user&.name        # nil — pas d'exception
puts user&.name&.upcase # on peut chaîner
# user.name => NoMethodError sur nil`,
          note: {
            fr: `&. renvoie nil si le récepteur est nil au lieu de lever NoMethodError. À ne pas multiplier : trop de &. cache souvent un problème de design.`,
            en: `&. returns nil when the receiver is nil instead of raising NoMethodError. Don't overuse it: many &. in a row often hide a design problem.`,
          },
        },
        {
          id: 'ruby-oreq-memoization',
          title: { fr: 'Mémoïsation avec ||=', en: 'Memoization with ||=' },
          code: `def config
  @config ||= charger_config_lente  # calculé une seule fois
end

compteur = nil
compteur ||= 0   # assigne car nil`,
          note: {
            fr: `a ||= b assigne b seulement si a est nil ou false. Piège : si la valeur calculée peut être false ou nil, le calcul sera refait à chaque appel.`,
            en: `a ||= b assigns b only if a is nil or false. Gotcha: if the computed value can be false or nil, it will be recomputed on every call.`,
          },
        },
        {
          id: 'ruby-interpolation',
          title: { fr: 'Interpolation avec #{}', en: 'Interpolation with #{}' },
          code: `nom = "Ada"
puts "Bonjour #{nom} !"          # interpolation
puts "2 + 2 = #{2 + 2}"          # toute expression
puts 'Pas ici : #{nom}'          # guillemets simples = littéral`,
          note: {
            fr: `L'interpolation #{} ne fonctionne qu'entre guillemets doubles (ou heredocs). Elle appelle to_s sur le résultat automatiquement.`,
            en: `#{} interpolation only works inside double quotes (or heredocs). It calls to_s on the result automatically.`,
          },
        },
      ],
    },
    {
      id: 'collections',
      title: { fr: 'Collections & Enumerable', en: 'Collections & Enumerable' },
      items: [
        {
          id: 'ruby-each-map-select',
          title: { fr: 'each / map / select / reject', en: 'each / map / select / reject' },
          code: `nums = [1, 2, 3, 4]
nums.each { |n| puts n }          # itère, renvoie nums
doubles = nums.map { |n| n * 2 }  # [2, 4, 6, 8]
pairs = nums.select(&:even?)      # [2, 4]
impairs = nums.reject(&:even?)    # [1, 3]`,
          note: {
            fr: `each itère pour les effets de bord, map transforme, select garde, reject élimine. Préférez map/select à each + push : plus déclaratif.`,
            en: `each iterates for side effects, map transforms, select keeps, reject drops. Prefer map/select over each + push: more declarative.`,
          },
        },
        {
          id: 'ruby-reduce-sum',
          title: { fr: 'reduce et sum', en: 'reduce and sum' },
          code: `[1, 2, 3].sum                       # 6
[1, 2, 3].reduce(:+)                # 6 — symbole d'opérateur
[1, 2, 3].reduce(10) { |acc, n| acc + n } # 16 avec valeur initiale
["a", "b"].reduce("") { |s, x| s + x }    # "ab"`,
          note: {
            fr: `reduce (alias inject) replie la collection sur un accumulateur. Pour une somme simple, sum est plus lisible et plus rapide.`,
            en: `reduce (alias inject) folds the collection into an accumulator. For a simple sum, sum is more readable and faster.`,
          },
        },
        {
          id: 'ruby-dig',
          title: { fr: 'dig pour les structures imbriquées', en: 'dig for nested structures' },
          code: `data = { user: { adresse: { ville: "Lyon" } } }
data.dig(:user, :adresse, :ville)  # "Lyon"
data.dig(:user, :tel, :fixe)       # nil — pas d'exception
[[1, [2, 3]]].dig(0, 1, 0)         # 2 — marche aussi sur Array`,
          note: {
            fr: `dig traverse hash et arrays imbriqués et renvoie nil dès qu'un niveau manque, là où un chaînage de [] lèverait NoMethodError sur nil.`,
            en: `dig traverses nested hashes and arrays, returning nil as soon as a level is missing, where chained [] would raise NoMethodError on nil.`,
          },
        },
        {
          id: 'ruby-ranges',
          title: { fr: 'Ranges : .. vs ...', en: 'Ranges: .. vs ...' },
          code: `(1..5).to_a    # [1, 2, 3, 4, 5] — borne incluse
(1...5).to_a   # [1, 2, 3, 4]    — borne exclue
("a".."d").to_a # ["a", "b", "c", "d"]
(1..).first(3)  # [1, 2, 3] — range sans fin`,
          note: {
            fr: `Deux points incluent la fin, trois points l'excluent. Les ranges sans fin (1..) ou sans début (..5) sont pratiques pour le slicing et case/when.`,
            en: `Two dots include the end, three dots exclude it. Endless (1..) and beginless (..5) ranges are handy for slicing and case/when.`,
          },
        },
        {
          id: 'ruby-with-index-object',
          title: { fr: 'each_with_index / each_with_object', en: 'each_with_index / each_with_object' },
          code: `["a", "b"].each_with_index { |x, i| puts "#{i}: #{x}" }
["a", "b"].each.with_index(1) { |x, i| puts "#{i}. #{x}" } # départ à 1
# construit un hash sans variable externe
h = [1, 2, 3].each_with_object({}) { |n, acc| acc[n] = n * n }
# => {1=>1, 2=>4, 3=>9}`,
          note: {
            fr: `with_index(n) permet de choisir l'indice de départ. each_with_object passe l'accumulateur en dernier et le renvoie — pas besoin de le retourner dans le bloc.`,
            en: `with_index(n) lets you pick the starting index. each_with_object passes the accumulator last and returns it — no need to return it from the block.`,
          },
        },
        {
          id: 'ruby-group-tally-partition',
          title: { fr: 'group_by / tally / partition', en: 'group_by / tally / partition' },
          code: `mots = ["pomme", "poire", "kiwi"]
mots.group_by(&:size)   # {5=>["pomme", "poire"], 4=>["kiwi"]}
["a", "b", "a"].tally   # {"a"=>2, "b"=>1} — comptage
pairs, impairs = [1, 2, 3, 4].partition(&:even?)
# pairs = [2, 4], impairs = [1, 3]`,
          note: {
            fr: `tally compte les occurrences en une ligne, group_by indexe par le résultat du bloc, partition coupe en deux tableaux selon un prédicat.`,
            en: `tally counts occurrences in one line, group_by indexes by the block result, partition splits into two arrays based on a predicate.`,
          },
        },
      ],
    },
    {
      id: 'blocks',
      title: { fr: 'Blocks, procs & lambdas', en: 'Blocks, procs & lambdas' },
      items: [
        {
          id: 'ruby-yield',
          title: { fr: 'yield et block_given?', en: 'yield and block_given?' },
          code: `def mesure
  debut = Time.now
  resultat = yield if block_given?  # exécute le bloc passé
  puts "Durée : #{Time.now - debut}s"
  resultat
end

mesure { sleep(0.1); 42 }  # => 42`,
          note: {
            fr: `Toute méthode peut recevoir un bloc implicite : yield l'exécute, block_given? vérifie sa présence. yield sans bloc lève LocalJumpError.`,
            en: `Any method can receive an implicit block: yield runs it, block_given? checks it exists. yield without a block raises LocalJumpError.`,
          },
        },
        {
          id: 'ruby-amp-block',
          title: { fr: 'Capturer le bloc avec &block', en: 'Capturing the block with &block' },
          code: `def deux_fois(&block)   # & convertit le bloc en Proc
  block.call
  block.call
end

def relai(&blk)
  [1, 2].each(&blk)      # & re-convertit le Proc en bloc
end`,
          note: {
            fr: `&block dans la signature réifie le bloc en objet Proc qu'on peut stocker ou repasser. À l'appel, & fait l'inverse : Proc → bloc.`,
            en: `&block in a signature reifies the block into a Proc object you can store or forward. At call sites, & does the reverse: Proc → block.`,
          },
        },
        {
          id: 'ruby-proc-vs-lambda',
          title: { fr: 'proc vs lambda : return et arité', en: 'proc vs lambda: return and arity' },
          code: `l = lambda { |a, b| a + b }   # ou ->(a, b) { a + b }
p = proc { |a, b| [a, b] }
l.call(1, 2)        # 3 — arité stricte : l.call(1) => ArgumentError
p.call(1)           # [1, nil] — arité souple
# return dans une lambda sort de la lambda
# return dans un proc sort de la MÉTHODE englobante`,
          note: {
            fr: `Une lambda se comporte comme une méthode (arité stricte, return local). Un proc est laxiste sur les arguments et son return remonte jusqu'à la méthode englobante — source classique de LocalJumpError.`,
            en: `A lambda behaves like a method (strict arity, local return). A proc is lax about arguments and its return exits the enclosing method — a classic source of LocalJumpError.`,
          },
        },
        {
          id: 'ruby-symbol-to-proc',
          title: { fr: 'Symbol#to_proc : &:upcase', en: 'Symbol#to_proc: &:upcase' },
          code: `["a", "b"].map(&:upcase)      # ["A", "B"]
# équivaut à : .map { |s| s.upcase }
[1, 2, 3].select(&:odd?)      # [1, 3]
["1", "2"].map(&:to_i).sum    # 3`,
          note: {
            fr: `&:methode convertit le symbole en bloc qui appelle cette méthode sur chaque élément. Limité aux appels sans argument sur l'élément lui-même.`,
            en: `&:method converts the symbol into a block that calls that method on each element. Limited to zero-argument calls on the element itself.`,
          },
        },
        {
          id: 'ruby-method-reference',
          title: { fr: 'method(:name) — référence de méthode', en: 'method(:name) — method reference' },
          code: `def crier(mot) = mot.upcase + " !"

m = method(:crier)            # objet Method
m.call("bravo")               # "BRAVO !"
["a", "b"].map(&m)            # ["A !", "B !"] — utilisable comme bloc
puts [1, 2].each(&method(:puts)) # passe puts en bloc`,
          note: {
            fr: `method(:nom) capture une méthode en objet de première classe, passable avec & là où un bloc est attendu. Pratique pour réutiliser des méthodes existantes comme callbacks.`,
            en: `method(:name) captures a method as a first-class object, passable with & wherever a block is expected. Handy for reusing existing methods as callbacks.`,
          },
        },
      ],
    },
    {
      id: 'classes',
      title: { fr: 'Classes & modules', en: 'Classes & modules' },
      items: [
        {
          id: 'ruby-attr-accessor',
          title: { fr: 'attr_accessor / reader / writer', en: 'attr_accessor / reader / writer' },
          code: `class Personne
  attr_reader :nom        # getter seul
  attr_writer :secret     # setter seul
  attr_accessor :age      # getter + setter

  def initialize(nom)
    @nom = nom
  end
end`,
          note: {
            fr: `Ces macros génèrent getters/setters pour les variables d'instance. Préférez attr_reader par défaut et n'exposez l'écriture que si nécessaire.`,
            en: `These macros generate getters/setters for instance variables. Default to attr_reader and only expose writing when needed.`,
          },
        },
        {
          id: 'ruby-initialize',
          title: { fr: 'initialize et variables d\'instance', en: 'initialize and instance variables' },
          code: `class Compte
  def initialize(titulaire, solde = 0)
    @titulaire = titulaire   # @x = variable d'instance
    @solde = solde
  end
end

c = Compte.new("Ada", 100)   # new appelle initialize`,
          note: {
            fr: `MaClasse.new alloue l'objet puis appelle initialize avec les arguments. Une @variable non assignée vaut nil sans erreur — gare aux fautes de frappe.`,
            en: `MyClass.new allocates the object then calls initialize with the arguments. An unassigned @variable is nil with no error — beware of typos.`,
          },
        },
        {
          id: 'ruby-include-extend-prepend',
          title: { fr: 'include vs extend vs prepend', en: 'include vs extend vs prepend' },
          code: `module Salut
  def hello = "salut"
end

class A; include Salut; end  # méthodes d'INSTANCE : A.new.hello
class B; extend Salut; end   # méthodes de CLASSE : B.hello
class C; prepend Salut; end  # avant la classe dans l'ancestry
# C.ancestors => [Salut, C, ...] — Salut intercepte d'abord`,
          note: {
            fr: `include insère le module au-dessus de la classe (méthodes d'instance), extend l'ajoute au singleton (méthodes de classe), prepend l'insère en dessous : le module intercepte les appels et peut appeler super.`,
            en: `include inserts the module above the class (instance methods), extend adds it to the singleton (class methods), prepend inserts it below: the module intercepts calls and can call super.`,
          },
        },
        {
          id: 'ruby-module-function',
          title: { fr: 'module_function et self.', en: 'module_function and self.' },
          code: `module Maths
  def self.double(x) = x * 2   # méthode de module

  module_function               # tout ce qui suit : les deux usages
  def triple(x) = x * 3
end

Maths.double(2)  # 4
Maths.triple(2)  # 6 — et dispo en privé si include`,
          note: {
            fr: `def self.x crée une méthode appelable sur le module. module_function fait pareil ET fournit une copie privée d'instance aux classes qui incluent le module.`,
            en: `def self.x creates a method callable on the module. module_function does the same AND provides a private instance copy to classes that include the module.`,
          },
        },
        {
          id: 'ruby-method-missing',
          title: { fr: 'method_missing + respond_to_missing?', en: 'method_missing + respond_to_missing?' },
          code: `class Proxy
  def initialize(cible) = @cible = cible

  def method_missing(nom, *args, &blk)
    return @cible.send(nom, *args, &blk) if @cible.respond_to?(nom)
    super  # important : sinon on avale toutes les erreurs
  end

  def respond_to_missing?(nom, inclure_prive = false)
    @cible.respond_to?(nom) || super
  end
end`,
          note: {
            fr: `method_missing intercepte les appels inconnus (délégation, DSL). Toujours définir respond_to_missing? en miroir, sinon respond_to? ment et method(:x) échoue.`,
            en: `method_missing intercepts unknown calls (delegation, DSLs). Always define respond_to_missing? to match, otherwise respond_to? lies and method(:x) fails.`,
          },
        },
      ],
    },
    {
      id: 'strings',
      title: { fr: 'Strings & hash utiles', en: 'Useful strings & hashes' },
      items: [
        {
          id: 'ruby-heredoc',
          title: { fr: 'Heredoc <<~ (indentation retirée)', en: 'Heredoc <<~ (de-indented)' },
          code: `sql = <<~SQL
  SELECT *
  FROM users
  WHERE actif = true
SQL
# <<~ retire l'indentation commune ; <<- garde l'indentation`,
          note: {
            fr: `<<~ (squiggly heredoc) supprime l'indentation minimale commune : le code reste indenté, la string sort propre. L'interpolation #{} y fonctionne.`,
            en: `<<~ (squiggly heredoc) strips the smallest common indentation: code stays indented, the string comes out clean. #{} interpolation works inside.`,
          },
        },
        {
          id: 'ruby-gsub-regex',
          title: { fr: 'gsub + regex', en: 'gsub + regex' },
          code: `"hello world".gsub(/o/, "0")            # "hell0 w0rld"
"2026-06-06".gsub(/(\\d+)-(\\d+)-(\\d+)/, '\\3/\\2/\\1') # "06/06/2026"
"abc".gsub(/[abc]/) { |c| c.upcase }     # bloc : "ABC"
"a1b2".scan(/\\d/)                       # ["1", "2"]`,
          note: {
            fr: `gsub remplace toutes les occurrences (sub : la première). Avec un bloc, le remplacement est calculé ; avec une string, \\1..\\9 référencent les groupes capturés.`,
            en: `gsub replaces all occurrences (sub: only the first). With a block the replacement is computed; with a string, \\1..\\9 reference captured groups.`,
          },
        },
        {
          id: 'ruby-format',
          title: { fr: 'format et l\'opérateur %', en: 'format and the % operator' },
          code: `format("%.2f €", 3.14159)        # "3.14 €"
format("%05d", 42)                # "00042"
"%s a %d ans" % ["Ada", 36]       # "Ada a 36 ans"
format("%x", 255)                 # "ff" — hexadécimal`,
          note: {
            fr: `format (alias sprintf) suit les conventions printf : %s string, %d entier, %f flottant, %x hexa. "modèle" % valeurs est le raccourci équivalent.`,
            en: `format (alias sprintf) follows printf conventions: %s string, %d integer, %f float, %x hex. "template" % values is the equivalent shorthand.`,
          },
        },
        {
          id: 'ruby-hash-default',
          title: { fr: 'Hash avec valeur par défaut', en: 'Hash with a default value' },
          code: `compteur = Hash.new(0)            # défaut : 0
"abracadabra".each_char { |c| compteur[c] += 1 }
# {"a"=>5, "b"=>2, ...}
listes = Hash.new { |h, k| h[k] = [] } # défaut : nouveau tableau
listes[:fruits] << "pomme"`,
          note: {
            fr: `Hash.new(0) renvoie 0 pour toute clé absente — parfait pour compter. Pour un objet mutable (Array, Hash), utilisez la forme bloc, sinon toutes les clés partageraient le même objet.`,
            en: `Hash.new(0) returns 0 for any missing key — perfect for counting. For a mutable object (Array, Hash), use the block form, otherwise every key would share the same object.`,
          },
        },
        {
          id: 'ruby-transform-keys-values',
          title: { fr: 'transform_keys / transform_values', en: 'transform_keys / transform_values' },
          code: `h = { "nom" => "ada", "ville" => "lyon" }
h.transform_keys(&:to_sym)     # {nom: "ada", ville: "lyon"}
h.transform_values(&:capitalize) # valeurs en majuscule initiale
{ a: 1, b: 2 }.transform_values { |v| v * 10 } # {a: 10, b: 20}`,
          note: {
            fr: `Transforme toutes les clés ou valeurs en un appel, sans reduce manuel. Versions ! disponibles pour muter en place ; typique pour symboliser des clés venant de JSON.`,
            en: `Transforms all keys or values in one call, no manual reduce. Bang (!) versions mutate in place; typical for symbolizing keys coming from JSON.`,
          },
        },
        {
          id: 'ruby-frozen-string-literal',
          title: { fr: 'frozen_string_literal', en: 'frozen_string_literal' },
          code: `# frozen_string_literal: true
# (commentaire magique en 1re ligne du fichier)
s = "abc"
s.frozen?      # true
s << "d"       # FrozenError !
t = +"abc"     # +"" : copie mutable`,
          note: {
            fr: `Ce commentaire magique gèle tous les littéraux string du fichier : moins d'allocations et mutations accidentelles impossibles. Préfixez +"..." ou utilisez dup pour obtenir une copie mutable.`,
            en: `This magic comment freezes every string literal in the file: fewer allocations and no accidental mutations. Prefix +"..." or use dup to get a mutable copy.`,
          },
        },
      ],
    },
    {
      id: 'errors',
      title: { fr: 'Erreurs & contrôle', en: 'Errors & control flow' },
      items: [
        {
          id: 'ruby-begin-rescue-ensure',
          title: { fr: 'begin / rescue / ensure', en: 'begin / rescue / ensure' },
          code: `begin
  resultat = 10 / 0
rescue ZeroDivisionError => e
  puts "Erreur : #{e.message}"
rescue StandardError => e   # filet plus large, après le spécifique
  puts "Autre souci"
ensure
  puts "Toujours exécuté"   # nettoyage (fermer fichier, etc.)
end`,
          note: {
            fr: `rescue sans classe attrape StandardError (pas Exception — n'attrapez jamais Exception, vous masqueriez les signaux et erreurs système). ensure s'exécute dans tous les cas.`,
            en: `rescue without a class catches StandardError (not Exception — never rescue Exception, you would swallow signals and system errors). ensure always runs.`,
          },
        },
        {
          id: 'ruby-raise-custom',
          title: { fr: 'raise + erreurs custom', en: 'raise + custom errors' },
          code: `class StockInsuffisantError < StandardError
  def initialize(msg = "Stock insuffisant") = super
end

def retirer(qte, stock)
  raise StockInsuffisantError if qte > stock
  raise ArgumentError, "qte négative" if qte.negative?
  stock - qte
end`,
          note: {
            fr: `Héritez de StandardError (jamais d'Exception) pour que vos erreurs soient attrapées par un rescue standard. Une hiérarchie d'erreurs par domaine facilite les rescue ciblés.`,
            en: `Inherit from StandardError (never Exception) so your errors are caught by a plain rescue. A per-domain error hierarchy makes targeted rescues easy.`,
          },
        },
        {
          id: 'ruby-retry',
          title: { fr: 'retry — réessayer après rescue', en: 'retry — try again after rescue' },
          code: `tentatives = 0
begin
  tentatives += 1
  appel_api_instable
rescue Timeout::Error
  retry if tentatives < 3   # rejoue le bloc begin
  raise                      # re-lève après 3 échecs
end`,
          note: {
            fr: `retry relance tout le bloc begin depuis le début — indispensable de borner avec un compteur sous peine de boucle infinie. raise seul re-lève l'exception courante.`,
            en: `retry restarts the whole begin block from the top — always bound it with a counter or you risk an infinite loop. A bare raise re-raises the current exception.`,
          },
        },
        {
          id: 'ruby-unless-until-modifiers',
          title: { fr: 'unless / until / modificateurs', en: 'unless / until / modifiers' },
          code: `puts "vide" unless stock > 0   # if négatif, en suffixe
envoyer_alerte if urgent        # modificateur if
i = 0
i += 1 until i >= 3             # boucle jusqu'à condition vraie
unless connecte
  rediriger_login
end`,
          note: {
            fr: `unless = if not, until = while not. Les formes suffixes (x if y) sont idiomatiques pour une ligne courte ; évitez unless avec un else ou une condition composée — illisible.`,
            en: `unless = if not, until = while not. Suffix forms (x if y) are idiomatic for a short line; avoid unless with an else or a compound condition — unreadable.`,
          },
        },
        {
          id: 'ruby-case-when',
          title: { fr: 'case/when et l\'opérateur ===', en: 'case/when and the === operator' },
          code: `def categorie(x)
  case x
  when 0..17 then "mineur"       # Range#===
  when Integer then "majeur"     # Class#=== (is_a?)
  when /admin/ then "admin"      # Regexp#===
  when ->(v) { v.nil? } then "inconnu" # Proc#===
  else "autre"
  end
end`,
          note: {
            fr: `case appelle when_clause === valeur : les ranges testent l'inclusion, les classes le type, les regexps le match, les procs s'appellent. C'est ce qui rend case bien plus puissant qu'un switch.`,
            en: `case calls when_clause === value: ranges test inclusion, classes test type, regexps match, procs get called. This is what makes case far more powerful than a switch.`,
          },
        },
        {
          id: 'ruby-pattern-matching',
          title: { fr: 'Pattern matching (case/in)', en: 'Pattern matching (case/in)' },
          code: `config = { db: { host: "localhost", port: 5432 } }
case config
in { db: { host: String => h, port: Integer => p } }
  puts "#{h}:#{p}"            # destructure + bind
in { db: { url: } }            # raccourci : bind la clé url
  puts url
else
  puts "config invalide"
end`,
          note: {
            fr: `case/in (Ruby 3.x) destructure hashes et arrays en profondeur avec vérification de type et binding de variables. Sans clause in correspondante ni else, NoMatchingPatternKeyError est levée.`,
            en: `case/in (Ruby 3.x) deeply destructures hashes and arrays with type checks and variable binding. With no matching in clause and no else, NoMatchingPatternKeyError is raised.`,
          },
        },
      ],
    },
  ],
};
