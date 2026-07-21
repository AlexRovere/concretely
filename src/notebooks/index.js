/**
 * Modèle et contenu des notebooks ML (Pyodide). Un notebook :
 *   { id, title:{fr,en}, cells:[{ type:'code'|'markdown', source }] }
 * Les cellules code s'exécutent dans un kernel à état persistant ; les cellules
 * markdown sont rendues par `renderMarkdown`. numpy/pandas/matplotlib/sklearn
 * sont chargés à la demande au premier `import`.
 *
 * Notebooks livrés : NumPy & pandas, Régression linéaire, K-means,
 * Classification & métriques, + un scratch vierge.
 */

const CELL_TYPES = new Set(['code', 'markdown']);

/** Valide la forme d'un notebook (pur, testable). */
export function isValidNotebook(nb) {
  if (!nb || typeof nb.id !== 'string' || !nb.id) return false;
  if (!nb.title || !nb.title.fr || !nb.title.en) return false;
  if (!Array.isArray(nb.cells) || nb.cells.length === 0) return false;
  return nb.cells.every(
    (c) => c && CELL_TYPES.has(c.type) && typeof c.source === 'string' && (c.type !== 'code' || c.source.trim().length > 0),
  );
}

const regression = {
  id: 'regression',
  title: { fr: 'Régression linéaire', en: 'Linear regression' },
  cells: [
    {
      type: 'markdown',
      source: `# Régression linéaire

**Le problème.** Prédire une valeur *continue* (prix, température…) à partir d'une
variable, en ajustant la droite \`y = a·x + b\` qui passe « au mieux » dans le nuage.

**L'idée.** « Au mieux » = celle qui minimise la somme des écarts au carré entre les
points et la droite (moindres carrés). C'est la **baseline** à battre avant tout
modèle plus complexe : rapide, interprétable, sans réglage.

Ci-dessous on fabrique des données bruitées autour d'une vraie tendance, puis on
laisse scikit-learn *retrouver* la droite.`,
    },
    {
      type: 'code',
      source: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
X = rng.uniform(0, 10, size=(40, 1))
y = 2.5 * X.ravel() + 4 + rng.normal(0, 2, size=40)
X[:3].ravel(), y[:3]`,
    },
    {
      type: 'markdown',
      source: `## Entraînement

\`.fit(X, y)\` calcule la pente \`a\` (\`coef_\`) et l'ordonnée \`b\` (\`intercept_\`).

**À observer.** La pente ≈ **2.5** et l'ordonnée ≈ **4** : le modèle *retrouve* la loi
qu'on a utilisée pour générer les données. Le **R²** (entre 0 et 1) mesure la part de
variance expliquée — proche de 1 = la droite colle bien.

**Piège.** Ici on lit le R² sur les mêmes données que l'entraînement. Sur un vrai
projet, évalue toujours sur des données *mises de côté* (train/test) : un R²
d'entraînement flatteur ne garantit rien sur des données neuves.`,
    },
    {
      type: 'code',
      source: `reg = LinearRegression().fit(X, y)
print("pente     :", round(reg.coef_[0], 2))
print("ordonnée  :", round(reg.intercept_, 2))
print("R²        :", round(reg.score(X, y), 3))`,
    },
    {
      type: 'markdown',
      source: `## Visualisation

On trace la droite apprise (rouge) par-dessus le nuage.

**À observer.** Elle passe au centre du nuage, pas par tous les points : le bruit est
*irréductible*. Un bon modèle capture la **tendance**, pas chaque point — vouloir tout
traverser, ce serait du surapprentissage.`,
    },
    {
      type: 'code',
      source: `xs = np.linspace(0, 10, 100).reshape(-1, 1)
plt.figure(figsize=(5, 3.2))
plt.scatter(X, y, s=18, label="données")
plt.plot(xs, reg.predict(xs), color="crimson", label="modèle")
plt.legend(); plt.xlabel("x"); plt.ylabel("y")
plt.title("Régression linéaire")
plt.show()`,
    },
  ],
};

const numpyPandas = {
  id: 'numpy-pandas',
  title: { fr: 'NumPy & pandas', en: 'NumPy & pandas' },
  cells: [
    {
      type: 'markdown',
      source: `# NumPy & pandas

Avant tout modèle, il faut **manipuler les données**. Deux outils :

- **NumPy** — des tableaux numériques rapides (calcul *vectorisé*, sans boucle Python) ;
- **pandas** — des *tables* étiquetées (colonnes nommées), le format de travail de la data.

Comme dans Jupyter, la **dernière expression** d'une cellule s'affiche : un DataFrame
devient une vraie table.`,
    },
    {
      type: 'code',
      source: `import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
df = pd.DataFrame({
    "ville": ["Paris", "Lyon", "Paris", "Lyon", "Nice"],
    "ventes": rng.integers(5, 20, 5),
    "retours": rng.integers(0, 4, 5),
})
df`,
    },
    {
      type: 'markdown',
      source: `## Agrégation

\`groupby("clé")\` découpe la table par valeur, puis \`agg\` applique une fonction par
groupe — le \`GROUP BY\` de SQL, en une ligne.

**À observer.** On passe de lignes brutes à un **résumé par ville** (total, nombre).
C'est la brique de tout reporting et de la création de *features* agrégées.`,
    },
    {
      type: 'code',
      source: `df.groupby("ville").agg(total=("ventes", "sum"), n=("ventes", "count"))`,
    },
    {
      type: 'markdown',
      source: `## NumPy vectorisé & colonne dérivée

**À observer.** \`a ** 2\` élève au carré *tout le tableau d'un coup*, sans boucle —
c'est la vectorisation (10 à 100× plus rapide en vrai). Et \`df["net"] = …\` crée une
**colonne dérivée** par une opération entre colonnes.

**Piège.** Les vraies données ont des **valeurs manquantes** (NaN) et des colonnes
texte à encoder avant d'entraîner : on ne donne jamais un DataFrame brut à \`.fit()\`.`,
    },
    {
      type: 'code',
      source: `a = np.arange(10)
print("carrés  :", (a ** 2)[:5])
print("moyenne :", a.mean())
df["net"] = df["ventes"] - df["retours"]
df`,
    },
  ],
};

