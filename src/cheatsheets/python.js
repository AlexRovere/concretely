/**
 * Cheatsheet Python — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'python',
  lang: 'python',
  sections: [
    {
      id: 'basics',
      title: { fr: 'Bases & idiomes', en: 'Basics & idioms' },
      items: [
        {
          id: 'py-fstrings',
          title: { fr: 'f-strings', en: 'f-strings' },
          code: `nom, prix = "Ada", 19.987
print(f"Bonjour {nom} !")       # interpolation
print(f"{prix:.2f} €")          # 19.99 — format inline
print(f"{prix=}")               # prix=19.987 — debug (3.8+)
print(f"{nom.upper()}")         # toute expression`,
          note: {
            fr: `LA façon moderne de formater : plus rapide que .format() et % . Le suffixe = affiche "nom=valeur", parfait pour déboguer sans répéter la variable.`,
            en: `THE modern way to format: faster than .format() and % . The = suffix prints "name=value", perfect for debugging without repeating the variable.`,
          },
        },
        {
          id: 'py-unpacking',
          title: { fr: 'Unpacking & échange', en: 'Unpacking & swap' },
          code: `a, b = 1, 2
a, b = b, a                 # échange sans variable temporaire
premier, *milieu, dernier = [1, 2, 3, 4, 5]
print(milieu)               # [2, 3, 4]
x, y = point = (3, 7)       # déstructure un tuple`,
          note: {
            fr: `L'affectation multiple déstructure n'importe quel itérable. *rest absorbe le surplus dans une liste — fini les indices manuels.`,
            en: `Multiple assignment destructures any iterable. *rest absorbs the surplus into a list — no more manual indexing.`,
          },
        },
        {
          id: 'py-enumerate-zip',
          title: { fr: 'enumerate & zip', en: 'enumerate & zip' },
          code: `noms = ["Ada", "Alan"]
ages = [36, 41]
for i, nom in enumerate(noms, start=1):  # indice + valeur
    print(i, nom)
for nom, age in zip(noms, ages):         # parcours parallèle
    print(f"{nom}: {age}")`,
          note: {
            fr: `Jamais range(len(x)) : enumerate donne l'indice, zip itère plusieurs séquences ensemble. zip s'arrête à la plus courte (strict=True lève sinon, 3.10+).`,
            en: `Never range(len(x)): enumerate yields the index, zip walks several sequences together. zip stops at the shortest (strict=True raises instead, 3.10+).`,
          },
        },
        {
          id: 'py-truthiness',
          title: { fr: 'Truthiness : le vide est falsy', en: 'Truthiness: empty is falsy' },
          code: `for vide in (0, "", [], {}, set(), None):
    assert not vide          # tous falsy
if items := []:
    print("jamais atteint")  # liste vide = False
if reponse is None:          # tester None explicitement
    print("pas encore de réponse")`,
          note: {
            fr: `0, "", [], {} et None sont falsy : "if items:" teste le non-vide. Mais pour distinguer None de 0 ou "", comparez avec "is None", pas avec la truthiness.`,
            en: `0, "", [], {} and None are falsy: "if items:" tests non-emptiness. But to tell None apart from 0 or "", compare with "is None", not truthiness.`,
          },
        },
        {
          id: 'py-walrus',
          title: { fr: 'Walrus := (3.8)', en: 'Walrus := (3.8)' },
          code: `import re
# assigne ET teste dans la même expression
if (m := re.search(r"\\d+", "abc 42")):
    print(m.group())         # 42
while (ligne := input()) != "stop":
    print(f"reçu : {ligne}")`,
          note: {
            fr: `:= assigne au sein d'une expression : évite d'appeler deux fois la même fonction dans un if/while. À réserver aux cas où il clarifie vraiment.`,
            en: `:= assigns inside an expression: avoids calling the same function twice in an if/while. Reserve it for cases where it genuinely clarifies.`,
          },
        },
        {
          id: 'py-match',
          title: { fr: 'match structurel (3.10)', en: 'Structural match (3.10)' },
          code: `def traiter(cmd):
    match cmd.split():
        case ["go", direction]:        # capture
            return f"va vers {direction}"
        case ["stop"] | ["quit"]:      # alternatives
            return "arrêt"
        case _:                        # défaut obligatoire ?  non, mais sage
            return "inconnu"`,
          note: {
            fr: `Bien plus qu'un switch : match déstructure listes, dicts et objets (case Point(x=0, y=y)). Attention : "case nom:" capture tout, ce n'est pas une comparaison.`,
            en: `Much more than a switch: match destructures lists, dicts and objects (case Point(x=0, y=y)). Careful: "case name:" captures everything, it is not a comparison.`,
          },
        },
      ],
    },
    {
      id: 'collections',
      title: { fr: 'Listes, dicts & sets', en: 'Lists, dicts & sets' },
      items: [
        {
          id: 'py-list-comprehension',
          title: { fr: 'Comprehensions', en: 'Comprehensions' },
          code: `carres = [n * n for n in range(5)]            # liste
pairs = [n for n in range(10) if n % 2 == 0] # avec filtre
longueurs = {mot: len(mot) for mot in ["a", "bc"]}  # dict
uniques = {c.lower() for c in "AaBb"}        # set -> {'a','b'}`,
          note: {
            fr: `L'idiome Python par excellence : transformer + filtrer en une expression lisible. Au-delà de deux for/if imbriqués, repassez à une boucle classique.`,
            en: `The quintessential Python idiom: transform + filter in one readable expression. Beyond two nested for/if, switch back to a plain loop.`,
          },
        },
        {
          id: 'py-slicing',
          title: { fr: 'Slicing', en: 'Slicing' },
          code: `lettres = ["a", "b", "c", "d", "e"]
print(lettres[1:3])    # ['b', 'c'] — fin exclue
print(lettres[-2:])    # ['d', 'e'] — depuis la fin
print(lettres[::2])    # ['a', 'c', 'e'] — pas de 2
print(lettres[::-1])   # inversé — copie, pas en place`,
          note: {
            fr: `seq[debut:fin:pas], bornes optionnelles, fin exclue. Un slice renvoie toujours une copie : [::-1] inverse sans modifier l'original (contrairement à .reverse()).`,
            en: `seq[start:stop:step], optional bounds, stop excluded. A slice always returns a copy: [::-1] reverses without mutating the original (unlike .reverse()).`,
          },
        },
        {
          id: 'py-dict-get',
          title: { fr: 'dict.get & setdefault', en: 'dict.get & setdefault' },
          code: `scores = {"ada": 10}
print(scores.get("alan"))        # None — pas de KeyError
print(scores.get("alan", 0))     # 0 — valeur par défaut
scores.setdefault("alan", []).append(5)  # crée si absent
print(scores["alan"])            # [5]`,
          note: {
            fr: `d[clé] lève KeyError si absent ; .get renvoie None ou un défaut. .setdefault insère ET renvoie la valeur — pratique pour accumuler dans des listes.`,
            en: `d[key] raises KeyError when missing; .get returns None or a default. .setdefault inserts AND returns the value — handy for accumulating into lists.`,
          },
        },
        {
          id: 'py-defaultdict',
          title: { fr: 'defaultdict', en: 'defaultdict' },
          code: `from collections import defaultdict
groupes = defaultdict(list)      # défaut : liste vide
for mot in ["avion", "bus", "auto"]:
    groupes[mot[0]].append(mot)  # pas de KeyError
print(dict(groupes))  # {'a': ['avion', 'auto'], 'b': ['bus']}`,
          note: {
            fr: `Fabrique la valeur par défaut au premier accès (list, int, set…). Plus net que setdefault répété. Piège : un simple accès en lecture crée aussi la clé.`,
            en: `Builds the default value on first access (list, int, set…). Cleaner than repeated setdefault. Gotcha: a mere read access also creates the key.`,
          },
        },
        {
          id: 'py-counter',
          title: { fr: 'Counter', en: 'Counter' },
          code: `from collections import Counter
votes = Counter("abracadabra")
print(votes.most_common(2))   # [('a', 5), ('b', 2)]
votes.update("aa")            # incrémente
print(votes["z"])             # 0 — jamais de KeyError`,
          note: {
            fr: `Comptage en une ligne au lieu d'une boucle + dict. most_common trie par fréquence, et les Counter s'additionnent entre eux (c1 + c2).`,
            en: `Counting in one line instead of a loop + dict. most_common sorts by frequency, and Counters can be added together (c1 + c2).`,
          },
        },
        {
          id: 'py-sorted-key',
          title: { fr: 'sorted(key=...)', en: 'sorted(key=...)' },
          code: `mots = ["Banane", "abricot", "cerise"]
print(sorted(mots, key=str.lower))        # insensible à la casse
gens = [("Ada", 36), ("Alan", 41)]
gens.sort(key=lambda p: p[1], reverse=True)  # par âge desc
# tri stable : on peut chaîner les tris du moins au plus prioritaire`,
          note: {
            fr: `sorted renvoie une nouvelle liste, .sort() modifie en place. key reçoit chaque élément et renvoie la clé de comparaison. Le tri est stable : l'ordre initial départage les ex æquo.`,
            en: `sorted returns a new list, .sort() mutates in place. key receives each element and returns the comparison key. The sort is stable: original order breaks ties.`,
          },
        },
        {
          id: 'py-set-ops',
          title: { fr: "Opérations d'ensembles", en: 'Set operations' },
          code: `a = {1, 2, 3}
b = {3, 4}
print(a & b)   # {3} — intersection
print(a | b)   # {1, 2, 3, 4} — union
print(a - b)   # {1, 2} — différence
print(2 in a)  # True — test en O(1)`,
          note: {
            fr: `Dédoublonner, comparer deux collections, tester l'appartenance : les sets le font en O(1) là où une liste scanne tout. set(liste) déduplique en un appel.`,
            en: `Dedupe, compare two collections, test membership: sets do it in O(1) where a list scans everything. set(list) deduplicates in one call.`,
          },
        },
      ],
    },
    {
      id: 'functions',
      title: { fr: 'Fonctions', en: 'Functions' },
      items: [
        {
          id: 'py-args-kwargs',
          title: { fr: '*args & **kwargs', en: '*args & **kwargs' },
          code: `def journal(*args, **kwargs):
    print(args)    # tuple des positionnels
    print(kwargs)  # dict des nommés
journal(1, 2, niveau="info")  # (1, 2) {'niveau': 'info'}
params = {"sep": " | "}
print("a", "b", **params)     # déballage à l'appel`,
          note: {
            fr: `*args collecte les arguments positionnels en tuple, **kwargs les nommés en dict. À l'appel, * et ** font l'inverse : ils déballent une séquence ou un dict.`,
            en: `*args collects positional arguments into a tuple, **kwargs collects named ones into a dict. At call time, * and ** do the reverse: they unpack a sequence or a dict.`,
          },
        },
        {
          id: 'py-keyword-only',
          title: { fr: 'Arguments keyword-only (*)', en: 'Keyword-only arguments (*)' },
          code: `def deplacer(fichier, *, ecraser=False, dry_run=False):
    ...
deplacer("a.txt", ecraser=True)   # OK, explicite
# deplacer("a.txt", True)         # TypeError !
# le * force les drapeaux à être nommés à l'appel`,
          note: {
            fr: `Tout ce qui suit * doit être passé par nom : les appels deviennent auto-documentés et on peut réordonner les paramètres sans casser les appelants.`,
            en: `Everything after * must be passed by name: calls become self-documenting and you can reorder parameters without breaking callers.`,
          },
        },
        {
          id: 'py-mutable-default',
          title: { fr: 'Le piège du défaut mutable', en: 'The mutable default trap' },
          code: `def ajouter(x, liste=[]):      # BUG : un seul [] partagé
    liste.append(x)
    return liste
print(ajouter(1), ajouter(2))  # [1, 2] [1, 2] !
def ajouter_ok(x, liste=None): # idiome correct
    liste = [] if liste is None else liste
    return liste + [x]`,
          note: {
            fr: `Les valeurs par défaut sont évaluées UNE fois, à la définition : une liste/dict par défaut est partagée entre tous les appels. Utilisez None comme sentinelle.`,
            en: `Default values are evaluated ONCE, at definition time: a default list/dict is shared across all calls. Use None as a sentinel instead.`,
          },
        },
        {
          id: 'py-lambda',
          title: { fr: 'lambda', en: 'lambda' },
          code: `double = lambda x: x * 2          # éviter : nommez avec def
paires = sorted(d.items(), key=lambda kv: kv[1])  # le vrai usage
from operator import itemgetter
paires = sorted(d.items(), key=itemgetter(1))     # alternative`,
          note: {
            fr: `Une lambda est une fonction anonyme d'une seule expression — idéale comme key= ou callback. Pour la nommer, préférez def (meilleurs tracebacks, docstring possible).`,
            en: `A lambda is a single-expression anonymous function — ideal as key= or callback. To name one, prefer def (better tracebacks, docstring possible).`,
          },
        },
        {
          id: 'py-decorators',
          title: { fr: 'Décorateurs (@wraps)', en: 'Decorators (@wraps)' },
          code: `from functools import wraps
def chrono(fn):
    @wraps(fn)               # préserve __name__, docstring…
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)  # avant/après : votre logique
    return wrapper
@chrono
def calcul(): ...            # calcul = chrono(calcul)`,
          note: {
            fr: `@deco équivaut à fn = deco(fn) : on enveloppe une fonction pour ajouter du comportement (log, cache, retry). Sans @wraps, le wrapper masque le nom et la doc d'origine.`,
            en: `@deco is just fn = deco(fn): you wrap a function to add behavior (log, cache, retry). Without @wraps, the wrapper hides the original name and docstring.`,
          },
        },
        {
          id: 'py-generators',
          title: { fr: 'Generators & yield', en: 'Generators & yield' },
          code: `def lire_lignes(chemin):
    with open(chemin) as f:
        for ligne in f:
            yield ligne.strip()   # produit à la demande
total = sum(n * n for n in range(10**6))  # genexp : zéro liste
premiers = (l for l in lire_lignes("log.txt") if "ERROR" in l)`,
          note: {
            fr: `yield suspend la fonction et produit une valeur à la fois : on traite des données énormes sans tout charger en mémoire. Piège : un générateur s'épuise après une seule itération.`,
            en: `yield suspends the function and produces one value at a time: process huge data without loading it all in memory. Gotcha: a generator is exhausted after a single iteration.`,
          },
        },
      ],
    },
    {
      id: 'classes',
      title: { fr: 'Classes & dataclasses', en: 'Classes & dataclasses' },
      items: [
        {
          id: 'py-dataclass',
          title: { fr: '@dataclass', en: '@dataclass' },
          code: `from dataclasses import dataclass
@dataclass
class Point:
    x: float
    y: float = 0.0           # défaut possible
p = Point(1.5, 2.0)
print(p)                     # Point(x=1.5, y=2.0) — __repr__ offert
print(p == Point(1.5, 2.0))  # True — __eq__ offert`,
          note: {
            fr: `Génère __init__, __repr__ et __eq__ depuis les annotations : fini le boilerplate. Le choix par défaut pour tout objet "porteur de données".`,
            en: `Generates __init__, __repr__ and __eq__ from annotations: no more boilerplate. The default choice for any "data carrier" object.`,
          },
        },
        {
          id: 'py-dataclass-frozen-factory',
          title: { fr: 'frozen & default_factory', en: 'frozen & default_factory' },
          code: `from dataclasses import dataclass, field
@dataclass(frozen=True)          # immuable + hashable
class Config:
    nom: str
    tags: list = field(default_factory=list)  # PAS tags=[] !
c = Config("api")
# c.nom = "x"  -> FrozenInstanceError`,
          note: {
            fr: `frozen=True rend l'instance immuable (utilisable comme clé de dict). Pour un défaut mutable, default_factory est obligatoire — même piège que les défauts de fonction.`,
            en: `frozen=True makes the instance immutable (usable as a dict key). For a mutable default, default_factory is mandatory — same trap as function defaults.`,
          },
        },
        {
          id: 'py-repr-eq',
          title: { fr: '__repr__ & __eq__', en: '__repr__ & __eq__' },
          code: `class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):           # pour le debug / REPL
        return f"Point({self.x!r}, {self.y!r})"
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)`,
          note: {
            fr: `Sans __repr__, print(obj) affiche <Point object at 0x...> : inutilisable en debug. Sans __eq__, == compare les identités mémoire, pas les valeurs.`,
            en: `Without __repr__, print(obj) shows <Point object at 0x...>: useless for debugging. Without __eq__, == compares memory identities, not values.`,
          },
        },
        {
          id: 'py-property',
          title: { fr: '@property', en: '@property' },
          code: `class Cercle:
    def __init__(self, rayon):
        self.rayon = rayon
    @property
    def aire(self):              # accès sans parenthèses
        return 3.14159 * self.rayon ** 2
c = Cercle(2)
print(c.aire)                    # 12.57… — calculé à la volée`,
          note: {
            fr: `Un attribut calculé qui se lit comme un champ : on peut commencer par un simple attribut puis le transformer en property sans casser les appelants. Pas de getters/setters à la Java.`,
            en: `A computed attribute that reads like a field: start with a plain attribute, later turn it into a property without breaking callers. No Java-style getters/setters.`,
          },
        },
        {
          id: 'py-enum',
          title: { fr: 'Enum', en: 'Enum' },
          code: `from enum import Enum, auto
class Statut(Enum):
    BROUILLON = auto()
    PUBLIE = auto()
    ARCHIVE = auto()
s = Statut.PUBLIE
print(s.name, s.value)        # PUBLIE 2
print(s is Statut.PUBLIE)     # True — comparer par identité, pas string`,
          note: {
            fr: `Remplace les constantes en chaînes "magiques" : valeurs typées, itérables, et une faute de frappe lève une erreur au lieu de passer silencieusement.`,
            en: `Replaces "magic" string constants: typed, iterable values, and a typo raises an error instead of passing silently.`,
          },
        },
        {
          id: 'py-dunder-protocols',
          title: { fr: 'Protocoles dunder', en: 'Dunder protocols' },
          code: `class Panier:
    def __init__(self):
        self._items = []
    def __len__(self):            # active len(panier)
        return len(self._items)
    def __iter__(self):           # active for x in panier et x in panier
        return iter(self._items)`,
          note: {
            fr: `Implémentez les méthodes __dunder__ et vos objets parlent le langage de Python : len(), for, in, [] fonctionnent nativement. C'est le duck typing structuré.`,
            en: `Implement __dunder__ methods and your objects speak Python's language: len(), for, in, [] work natively. This is structured duck typing.`,
          },
        },
        {
          id: 'py-inheritance',
          title: { fr: 'Héritage & super()', en: 'Inheritance & super()' },
          code: `class Animal:
    def __init__(self, nom):
        self.nom = nom
    def crier(self):
        return "..."
class Chien(Animal):                  # hérite de Animal
    def __init__(self, nom, race):
        super().__init__(nom)         # délègue au constructeur parent
        self.race = race
    def crier(self):                  # override : même nom, sans mot-clé
        return "Ouaf"`,
          note: {
            fr: `class Enfant(Parent) hérite des attributs et méthodes ; super().__init__() appelle le constructeur parent au lieu de le réécrire. Redéfinir une méthode l'« override » — pas de mot-clé, juste le même nom. Préférez la composition à l'héritage profond.`,
            en: `class Child(Parent) inherits attributes and methods; super().__init__() calls the parent constructor instead of rewriting it. Redefining a method overrides it — no keyword, just the same name. Prefer composition over deep inheritance.`,
          },
        },
        {
          id: 'py-abc',
          title: { fr: 'ABC — classes abstraites', en: 'ABC — abstract classes' },
          code: `from abc import ABC, abstractmethod
class Depot(ABC):
    @abstractmethod
    def sauver(self, x): ...           # contrat, sans corps
class DepotSQL(Depot):
    def sauver(self, x):
        ...                            # DOIT être implémenté
# Depot()  -> TypeError : classe abstraite
DepotSQL().sauver(42)                  # OK`,
          note: {
            fr: `L'interface « à la Java » : une ABC ne s'instancie pas et force chaque sous-classe à implémenter les @abstractmethod, sinon TypeError. Le contrat est vérifié à l'exécution, via héritage explicite. Pour un contrat sans héritage, voir Protocol.`,
            en: `The "Java-style" interface: an ABC cannot be instantiated and forces every subclass to implement the @abstractmethods, else TypeError. The contract is checked at runtime, via explicit inheritance. For a contract without inheritance, see Protocol.`,
          },
        },
        {
          id: 'py-protocol',
          title: { fr: 'Protocol — interface structurelle', en: 'Protocol — structural interface' },
          code: `from typing import Protocol
class Fermable(Protocol):
    def fermer(self) -> None: ...      # signature attendue
def liberer(r: Fermable):
    r.fermer()
class Fichier:                         # n'hérite PAS de Fermable
    def fermer(self): ...
liberer(Fichier())                     # OK : conformité vérifiée par mypy`,
          note: {
            fr: `Le duck typing rendu vérifiable : un objet « est » un Protocol dès qu'il en a les méthodes, sans hériter de rien. mypy/pyright contrôlent la conformité statiquement ; à l'exécution rien n'est imposé. C'est l'inverse de l'ABC — idéal pour typer du code existant.`,
            en: `Duck typing made checkable: an object "is" a Protocol as soon as it has its methods, without inheriting anything. mypy/pyright verify conformance statically; at runtime nothing is enforced. It is the inverse of ABC — ideal for typing existing code.`,
          },
        },
      ],
    },
    {
      id: 'stdlib',
      title: { fr: 'Batteries incluses', en: 'Batteries included' },
      items: [
        {
          id: 'py-pathlib',
          title: { fr: 'pathlib', en: 'pathlib' },
          code: `from pathlib import Path
p = Path("data") / "logs" / "app.txt"   # / pour joindre
print(p.suffix, p.stem)                 # .txt app
texte = p.read_text(encoding="utf-8")   # lecture en 1 ligne
for f in Path(".").glob("**/*.py"):     # recherche récursive
    print(f)`,
          note: {
            fr: `LE remplaçant d'os.path : objets au lieu de chaînes, l'opérateur / joint les chemins proprement sur tous les OS. read_text/write_text évitent même le open().`,
            en: `THE replacement for os.path: objects instead of strings, the / operator joins paths cleanly on every OS. read_text/write_text even skip the open().`,
          },
        },
        {
          id: 'py-json',
          title: { fr: 'json', en: 'json' },
          code: `import json
