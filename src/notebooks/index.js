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

Ajuster une droite \`y = a·x + b\` qui minimise l'erreur quadratique. On génère
des données bruitées, on entraîne un modèle scikit-learn, puis on visualise.`,
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

\`.fit(X, y)\` apprend la pente et l'ordonnée qui collent le mieux aux points.`,
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

La droite ajustée (en rouge) épouse le nuage de points.`,
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

Manipuler des tableaux (\`numpy\`) et des tables (\`pandas\`). Comme dans Jupyter,
la **dernière expression** d'une cellule s'affiche — un DataFrame devient une table.`,
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

\`groupby\` résume par clé (le GROUP BY de SQL, en une ligne).`,
    },
    {
      type: 'code',
      source: `df.groupby("ville").agg(total=("ventes", "sum"), n=("ventes", "count"))`,
    },
    {
      type: 'markdown',
      source: `## NumPy vectorisé & colonne dérivée`,
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

Regrouper des points **non étiquetés** en \`k\` clusters, puis visualiser.`,
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

Chaque point coloré par son cluster ; les ✕ rouges sont les centroïdes.`,
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

Entraîner un classifieur, puis lire ses métriques (précision, rappel, F1).`,
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

L'accuracy seule ment sur des classes déséquilibrées — regarde précision vs rappel.`,
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