const kmeans = {
  id: 'kmeans',
  title: { fr: 'K-means', en: 'K-means' },
  cells: [
    {
      type: 'markdown',
      source: `# K-means

**Le problème.** Apprentissage **non supervisé** : on n'a *aucune étiquette*, on
cherche des groupes naturels dans les données (segmentation client, compression…).

**L'idée.** On fixe \`k\` (le nombre de groupes), puis l'algo alterne deux étapes :
affecter chaque point au centroïde le plus proche, puis déplacer chaque centroïde au
centre de son groupe — jusqu'à convergence.`,
    },
    {
      type: 'code',
      source: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans

rng = np.random.default_rng(1)
X = np.vstack([rng.normal(m, 0.5, (40, 2)) for m in ([0, 0], [3, 3], [0, 3])])
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
km.cluster_centers_.round(2)`,
    },
    {
      type: 'markdown',
      source: `## Visualisation des clusters

**À observer.** Les couleurs (clusters trouvés *sans* étiquettes) épousent bien les
trois paquets qu'on a générés : l'algo a retrouvé la structure. Les ✕ rouges sont les
centroïdes finaux.

**Piège.** Il faut choisir \`k\` à l'avance (ici 3 ; en vrai : méthode du coude). Et
k-means suppose des clusters ~sphériques de taille comparable, et il est sensible à
l'échelle des variables → **standardise** avant.`,
    },
    {
      type: 'code',
      source: `plt.figure(figsize=(4.5, 4))
plt.scatter(X[:, 0], X[:, 1], c=km.labels_, cmap="viridis", s=18)
plt.scatter(km.cluster_centers_[:, 0], km.cluster_centers_[:, 1], c="red", marker="X", s=120)
plt.title("K-means — 3 clusters")
plt.show()`,
    },
  ],
};

const classification = {
  id: 'classification',
  title: { fr: 'Classification & métriques', en: 'Classification & metrics' },
  cells: [
    {
      type: 'markdown',
      source: `# Classification & métriques

**Le problème.** Prédire une **classe** (0/1, spam/ok) plutôt qu'une valeur continue.
La régression logistique est le classifieur linéaire de référence.

**L'enjeu : bien mesurer.** On entraîne sur une partie des données, on évalue sur une
partie *mise de côté* (\`train_test_split\`) — sinon on juge le modèle sur ce qu'il a
déjà vu, et le score ne veut rien dire.`,
    },
    {
      type: 'code',
      source: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

X, y = make_classification(n_samples=200, n_features=4, n_informative=3, n_redundant=1, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
clf = LogisticRegression().fit(X_tr, y_tr)
print("accuracy :", round(clf.score(X_te, y_te), 3))`,
    },
    {
      type: 'markdown',
      source: `## Rapport & matrice de confusion

**À observer.**

- **précision** — parmi les « positifs » prédits, combien sont justes (peu de fausses alertes) ;
- **rappel** — parmi les vrais positifs, combien sont attrapés (peu d'oublis) ;
- **F1** — la moyenne harmonique des deux ;
- la **matrice de confusion** croise vrai vs prédit : la diagonale = les bons.

**Piège.** L'**accuracy** seule ment sur des classes déséquilibrées (99 % de
« non-fraude » → 99 % d'accuracy en prédisant toujours « non »). Selon le coût métier,
privilégie précision *ou* rappel.`,
    },
    {
      type: 'code',
      source: `pred = clf.predict(X_te)
print(classification_report(y_te, pred))
print("matrice de confusion :")
print(confusion_matrix(y_te, pred))`,
    },
  ],
};

const scratch = {
  id: 'scratch',
  title: { fr: 'Vierge', en: 'Scratch' },
  cells: [
    {
      type: 'markdown',
      source: `# Notebook vierge

Écris du Python ici. \`numpy\`, \`pandas\`, \`matplotlib\` et \`scikit-learn\` se
chargent automatiquement au premier \`import\`.`,
    },
    {
      type: 'code',
      source: `print("Prêt !")`,
    },
  ],
};

export const NOTEBOOKS = [numpyPandas, regression, kmeans, classification, scratch];

export const notebookById = (id) => NOTEBOOKS.find((nb) => nb.id === id) ?? null;
