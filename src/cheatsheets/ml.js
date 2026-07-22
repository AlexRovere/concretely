/**
 * Cheatsheet ML — NumPy/pandas pour la donnée, puis le workflow scikit-learn
 * (évaluation, modèles supervisés, ensembles/non-supervisé, MLOps).
 */
export default {
  id: 'ml',
  lang: 'python',
  sections: [
    {
      id: 'numpy',
      title: { fr: 'NumPy', en: 'NumPy' },
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
      ],
    },
    {
      id: 'pandas',
      title: { fr: 'pandas', en: 'pandas' },
      items: [
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
      id: 'ml-eval',
      title: { fr: 'Workflow & évaluation', en: 'Workflow & evaluation' },
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
          id: 'py-ml-crossval',
          title: { fr: 'Validation croisée', en: 'Cross-validation' },
          code: `from sklearn.model_selection import cross_val_score, StratifiedKFold
scores = cross_val_score(model, X, y, cv=5, scoring="f1")
print(scores.mean(), scores.std())   # score moyen ± écart-type
# StratifiedKFold garde la proportion des classes dans chaque pli`,
          note: {
            fr: `Un seul split train/test dépend de la chance du tirage. La validation croisée entraîne k fois sur k découpages différents et moyenne les scores — estimation bien plus fiable, surtout sur petit jeu. StratifiedKFold préserve l'équilibre des classes.`,
            en: `A single train/test split depends on the luck of the draw. Cross-validation trains k times on k different folds and averages the scores — a far more reliable estimate, especially on small data. StratifiedKFold preserves class balance.`,
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
      ],
    },
    {
      id: 'ml-sup',
      title: { fr: 'Modèles supervisés', en: 'Supervised models' },
      items: [
        {
          id: 'py-ml-linear',
          title: { fr: 'Régression linéaire', en: 'Linear regression' },
          code: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
reg = LinearRegression().fit(X_tr, y_tr)  # y continu : prix, température…
print(reg.coef_, reg.intercept_)          # poids appris, interprétables
print(r2_score(y_te, reg.predict(X_te)))  # sur X_te : 1.0 = ajustement parfait`,
          note: {
            fr: `Prédire une valeur continue en ajustant un hyperplan (y = w·x + b, une droite en 1D) qui minimise l'erreur quadratique. Rapide, interprétable (chaque coefficient = impact d'une variable) : c'est la baseline à battre avant tout modèle plus complexe. Comme pour tout modèle, r2_score s'évalue sur des données jamais vues (X_te) — jamais sur les données d'entraînement.`,
            en: `Predict a continuous value by fitting a hyperplane (y = w·x + b, a line in 1D) that minimizes squared error. Fast, interpretable (each coefficient = a variable's impact): it is the baseline to beat before any fancier model. As with any model, r2_score must be evaluated on unseen data (X_te) — never on the training data.`,
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
          id: 'py-ml-svm',
          title: { fr: 'SVM (marges maximales)', en: 'SVM (max-margin)' },
          code: `from sklearn.svm import SVC
clf = SVC(kernel="rbf", C=1.0, gamma="scale").fit(X_tr, y_tr)
clf.support_vectors_          # points qui définissent la frontière
# kernel="linear" : frontière droite ; "rbf" : non-linéaire`,
          note: {
            fr: `Le SVM cherche la frontière qui maximise la marge entre classes ; seuls les points proches (vecteurs de support) comptent. Le kernel RBF gère le non-linéaire. Puissant en dimension moyenne, mais exige des features standardisées et coûte cher sur gros volumes.`,
            en: `An SVM finds the boundary that maximizes the margin between classes; only the nearby points (support vectors) matter. The RBF kernel handles non-linearity. Powerful on medium-sized data, but requires standardized features and scales poorly to large volumes.`,
          },
        },
      ],
    },
    {
      id: 'ml-ens',
      title: { fr: 'Ensembles & non-supervisé', en: 'Ensembles & unsupervised' },
      items: [
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
      ],
    },
    {
      id: 'ml-ops',
      title: { fr: 'MLOps & préparation', en: 'MLOps & prep' },
      items: [
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
        {
          id: 'py-ml-gridsearch',
          title: { fr: 'GridSearchCV (hyperparamètres)', en: 'GridSearchCV (hyperparameters)' },
          code: `from sklearn.model_selection import GridSearchCV
grid = {"n_estimators": [100, 300], "max_depth": [4, 8, None]}
search = GridSearchCV(RandomForestClassifier(), grid, cv=5)
search.fit(X_tr, y_tr)
print(search.best_params_, search.best_score_)`,
          note: {
            fr: `Les hyperparamètres (profondeur, learning_rate…) ne s'apprennent pas : on les cherche. GridSearchCV teste toutes les combinaisons par validation croisée et retient la meilleure. La combinatoire explose vite — préférez RandomizedSearchCV au-delà de quelques axes.`,
            en: `Hyperparameters (depth, learning_rate…) aren't learned: you search for them. GridSearchCV tries every combination via cross-validation and keeps the best. The combinatorics explode fast — prefer RandomizedSearchCV beyond a few axes.`,
          },
        },
        {
          id: 'py-ml-encoding',
          title: { fr: 'Encodage catégoriel', en: 'Categorical encoding' },
          code: `from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
pre = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["ville"]),
], remainder="passthrough")
X_enc = pre.fit_transform(df)   # "ville" -> colonnes 0/1`,
          note: {
            fr: `Les modèles ne consomment que des nombres : une colonne texte (« ville ») doit être encodée. OneHotEncoder crée une colonne 0/1 par catégorie (aucun ordre imposé, contrairement à un entier). ColumnTransformer applique le bon encodage par colonne ; handle_unknown="ignore" évite le crash sur une catégorie inédite en prod.`,
            en: `Models consume only numbers: a text column ("city") must be encoded. OneHotEncoder creates one 0/1 column per category (no artificial order, unlike a plain integer). ColumnTransformer applies the right encoding per column; handle_unknown="ignore" avoids crashing on an unseen category in prod.`,
          },
        },
      ],
    },
    {
      id: 'ml-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'ml-bp-split-before-anything',
          title: { fr: 'Split train/test AVANT tout prétraitement', en: 'Train/test split BEFORE any preprocessing' },
          code: `X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler().fit(X_tr)   # jamais fit sur X_te`,
          note: {
            fr: `Ajuster un scaler ou imputer sur l'ensemble complet avant le split fait fuiter de l'information du test vers l'entraînement (data leakage), gonflant artificiellement le score.`,
            en: `Fitting a scaler or imputer on the full dataset before splitting leaks test information into training (data leakage), artificially inflating the score.`,
          },
        },
        {
          id: 'ml-bp-baseline-first',
          title: { fr: 'Établir une baseline simple avant un modèle complexe', en: 'Establish a simple baseline before a complex model' },
          code: `from sklearn.dummy import DummyClassifier
baseline = DummyClassifier(strategy="most_frequent").fit(X_tr, y_tr)
print(baseline.score(X_te, y_te))   # à battre par tout modèle "sérieux"`,
          note: {
            fr: `Sans baseline, impossible de savoir si un XGBoost à 85 % d'accuracy est réellement bon ou si prédire la classe majoritaire donnait déjà 84 %.`,
            en: `Without a baseline, you can't tell if an 85% accuracy XGBoost is actually good, or if predicting the majority class already gave 84%.`,
          },
        },
        {
          id: 'ml-bp-crossval-small-data',
          title: { fr: 'Validation croisée sur petit jeu ou classes déséquilibrées', en: 'Cross-validation on small or imbalanced data' },
          code: `from sklearn.model_selection import StratifiedKFold
cross_val_score(model, X, y, cv=StratifiedKFold(5), scoring="f1")`,
          note: {
            fr: `Un split unique sur peu de données dépend fortement du tirage aléatoire ; la validation croisée stratifiée moyenne plusieurs découpages pour une estimation fiable.`,
            en: `A single split on little data depends heavily on the random draw; stratified cross-validation averages several folds for a reliable estimate.`,
          },
        },
        {
          id: 'ml-bp-metric-matches-business',
          title: { fr: 'Choisir la métrique selon le coût métier', en: 'Pick the metric based on business cost' },
          code: `# fraude: privilégier le rappel (rater une fraude coûte cher)
# spam: privilégier la précision (bloquer un vrai email coûte cher)`,
          note: {
            fr: `L'accuracy par défaut ignore le coût asymétrique des erreurs ; choisir précision/rappel/F1/AUC selon ce que coûte réellement un faux positif vs un faux négatif évite d'optimiser la mauvaise chose.`,
            en: `Default accuracy ignores the asymmetric cost of errors; choosing precision/recall/F1/AUC based on what a false positive vs false negative actually costs avoids optimizing the wrong thing.`,
          },
        },
        {
          id: 'ml-bp-version-everything',
          title: { fr: 'Versionner code, données ET hyperparamètres', en: 'Version code, data AND hyperparameters' },
          code: `joblib.dump({"model": pipe, "params": search.best_params_,
             "data_hash": hash_of(X_tr)}, "modele_v3.joblib")`,
          note: {
            fr: `Sauver uniquement le fichier .joblib ne suffit pas : sans la version exacte des données d'entraînement et des hyperparamètres, un modèle en production devient impossible à reproduire ou déboguer.`,
            en: `Saving just the .joblib file isn't enough: without the exact training data version and hyperparameters, a production model becomes impossible to reproduce or debug.`,
          },
        },
      ],
    },
  ],
};
