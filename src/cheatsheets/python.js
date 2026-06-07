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
  ],
};