data = {"nom": "Ada", "tags": ["math", "code"]}
s = json.dumps(data, ensure_ascii=False, indent=2)  # -> str
obj = json.loads(s)                                 # str -> dict
with open("cfg.json", encoding="utf-8") as f:
    cfg = json.load(f)        # depuis un fichier (sans s)`,
          note: {
            fr: `dumps/loads pour les chaînes, dump/load pour les fichiers — le s fait toute la différence. ensure_ascii=False garde les accents lisibles au lieu de \\u00e9.`,
            en: `dumps/loads for strings, dump/load for files — the s makes all the difference. ensure_ascii=False keeps accents readable instead of \\u00e9.`,
          },
        },
        {
          id: 'py-datetime',
          title: { fr: 'datetime & timezone', en: 'datetime & timezone' },
          code: `from datetime import datetime, timedelta, timezone
maintenant = datetime.now(timezone.utc)   # TOUJOURS aware
demain = maintenant + timedelta(days=1)
print(maintenant.isoformat())             # 2026-06-07T…+00:00
d = datetime.fromisoformat("2026-06-07T12:00:00+02:00")`,
          note: {
            fr: `datetime.now() sans timezone crée un datetime "naïf" : comparaisons et conversions deviennent des pièges. Stockez en UTC aware, convertissez à l'affichage (zoneinfo).`,
            en: `datetime.now() without a timezone creates a "naive" datetime: comparisons and conversions become traps. Store as aware UTC, convert for display (zoneinfo).`,
          },
        },
        {
          id: 'py-itertools',
          title: { fr: 'itertools', en: 'itertools' },
          code: `from itertools import chain, groupby
print(list(chain([1, 2], [3], [4])))   # [1, 2, 3, 4]
mots = ["avion", "auto", "bus"]
for lettre, grp in groupby(mots, key=lambda m: m[0]):
    print(lettre, list(grp))  # a ['avion', 'auto'] / b ['bus']`,
          note: {
            fr: `Des itérateurs paresseux composables : chain concatène sans copier. Piège de groupby : il ne groupe que les éléments CONSÉCUTIFS — triez d'abord par la même clé.`,
            en: `Composable lazy iterators: chain concatenates without copying. groupby gotcha: it only groups CONSECUTIVE elements — sort by the same key first.`,
          },
        },
        {
          id: 'py-collections-extra',
          title: { fr: 'namedtuple & deque', en: 'namedtuple & deque' },
          code: `from collections import namedtuple, deque
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(p.x, p[1])              # accès par nom OU indice
file = deque(maxlen=3)        # garde les 3 derniers
file.extend([1, 2, 3, 4])     # -> deque([2, 3, 4])`,
          note: {
            fr: `namedtuple : un tuple lisible et immuable, parfait en retour de fonction. deque : append/popleft en O(1) aux deux bouts — la vraie file, là où list.pop(0) est O(n).`,
            en: `namedtuple: a readable, immutable tuple, perfect as a function return. deque: O(1) append/popleft at both ends — the real queue, where list.pop(0) is O(n).`,
          },
        },
        {
          id: 'py-contextmanager',
          title: { fr: 'with & contextmanager', en: 'with & contextmanager' },
          code: `from contextlib import contextmanager
@contextmanager
def chrono(label):             # setup avant le yield
    try:
        yield                  # le bloc with s'exécute ici
    finally:
        print(f"{label} terminé")  # toujours exécuté
with chrono("import"): ...     # combinable : with a, b:`,
          note: {
            fr: `with garantit le nettoyage (fermeture, libération) même en cas d'exception. @contextmanager transforme un générateur en context manager : setup avant yield, teardown après.`,
            en: `with guarantees cleanup (closing, releasing) even on exceptions. @contextmanager turns a generator into a context manager: setup before yield, teardown after.`,
          },
        },
      ],
    },
    {
      id: 'tooling',
      title: { fr: 'Env & outillage', en: 'Env & tooling' },
      items: [
        {
          id: 'py-venv-pip',
          title: { fr: 'venv + pip', en: 'venv + pip' },
          code: `python -m venv .venv              # crée l'environnement isolé
source .venv/bin/activate          # (Windows : .venv\\Scripts\\activate)
pip install requests
pip freeze > requirements.txt      # fige les versions exactes
pip install -r requirements.txt   # reproduit l'environnement`,
          note: {
            fr: `Un venv par projet, toujours : installer en global crée des conflits de versions. requirements.txt fige l'existant ; pyproject.toml déclare les dépendances voulues (l'approche moderne, cf. uv/poetry).`,
            en: `One venv per project, always: global installs create version conflicts. requirements.txt pins what exists; pyproject.toml declares intended dependencies (the modern approach, see uv/poetry).`,
          },
        },
        {
          id: 'py-pytest',
          title: { fr: 'pytest', en: 'pytest' },
          code: `# test_calc.py — pytest découvre test_*.py tout seul
def test_addition():
    assert 1 + 1 == 2          # assert nu, pas de self.assertEqual
import pytest
@pytest.mark.parametrize("n,attendu", [(2, 4), (3, 9)])
def test_carre(n, attendu):
    assert n * n == attendu    # un test par cas`,
          note: {
            fr: `Le standard de fait : de simples assert avec des messages d'échec détaillés. parametrize multiplie les cas sans dupliquer le code ; lancez avec "pytest -x" pour stopper au premier échec.`,
            en: `The de facto standard: plain asserts with detailed failure messages. parametrize multiplies cases without duplicating code; run with "pytest -x" to stop at first failure.`,
          },
        },
        {
          id: 'py-pytest-fixtures',
          title: { fr: 'Fixtures pytest', en: 'pytest fixtures' },
          code: `import pytest
@pytest.fixture
def client():
    c = creer_client_test()    # setup
    yield c                    # injecté dans les tests
    c.fermer()                 # teardown garanti
def test_ping(client):         # demandée par son nom
    assert client.ping()`,
          note: {
            fr: `Une fixture prépare l'état et l'injecte par simple nom de paramètre — pas de setUp/tearDown hérités. Le code après yield s'exécute même si le test échoue.`,
            en: `A fixture prepares state and injects it by mere parameter name — no inherited setUp/tearDown. Code after yield runs even when the test fails.`,
          },
        },
        {
          id: 'py-ruff-black',
          title: { fr: 'ruff & black', en: 'ruff & black' },
          code: `pip install ruff
ruff check . --fix     # lint + corrections auto (remplace flake8/isort)
ruff format .          # formatage compatible black
# config dans pyproject.toml :
# [tool.ruff]
# line-length = 100`,
          note: {
            fr: `ruff (en Rust) fait lint + format à une vitesse fulgurante et remplace flake8, isort et black à lui seul. Un formateur imposé = zéro débat de style en revue de code.`,
            en: `ruff (written in Rust) lints + formats blazingly fast and single-handedly replaces flake8, isort and black. An enforced formatter = zero style debates in code review.`,
          },
        },
        {
          id: 'py-type-hints',
          title: { fr: 'Type hints', en: 'Type hints' },
          code: `def moyenne(notes: list[float]) -> float:   # builtins génériques (3.9+)
    return sum(notes) / len(notes)
def chercher(id: int) -> str | None:        # | remplace Optional (3.10+)
    ...
scores: dict[str, int] = {}
# vérification statique : mypy .   (ou pyright)`,
          note: {
            fr: `Les hints ne changent RIEN à l'exécution : c'est mypy/pyright qui vérifie. Depuis 3.9+ utilisez list[int] et str | None — plus besoin de typing.List ni d'Optional.`,
            en: `Hints change NOTHING at runtime: mypy/pyright does the checking. Since 3.9+ use list[int] and str | None — no more typing.List or Optional needed.`,
          },
        },
        {
          id: 'py-python-m',
          title: { fr: 'python -m', en: 'python -m' },
          code: `python -m venv .venv         # lance un module comme script
python -m pip install x      # LE pip du bon interpréteur
python -m http.server 8000   # serveur statique instantané
python -m json.tool f.json   # pretty-print du JSON
python -m pytest             # ajoute le cwd au sys.path`,
          note: {
            fr: `-m exécute un module via l'interpréteur courant : "python -m pip" garantit d'installer dans le bon venv quand plusieurs Python cohabitent. Beaucoup de modules stdlib sont des outils CLI cachés.`,
            en: `-m runs a module through the current interpreter: "python -m pip" guarantees installing into the right venv when several Pythons coexist. Many stdlib modules are hidden CLI tools.`,
          },
        },
      ],
    },
    {
      id: 'data',
      title: { fr: 'NumPy & pandas', en: 'NumPy & pandas' },
      items: [
        {
          id: 'py-numpy-array',
          title: { fr: 'ndarray & vectorisation', en: 'ndarray & vectorization' },
          code: `import numpy as np
a = np.array([1, 2, 3])
print(a * 2)              # [2 4 6] — vectorisé, aucune boucle
print(a + a)              # [2 4 6] — élément par élément
m = np.zeros((2, 3))      # matrice 2x3 de 0.0
print(m.shape, m.dtype)   # (2, 3) float64`,
          note: {
            fr: `NumPy remplace les boucles Python par des opérations vectorisées en C : 10 à 100× plus rapide sur de gros tableaux. Un ndarray a UN type (dtype) et une forme (shape) fixes, contrairement à une liste hétérogène — c'est ce qui le rend rapide.`,
            en: `NumPy replaces Python loops with C-level vectorized operations: 10–100× faster on large arrays. An ndarray has ONE fixed type (dtype) and shape, unlike a heterogeneous list — that is what makes it fast.`,
          },
        },
        {
          id: 'py-numpy-axis',
          title: { fr: 'Agrégations par axe & broadcasting', en: 'Axis aggregations & broadcasting' },
          code: `import numpy as np
notes = np.array([[12, 15], [8, 20]])
print(notes.mean(axis=0))   # [10.  17.5] — moyenne par colonne
print(notes.mean(axis=1))   # [13.5 14. ] — moyenne par ligne
print(notes - notes.mean(axis=0))  # centre chaque colonne (broadcasting)`,
          note: {
            fr: `axis=0 agit le long des lignes (résultat PAR colonne), axis=1 l'inverse — la source d'erreur n°1 en data. Le broadcasting étend automatiquement le tableau le plus petit pour aligner les formes, sans copie ni boucle explicite.`,
            en: `axis=0 acts along the rows (result PER column), axis=1 the opposite — the #1 source of bugs in data work. Broadcasting automatically stretches the smaller array to align shapes, with no copy or explicit loop.`,
          },
        },
        {
          id: 'py-numpy-mask',
          title: { fr: 'Indexation booléenne & np.where', en: 'Boolean indexing & np.where' },
          code: `import numpy as np
x = np.array([5, 12, 3, 20])
print(x[x > 10])              # [12 20] — masque booléen
x[x < 5] = 0                  # remplace en place les < 5
signe = np.where(x > 10, 1, 0)  # if/else vectorisé -> [0 1 0 1]`,
          note: {
            fr: `Un masque booléen (x > 10) sélectionne ou modifie des sous-ensembles sans boucle — c'est le cœur du filtrage de données. np.where(cond, a, b) est le if/else vectorisé, base de l'ingénierie de features (feature engineering).`,
            en: `A boolean mask (x > 10) selects or modifies subsets without a loop — the heart of data filtering. np.where(cond, a, b) is the vectorized if/else, the basis of feature engineering.`,
          },
        },
        {
          id: 'py-pandas-dataframe',
          title: { fr: 'DataFrame : créer & explorer', en: 'DataFrame: create & explore' },
          code: `import pandas as pd
df = pd.DataFrame({"nom": ["Ada", "Alan"], "age": [36, 41]})
df.head()          # aperçu des 5 premières lignes
df.info()          # colonnes, types (dtypes) et NaN
df.describe()      # min/max/moyenne des colonnes numériques
df = pd.read_csv("data.csv")   # le point d'entrée le plus courant`,
          note: {
            fr: `Un DataFrame est un tableau 2D étiqueté (colonnes nommées, index de lignes) — le format de travail universel de la data science. head/info/describe : le tout premier réflexe pour cerner un jeu de données inconnu avant tout traitement.`,
            en: `A DataFrame is a labeled 2D table (named columns, row index) — the universal working format of data science. head/info/describe: the very first reflex to grasp an unknown dataset before any processing.`,
          },
        },
        {
          id: 'py-pandas-select',
          title: { fr: 'loc / iloc & filtres', en: 'loc / iloc & filtering' },
          code: `df.loc[0, "nom"]           # par ÉTIQUETTE (ligne, colonne)
df.iloc[0, 0]              # par POSITION entière
df[df["age"] > 40]         # filtre booléen (lignes)
df["adulte"] = df["age"] >= 18   # nouvelle colonne, vectorisée`,
          note: {
            fr: `loc indexe par étiquette, iloc par position entière — les confondre est l'erreur classique. Un masque booléen filtre les lignes ; assigner à df["col"] crée ou écrase une colonne entière d'un coup, sans boucle.`,
            en: `loc indexes by label, iloc by integer position — mixing them up is the classic mistake. A boolean mask filters rows; assigning to df["col"] creates or overwrites a whole column at once, loop-free.`,
          },
        },
        {
          id: 'py-pandas-groupby',
          title: { fr: 'groupby & agg', en: 'groupby & agg' },
          code: `ventes = pd.DataFrame({"ville": ["Paris", "Lyon", "Paris"],
                       "montant": [10, 5, 7]})
ventes.groupby("ville")["montant"].sum()     # Paris 17, Lyon 5
ventes.groupby("ville").agg(
    total=("montant", "sum"),
    n=("montant", "count"))`,
          note: {
            fr: `split-apply-combine : groupby découpe par clé, agg applique une ou plusieurs fonctions par groupe. C'est le GROUP BY de SQL en une ligne — la brique de tout reporting et de la construction de features agrégées.`,
            en: `split-apply-combine: groupby slices by key, agg applies one or more functions per group. It is SQL's GROUP BY in one line — the building block of any reporting and of aggregated feature construction.`,
          },
        },
        {
          id: 'py-pandas-missing',
          title: { fr: 'Valeurs manquantes (NaN)', en: 'Missing values (NaN)' },
          code: `df = pd.DataFrame({"a": [1, None, 3], "b": [None, 2, 3]})
df.isna().sum()            # compte les NaN par colonne
df.dropna()                # supprime les lignes incomplètes
df.fillna(df.mean(numeric_only=True))   # impute par la moyenne`,
          note: {
            fr: `Les NaN cassent la plupart des modèles ML : les détecter (isna) puis décider — supprimer (dropna) s'ils sont rares, imputer (fillna : moyenne, médiane, 0) sinon. Ne jamais entraîner un modèle sans avoir traité les manquants.`,
            en: `NaNs break most ML models: detect them (isna) then decide — drop (dropna) if rare, impute (fillna: mean, median, 0) otherwise. Never train a model without handling missing values first.`,
          },
        },
        {
          id: 'py-pandas-merge',
          title: { fr: 'merge & concat', en: 'merge & concat' },
          code: `clients = pd.DataFrame({"id": [1, 2], "nom": ["Ada", "Alan"]})
cmds = pd.DataFrame({"id": [1, 1, 2], "prix": [10, 5, 8]})
clients.merge(cmds, on="id", how="left")   # jointure SQL-like
pd.concat([clients, clients])              # empile verticalement`,
          note: {
            fr: `merge = jointure relationnelle (how="left"/"inner"/"outer") sur une clé commune ; concat empile des DataFrames (axis=0 lignes, axis=1 colonnes). Vérifiez toujours le nombre de lignes après un merge : une clé dupliquée les multiplie silencieusement.`,
            en: `merge = relational join (how="left"/"inner"/"outer") on a common key; concat stacks DataFrames (axis=0 rows, axis=1 columns). Always check the row count after a merge: a duplicated key silently multiplies rows.`,
          },
        },
      ],
    },
    {
      id: 'ml',
      title: { fr: 'Algorithmes de ML', en: 'ML algorithms' },
      items: [
        {
          id: 'py-ml-workflow',
          title: { fr: 'Le workflow supervisé', en: 'The supervised workflow' },
          code: `from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier().fit(X_tr, y_tr)  # apprentissage
preds = model.predict(X_te)                        # inférence
print(model.score(X_te, y_te))                     # accuracy`,
          note: {
            fr: `Le rituel scikit-learn, identique pour TOUT modèle : split, .fit(X, y), .predict(X). Évaluer sur des données jamais vues (X_te) est non négociable : un score mesuré sur les données d'entraînement ne prouve rien. random_state fige le tirage pour reproduire.`,
            en: `The scikit-learn ritual, identical for EVERY model: split, .fit(X, y), .predict(X). Evaluating on unseen data (X_te) is non-negotiable: a score measured on training data proves nothing. random_state fixes the draw for reproducibility.`,
          },
        },
        {
          id: 'py-ml-linear',
          title: { fr: 'Régression linéaire', en: 'Linear regression' },
          code: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
reg = LinearRegression().fit(X, y)     # y continu : prix, température…
print(reg.coef_, reg.intercept_)       # poids appris, interprétables
print(r2_score(y, reg.predict(X)))     # 1.0 = ajustement parfait`,
          note: {
            fr: `Prédire une valeur continue en ajustant une droite (y = a·x + b) qui minimise l'erreur quadratique. Rapide, interprétable (chaque coefficient = impact d'une variable) : c'est la baseline à battre avant tout modèle plus complexe.`,
            en: `Predict a continuous value by fitting a line (y = a·x + b) that minimizes squared error. Fast, interpretable (each coefficient = a variable's impact): it is the baseline to beat before any fancier model.`,
          },
        },
        {
          id: 'py-ml-logistic',
          title: { fr: 'Régression logistique', en: 'Logistic regression' },
          code: `from sklearn.linear_model import LogisticRegression
clf = LogisticRegression().fit(X, y)   # y = classes : 0/1, spam/ok
clf.predict(X[:1])                     # classe prédite
clf.predict_proba(X[:1])               # probabilité par classe`,
          note: {
            fr: `Malgré son nom, c'est un CLASSIFIEUR : elle prédit une probabilité d'appartenance à une classe. Le standard de la classification binaire linéaire — simple, calibré, interprétable. predict_proba donne la confiance, pas seulement l'étiquette : utile pour fixer un seuil métier.`,
            en: `Despite the name, it is a CLASSIFIER: it predicts a probability of belonging to a class. The standard for linear binary classification — simple, calibrated, interpretable. predict_proba gives confidence, not just the label: handy to set a business threshold.`,
          },
        },
        {
          id: 'py-ml-tree-forest',
          title: { fr: 'Arbres & Random Forest', en: 'Trees & Random Forest' },
          code: `from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
arbre = DecisionTreeClassifier(max_depth=4).fit(X, y)   # règles if/else
foret = RandomForestClassifier(n_estimators=200).fit(X, y)
print(foret.feature_importances_)      # variables les plus décisives`,
          note: {
            fr: `Un arbre découpe l'espace par seuils (si âge>30 et…) : lisible mais il surapprend vite. La forêt aléatoire moyenne des centaines d'arbres décorrélés : robuste, peu de réglages, excellent défaut sur données tabulaires. feature_importances_ explique le modèle.`,
            en: `A tree splits the space by thresholds (if age>30 and…): readable but it overfits fast. A random forest averages hundreds of decorrelated trees: robust, few knobs, an excellent default on tabular data. feature_importances_ explains the model.`,
          },
        },
        {
          id: 'py-ml-boosting',
          title: { fr: 'Gradient boosting (XGBoost)', en: 'Gradient boosting (XGBoost)' },
          code: `# pip install xgboost   (ou lightgbm)
from xgboost import XGBClassifier
model = XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=6)
model.fit(X_tr, y_tr)
print(model.score(X_te, y_te))`,
          note: {
            fr: `Construit les arbres en séquence, chacun corrigeant les erreurs du précédent. XGBoost/LightGBM dominent Kaggle sur données tabulaires — plus puissant que la forêt, mais sensible au réglage (learning_rate, profondeur) et au surapprentissage si on le laisse tourner.`,
            en: `Builds trees sequentially, each correcting the previous one's errors. XGBoost/LightGBM dominate Kaggle on tabular data — more powerful than a forest, but sensitive to tuning (learning_rate, depth) and to overfitting if left unchecked.`,
          },
        },
        {
          id: 'py-ml-knn',
          title: { fr: 'k plus proches voisins (kNN)', en: 'k-nearest neighbors (kNN)' },
          code: `from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=5).fit(X_tr, y_tr)
knn.predict(X_te[:1])     # classe = vote des 5 voisins les plus proches`,
          note: {
            fr: `Aucun apprentissage réel : il mémorise les données et classe un point par le vote de ses k voisins les plus proches. Intuitif et sans hypothèse, mais lent à prédire et gourmand en mémoire sur gros volumes. Exige des features standardisées (il calcule des distances).`,
            en: `No real training: it memorizes the data and classifies a point by the vote of its k nearest neighbors. Intuitive and assumption-free, but slow to predict and memory-hungry on large data. Requires standardized features (it computes distances).`,
          },
        },
        {
          id: 'py-ml-kmeans',
          title: { fr: 'k-means (non supervisé)', en: 'k-means (unsupervised)' },
          code: `from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, random_state=42).fit(X)   # aucun y !
km.labels_            # cluster attribué à chaque point
km.cluster_centers_  # centre de chaque groupe
km.predict([[1.0, 2.0]])   # cluster d'un point inédit`,
          note: {
            fr: `Apprentissage NON supervisé : aucune étiquette y, on cherche des groupes naturels (segmentation client, compression). On fixe k à l'avance (méthode du coude pour le choisir). Très sensible à l'échelle — standardisez les features d'abord.`,
            en: `UNsupervised learning: no labels y, you look for natural groups (customer segmentation, compression). You fix k in advance (elbow method to pick it). Very sensitive to scale — standardize features first.`,
          },
        },
        {
          id: 'py-ml-pipeline',
          title: { fr: 'Standardisation & Pipeline', en: 'Scaling & Pipeline' },
          code: `from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.svm import SVC
pipe = make_pipeline(StandardScaler(), SVC())   # scale PUIS modèle
pipe.fit(X_tr, y_tr)      # le scaler s'ajuste sur X_tr uniquement
pipe.score(X_te, y_te)`,
          note: {
            fr: `Beaucoup de modèles (SVM, kNN, régression régularisée) exigent des features à la même échelle. Le Pipeline enchaîne transformations + modèle en UN objet : le scaler apprend sur X_tr seul, ce qui évite la fuite de données (data leakage) depuis le jeu de test.`,
            en: `Many models (SVM, kNN, regularized regression) require features on the same scale. A Pipeline chains transforms + model into ONE object: the scaler learns on X_tr only, preventing data leakage from the test set.`,
          },
        },
        {
          id: 'py-ml-metrics',
          title: { fr: 'Métriques & validation croisée', en: 'Metrics & cross-validation' },
          code: `from sklearn.metrics import confusion_matrix, classification_report
print(confusion_matrix(y_te, preds))
print(classification_report(y_te, preds))   # précision, rappel, F1
from sklearn.model_selection import cross_val_score
cross_val_score(model, X, y, cv=5).mean()   # score moyen sur 5 plis`,
          note: {
            fr: `L'accuracy ment sur des classes déséquilibrées (99 % de « non-fraude »). Regardez précision (peu de faux positifs) vs rappel (peu de faux négatifs) selon le coût métier. La validation croisée (cv) donne un score bien plus fiable qu'un unique split.`,
            en: `Accuracy lies on imbalanced classes (99% "non-fraud"). Look at precision (few false positives) vs recall (few false negatives) depending on business cost. Cross-validation (cv) gives a far more reliable score than a single split.`,
          },
        },
        {
          id: 'py-ml-overfitting',
          title: { fr: 'Surapprentissage & régularisation', en: 'Overfitting & regularization' },
          code: `model.score(X_tr, y_tr)   # ex : 0.99
model.score(X_te, y_te)   # ex : 0.72  <- grand écart = overfit
from sklearn.linear_model import Ridge   # L2 : pénalise les gros poids
reg = Ridge(alpha=1.0).fit(X_tr, y_tr)`,
          note: {
            fr: `Un écart net train ≫ test signale le surapprentissage : le modèle a mémorisé le bruit. Remèdes : plus de données, moins de complexité (profondeur), ou régularisation (Ridge/L2, Lasso/L1) qui bride les poids. L'objectif est la généralisation, pas le score d'entraînement.`,
            en: `A clear train ≫ test gap signals overfitting: the model memorized noise. Fixes: more data, less complexity (depth), or regularization (Ridge/L2, Lasso/L1) that curbs the weights. The goal is generalization, not the training score.`,
          },
        },
        {
          id: 'py-ml-persist',
          title: { fr: 'Sauvegarder un modèle (MLOps)', en: 'Persisting a model (MLOps)' },
          code: `import joblib
joblib.dump(pipe, "modele.joblib")   # sérialise le pipeline entier
# --- en production ---
model = joblib.load("modele.joblib")
model.predict(X_new)                  # aucun ré-entraînement`,
          note: {
            fr: `Un modèle entraîné se sérialise avec joblib (plus efficace que pickle sur les gros tableaux NumPy). Versionnez le fichier ET les données d'entraînement : la reproductibilité est le fondement du MLOps. Sauver le pipeline embarque le préprocessing, évitant les décalages train/prod.`,
            en: `A trained model is serialized with joblib (more efficient than pickle on large NumPy arrays). Version the file AND the training data: reproducibility is the foundation of MLOps. Saving the pipeline bundles the preprocessing, avoiding train/prod skew.`,
          },
        },
      ],
    },
  ],
};
