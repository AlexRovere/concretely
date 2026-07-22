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
        {
          id: 'python-string-methods',
          title: { fr: 'Méthodes de string essentielles', en: 'Essential string methods' },
          code: `texte = "  Bonjour, Monde !  "
texte.strip()                      # "Bonjour, Monde !" — trim
texte.strip().split(", ")          # ['Bonjour', 'Monde !']
"-".join(["a", "b", "c"])          # "a-b-c"
texte.replace("Monde", "Ada")      # remplace toutes les occurrences`,
          note: {
            fr: `strip/split/join/replace couvrent 90% des manipulations de texte du quotidien : split découpe sur un séparateur, join est une méthode de STRING (pas de liste !) qui assemble un itérable. Aucune ne modifie la string en place (immuable).`,
            en: `strip/split/join/replace cover 90% of everyday text manipulation: split breaks on a separator, join is a STRING method (not a list one!) that assembles an iterable. None of them mutate the string in place (immutable).`,
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
            fr: `Comptage en une ligne au lieu d'une boucle + dict. most_common trie par fréquence, et les Counter s'additionnent entre eux (c1 + c2) — les clés dont le total est ≤ 0 sont alors supprimées, contrairement à un merge de dict classique.`,
            en: `Counting in one line instead of a loop + dict. most_common sorts by frequency, and Counters can be added together (c1 + c2) — keys whose total is ≤ 0 are then dropped, unlike a plain dict merge.`,
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
      id: 'errors',
      title: { fr: 'Erreurs & exceptions', en: 'Errors & exceptions' },
      items: [
        {
          id: 'py-try-except',
          title: { fr: 'try / except / else / finally', en: 'try / except / else / finally' },
          code: `try:
    x = int(saisie)
except ValueError as e:        # cible un type PRÉCIS
    print(f"pas un entier : {e}")
else:
    print("réussi")            # seulement si AUCUNE exception
finally:
    fichier.close()            # toujours exécuté (nettoyage)`,
          note: {
            fr: `except cible un type précis — jamais un except: nu. else ne tourne que si le try a réussi : il sépare le code « à risque » du code « en cas de succès ». finally s'exécute quoi qu'il arrive, même après un return : idéal pour libérer une ressource.`,
            en: `except targets a precise type — never a bare except:. else runs only if the try succeeded: it separates the "risky" code from the "on success" code. finally runs no matter what, even after a return: ideal to release a resource.`,
          },
        },
        {
          id: 'py-raise',
          title: { fr: 'raise & exception personnalisée', en: 'raise & custom exception' },
          code: `class SoldeInsuffisant(Exception):     # hérite d'Exception
    def __init__(self, manque):
        super().__init__(f"il manque {manque} €")
        self.manque = manque              # donnée exploitable
def retirer(solde, montant):
    if montant > solde:
        raise SoldeInsuffisant(montant - solde)`,
          note: {
            fr: `Définir ses propres exceptions (une classe qui hérite d'Exception) rend les erreurs métier attrapables précisément par l'appelant. Attachez des données utiles (self.manque) pour que le except puisse réagir, pas seulement logger un message.`,
            en: `Defining your own exceptions (a class inheriting from Exception) makes domain errors precisely catchable by the caller. Attach useful data (self.manque) so the except can react, not just log a message.`,
          },
        },
        {
          id: 'py-raise-from',
          title: { fr: 'raise ... from (chaînage)', en: 'raise ... from (chaining)' },
          code: `try:
    cfg = json.loads(brut)
except json.JSONDecodeError as e:
    raise ConfigInvalide("config illisible") from e   # garde la cause
# le traceback montre les DEUX erreurs, reliées par
# « The above exception was the direct cause of… »`,
          note: {
            fr: `raise NouvelleErreur from e remonte une erreur de haut niveau tout en gardant la cause d'origine dans le traceback — indispensable pour déboguer. Sans from, la cause réelle est masquée ; from None supprime volontairement la chaîne.`,
            en: `raise NewError from e surfaces a high-level error while keeping the original cause in the traceback — essential for debugging. Without from, the real cause is hidden; from None deliberately suppresses the chain.`,
          },
        },
        {
          id: 'py-eafp',
          title: { fr: 'EAFP > LBYL', en: 'EAFP > LBYL' },
          code: `# LBYL — Look Before You Leap (verbeux, sujet aux races)
if "cle" in d and d["cle"] is not None:
    v = d["cle"]
# EAFP — Easier to Ask Forgiveness (pythonique)
try:
    v = d["cle"]
except KeyError:
    v = defaut`,
          note: {
            fr: `L'idiome Python privilégie EAFP : tenter l'opération et rattraper l'échec, plutôt que d'empiler les vérifications préalables (LBYL) qui restent sujettes aux conditions de course. Un try qui réussit ne coûte quasiment rien à l'exécution.`,
            en: `The Python idiom favors EAFP: attempt the operation and catch the failure, rather than piling up prior checks (LBYL) that remain race-prone. A try that succeeds costs almost nothing at runtime.`,
          },
        },
        {
          id: 'py-except-swallow',
          title: { fr: 'Ne pas avaler les erreurs', en: "Don't swallow errors" },
          code: `try:
    risque()
except Exception:          # trop large : masque tout
    pass                   # ERREUR silencieuse, bug invisible
# --- correct : cibler, journaliser, re-lever ---
try:
    risque()
except (IOError, TimeoutError) as e:
    logger.warning("échec réseau", exc_info=e)
    raise                  # re-lève si on ne sait pas gérer`,
          note: {
            fr: `except Exception: pass fait disparaître les bugs — le pire réflexe. Attrapez le type le plus précis possible, journalisez (exc_info), et re-levez (raise nu) si vous ne pouvez pas vraiment traiter l'erreur. Ne jamais avaler KeyboardInterrupt ni SystemExit.`,
            en: `except Exception: pass makes bugs vanish — the worst reflex. Catch the most precise type possible, log it (exc_info), and re-raise (bare raise) if you cannot genuinely handle the error. Never swallow KeyboardInterrupt or SystemExit.`,
          },
        },
        {
          id: 'py-except-star',
          title: { fr: 'Groupes except* (3.11)', en: 'Exception groups except* (3.11)' },
          code: `try:
    async with asyncio.TaskGroup() as tg:   # tâches concurrentes
        tg.create_task(a())
        tg.create_task(b())
except* ValueError as eg:      # attrape TOUS les ValueError du groupe
    print(eg.exceptions)
except* TypeError as eg:
    ...`,
          note: {
            fr: `Depuis 3.11, plusieurs erreurs peuvent survenir en même temps (tâches concurrentes) : ExceptionGroup les regroupe et except* en attrape un sous-ensemble par type, sans perdre les autres. À réserver au code concurrent (TaskGroup, asyncio).`,
            en: `Since 3.11, several errors can occur at once (concurrent tasks): ExceptionGroup bundles them and except* catches a subset by type without losing the others. Reserve it for concurrent code (TaskGroup, asyncio).`,
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
        {
          id: 'py-functools',
          title: { fr: 'functools : cache, partial, reduce', en: 'functools: cache, partial, reduce' },
          code: `from functools import lru_cache, partial, reduce
@lru_cache(maxsize=None)          # mémoïse les appels (ou @cache 3.9+)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
en_binaire = partial(int, base=2)  # fige un argument
produit = reduce(lambda a, b: a * b, [1, 2, 3, 4])  # 24`,
          note: {
            fr: `@lru_cache mémorise les résultats : un fib récursif passe d'exponentiel à linéaire sans réécriture. partial pré-remplit des arguments pour dériver une variante d'une fonction. reduce cumule une séquence en une valeur — mais une boucle est souvent plus lisible.`,
            en: `@lru_cache memoizes results: a recursive fib goes from exponential to linear with no rewrite. partial pre-fills arguments to derive a variant of a function. reduce folds a sequence into one value — but a loop is often more readable.`,
          },
        },
        {
          id: 'py-logging',
          title: { fr: 'logging (pas print)', en: 'logging (not print)' },
          code: `import logging
logger = logging.getLogger(__name__)   # un logger par module
logging.basicConfig(level=logging.INFO)
logger.info("démarrage %s", version)   # %s : formaté SI émis
logger.warning("disque à %d%%", 92)
logger.exception("échec")              # dans un except : + traceback`,
          note: {
            fr: `print n'a ni niveau, ni horodatage, ni destination configurable — logging si. Un logger nommé par module (__name__) permet de filtrer par source. Passez les variables en arguments (%s), pas en f-string : le formatage n'a lieu que si le message est réellement émis.`,
            en: `print has no level, timestamp, or configurable destination — logging does. A per-module named logger (__name__) lets you filter by source. Pass variables as arguments (%s), not as an f-string: formatting happens only if the message is actually emitted.`,
          },
        },
        {
          id: 'py-re',
          title: { fr: 're — expressions régulières', en: 're — regular expressions' },
          code: `import re
m = re.search(r"(\\d{4})-(\\d{2})", "le 2026-07")  # r"" = raw string
if m:
    print(m.group(1), m.group(2))     # 2026 07
re.findall(r"\\w+@\\w+", texte)         # toutes les occurrences
motif = re.compile(r"^ERROR", re.M)   # compilé = réutilisable`,
          note: {
            fr: `Toujours des raw strings r"..." pour que les séquences comme \\d ou \\w ne soient pas interprétées par Python. search trouve la 1re occurrence, findall toutes, sub remplace. Pré-compilez (re.compile) un motif réutilisé en boucle ; les groupes (...) capturent des sous-parties.`,
            en: `Always raw strings r"..." so sequences like \\d or \\w aren't interpreted by Python. search finds the 1st match, findall all of them, sub replaces. Pre-compile (re.compile) a pattern reused in a loop; groups (...) capture sub-parts.`,
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
        {
          id: 'python-mocking',
          title: { fr: 'Mocker avec unittest.mock & monkeypatch', en: 'Mocking with unittest.mock & monkeypatch' },
          code: `from unittest.mock import patch

def test_envoi_email(monkeypatch):
    appels = []
    monkeypatch.setattr("app.smtp.envoyer", lambda to, msg: appels.append(to))
    notifier("ada@ex.com")
    assert appels == ["ada@ex.com"]`,
          note: {
            fr: `monkeypatch (fixture pytest) remplace un attribut le temps du test et le restaure automatiquement après ; unittest.mock.patch fait pareil en dehors de pytest. Ne mockez que les frontières externes (réseau, disque, horloge), pas votre propre logique.`,
            en: `monkeypatch (a pytest fixture) replaces an attribute for the test's duration and restores it automatically afterwards; unittest.mock.patch does the same outside pytest. Only mock external boundaries (network, disk, clock), never your own logic.`,
          },
        },
        {
          id: 'python-typing-advanced',
          title: { fr: 'Typing avancé : TypeVar, Generic, TypedDict', en: 'Advanced typing: TypeVar, Generic, TypedDict' },
          code: `from typing import TypeVar, Generic, TypedDict

T = TypeVar("T")
class Pile(Generic[T]):             # classe générique classique
    def __init__(self) -> None:
        self._items: list[T] = []
    def empiler(self, item: T) -> None:
        self._items.append(item)

class Utilisateur(TypedDict):       # dict à structure typée et vérifiée
    nom: str
    age: int`,
          note: {
            fr: `TypeVar + Generic permettent d'écrire une classe/fonction qui garde la cohérence de type interne (Pile[int] reste une pile d'int) ; TypedDict type un dict dont les clés sont fixes, utile pour des payloads JSON. Depuis 3.12, def f[T](x: T) -> T: est un raccourci pour le même TypeVar.`,
            en: `TypeVar + Generic let you write a class/function that keeps internal type consistency (Pile[int] stays a stack of ints); TypedDict types a dict with fixed keys, handy for JSON payloads. Since 3.12, def f[T](x: T) -> T: is shorthand for the same TypeVar.`,
          },
        },
        {
          id: 'python-pyproject-toml',
          title: { fr: 'pyproject.toml : le manifeste moderne', en: 'pyproject.toml: the modern manifest' },
          code: `# pyproject.toml
[project]
name = "mon-projet"
version = "0.1.0"
dependencies = ["requests>=2.31", "pydantic>=2.0"]

[tool.ruff]
line-length = 100`,
          note: {
            fr: `pyproject.toml centralise dépendances, métadonnées et config des outils (ruff, mypy, pytest) dans un seul fichier standardisé (PEP 621), remplaçant setup.py/setup.cfg éparpillés. uv/poetry en génèrent un lockfile associé.`,
            en: `pyproject.toml centralizes dependencies, metadata and tool config (ruff, mypy, pytest) in one standardized file (PEP 621), replacing scattered setup.py/setup.cfg. uv/poetry generate an associated lockfile from it.`,
          },
        },
      ],
    },
    {
      id: 'async',
      title: { fr: 'Asynchrone (asyncio)', en: 'Async (asyncio)' },
      items: [
        {
          id: 'py-async-await',
          title: { fr: 'async def & await', en: 'async def & await' },
          code: `import asyncio
async def fetch(n):
    await asyncio.sleep(1)     # cède la main pendant l'attente I/O
    return n * 2
async def main():
    print(await fetch(21))     # 42
asyncio.run(main())            # LE point d'entrée, une seule fois`,
          note: {
            fr: `async def crée une coroutine ; await la suspend et rend la main à la boucle d'événements pendant une opération I/O (réseau, disque) au lieu de bloquer le thread. asyncio.run() démarre la boucle — un seul appel, à la racine du programme.`,
            en: `async def creates a coroutine; await suspends it and yields control to the event loop during an I/O operation (network, disk) instead of blocking the thread. asyncio.run() starts the loop — one call, at the program's root.`,
          },
        },
        {
          id: 'py-asyncio-gather',
          title: { fr: 'gather : concurrence', en: 'gather: concurrency' },
          code: `async def main():
    # séquentiel : 3 s  |  concurrent : ~1 s
    r = await asyncio.gather(fetch(1), fetch(2), fetch(3))
    print(r)                   # [2, 4, 6] — ordre des arguments
asyncio.run(main())`,
          note: {
            fr: `gather lance plusieurs coroutines EN MÊME TEMPS et attend qu'elles finissent toutes — c'est là qu'asyncio gagne : 100 requêtes réseau en parallèle sur un seul thread. L'ordre des résultats suit celui des arguments, pas l'ordre d'arrivée.`,
            en: `gather starts several coroutines AT ONCE and waits for them all — this is where asyncio wins: 100 network requests in parallel on a single thread. The result order follows the argument order, not the completion order.`,
          },
        },
        {
          id: 'py-async-task',
          title: { fr: 'create_task & TaskGroup', en: 'create_task & TaskGroup' },
          code: `async def main():
    async with asyncio.TaskGroup() as tg:   # 3.11+
        t1 = tg.create_task(fetch(1))       # démarre en arrière-plan
        t2 = tg.create_task(fetch(2))
    # à la sortie du bloc, les deux sont terminées
    print(t1.result(), t2.result())`,
          note: {
            fr: `create_task planifie une coroutine immédiatement, sans l'attendre. TaskGroup (3.11) est l'idiome moderne : il attend toutes les tâches à la sortie du async with et annule les autres si l'une échoue — plus sûr que gather pour la propagation d'erreurs.`,
            en: `create_task schedules a coroutine immediately, without awaiting it. TaskGroup (3.11) is the modern idiom: it awaits all tasks when the async with exits and cancels the rest if one fails — safer than gather for error propagation.`,
          },
        },
        {
          id: 'py-async-with-for',
          title: { fr: 'async with / async for', en: 'async with / async for' },
          code: `async def lire(url):
    async with session.get(url) as resp:   # ouverture/fermeture async
        async for ligne in resp.content:   # flux produit à la demande
            traiter(ligne)
async def borne():
    async with asyncio.timeout(5):         # 3.11 : borne le temps
        await lente()`,
          note: {
            fr: `async with gère des ressources dont l'ouverture/fermeture est elle-même asynchrone (connexions HTTP, pools DB) ; async for itère un flux produit à la demande (streaming, websocket). asyncio.timeout impose une limite de temps sans threads.`,
            en: `async with manages resources whose open/close is itself async (HTTP connections, DB pools); async for iterates a stream produced on demand (streaming, websocket). asyncio.timeout enforces a time limit without threads.`,
          },
        },
        {
          id: 'py-async-blocking',
          title: { fr: 'Le piège bloquant', en: 'The blocking trap' },
          code: `async def mauvais():
    time.sleep(3)              # BLOQUE toute la boucle : tout gèle
async def bon():
    await asyncio.sleep(3)                     # cède la main
    r = await asyncio.to_thread(calcul_lourd)  # décharge le CPU-bound`,
          note: {
            fr: `Un seul appel bloquant (time.sleep, requests.get, gros calcul) gèle TOUTE la boucle d'événements et anéantit l'intérêt d'asyncio. Utilisez les équivalents async (asyncio.sleep, httpx/aiohttp) ou asyncio.to_thread pour le code bloquant ou CPU-bound.`,
            en: `A single blocking call (time.sleep, requests.get, heavy computation) freezes the WHOLE event loop and defeats the point of asyncio. Use the async equivalents (asyncio.sleep, httpx/aiohttp) or asyncio.to_thread for blocking or CPU-bound code.`,
          },
        },
        {
          id: 'python-threading-gil',
          title: { fr: 'GIL & threading', en: 'GIL & threading' },
          code: `import threading

def telecharger(url, resultats, i):
    resultats[i] = requests.get(url).content   # I/O : libère le GIL

fils = [threading.Thread(target=telecharger, args=(u, resultats, i))
        for i, u in enumerate(urls)]
[f.start() for f in fils]
[f.join() for f in fils]`,
          note: {
            fr: `Le GIL (Global Interpreter Lock) empêche deux threads Python d'exécuter du bytecode EN MÊME TEMPS : threading n'accélère donc que l'I/O-bound (le GIL est relâché pendant un appel réseau/disque), jamais le calcul pur.`,
            en: `The GIL (Global Interpreter Lock) prevents two Python threads from running bytecode AT THE SAME TIME: threading therefore only speeds up I/O-bound work (the GIL is released during a network/disk call), never pure computation.`,
          },
        },
        {
          id: 'python-multiprocessing',
          title: { fr: 'multiprocessing pour le CPU-bound', en: 'multiprocessing for CPU-bound work' },
          code: `from multiprocessing import Pool

def carre(n):
    return n * n

with Pool(processes=4) as pool:
    resultats = pool.map(carre, range(1_000_000))  # vrai parallélisme`,
          note: {
            fr: `Chaque processus a son propre interpréteur et son propre GIL : multiprocessing contourne la limite pour du calcul intensif, au prix d'un coût mémoire/IPC plus élevé que threading.`,
            en: `Each process has its own interpreter and its own GIL: multiprocessing sidesteps the limit for CPU-intensive work, at the cost of higher memory/IPC overhead than threading.`,
          },
        },
      ],
    },
    {
      id: 'python-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'python-bp-main-guard',
          title: { fr: 'Garde if __name__', en: 'The __main__ guard' },
          code: `def main():
    print("démarrage de l'app")

if __name__ == "__main__":
    main()`,
          note: {
            fr: `Empêche le code d'entrée de s'exécuter à l'import du module (tests, réutilisation) : sans cette garde, importer le fichier ailleurs relance tout le script.`,
            en: `Prevents entry-point code from running on import (tests, reuse): without this guard, importing the file elsewhere reruns the whole script.`,
          },
        },
        {
          id: 'python-bp-no-assert-validation',
          title: { fr: "assert n'est pas de la validation", en: 'assert is not validation' },
          code: `def retirer(solde, montant):
    if montant > solde:          # validation réelle
        raise ValueError("solde insuffisant")
    return solde - montant`,
          note: {
            fr: `python -O supprime tous les assert à l'exécution : les utiliser pour valider une entrée utilisateur ou une règle métier crée un trou de sécurité silencieux. Réservez assert aux invariants internes et aux tests.`,
            en: `python -O strips every assert at runtime: using them to validate user input or a business rule creates a silent security hole. Reserve assert for internal invariants and tests.`,
          },
        },
        {
          id: 'python-bp-pin-lockfile',
          title: { fr: 'Verrouiller les dépendances', en: 'Pin dependencies with a lockfile' },
          code: `uv lock                  # ou : poetry lock
uv pip sync uv.lock       # installation reproductible en CI`,
          note: {
            fr: `requirements.txt seul ne fige pas les sous-dépendances : un lockfile (uv.lock, poetry.lock) garantit que CI et prod installent EXACTEMENT les mêmes versions, évitant les "ça marche chez moi".`,
            en: `requirements.txt alone doesn't pin sub-dependencies: a lockfile (uv.lock, poetry.lock) guarantees CI and prod install the EXACT same versions, avoiding "works on my machine".`,
          },
        },
        {
          id: 'python-bp-no-wildcard-import',
          title: { fr: "Pas d'import wildcard", en: 'No wildcard imports' },
          code: `from math import sqrt, pi   # explicite, traçable
# from math import *        # à éviter : pollue le namespace`,
          note: {
            fr: `from module import * masque l'origine des noms, casse l'autocomplétion et peut silencieusement écraser des noms existants. Importez explicitement ce dont vous avez besoin.`,
            en: `from module import * hides where names come from, breaks autocomplete and can silently shadow existing names. Import explicitly what you need.`,
          },
        },
        {
          id: 'python-bp-docstring-public-api',
          title: { fr: 'Documenter les fonctions publiques', en: 'Document public functions' },
          code: `def moyenne(notes: list[float]) -> float:
    """Calcule la moyenne arithmétique d'une liste de notes non vide."""
    return sum(notes) / len(notes)`,
          note: {
            fr: `Une docstring + des type hints valent une signature auto-documentée : IDE, pydoc et mypy n'ont pas besoin de lire le corps de la fonction pour l'utiliser correctement.`,
            en: `A docstring + type hints amount to a self-documenting signature: IDEs, pydoc and mypy don't need to read the body to use it correctly.`,
          },
        },
      ],
    },
  ],
};
