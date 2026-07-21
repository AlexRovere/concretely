/**
 * Modèle et contenu des notebooks ML (Pyodide). Un notebook :
 *   { id, title:{fr,en}, cells:[{ type:'code'|'markdown', source }] }
 * Les cellules code s'exécutent dans un kernel à état persistant ; les cellules
 * markdown sont rendues par `renderMarkdown`. numpy/pandas/matplotlib/sklearn
 * sont chargés à la demande au premier `import`.
 *
 * N1 fournit « Régression linéaire » + un scratch ; les autres notebooks
 * (NumPy & pandas, K-means, Classification & métriques) arrivent en N3.
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

export const NOTEBOOKS = [regression, scratch];

export const notebookById = (id) => NOTEBOOKS.find((nb) => nb.id === id) ?? null;
