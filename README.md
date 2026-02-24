## Observatoire CNEAP – Backend & données

Projet de **hackathon** pour analyser et exposer des données sur les lycées du CNEAP (effectifs, projections, démographie, etc.).

Le dépôt que tu vois ici contient principalement :

- **`backend/`** : scripts Python de préparation de données et petit serveur Node/Express (`index.js`, `proxy_server.py`).
- **Fichiers de données** : exports Excel/CSV et graphiques générés (effectifs, population 15–19 ans, etc.).

Ce README est volontairement simple pour que tu puisses le compléter ensuite selon ce que tu montres en démo (front, notebooks, slides…).

---

### 1. Installation rapide

Depuis la racine du projet :

```bash
cd backend
```

#### Dépendances Node (proxy / API Express)

```bash
npm install
npm run dev   # ou: npm start
```

#### Dépendances Python (préparation de données)

```bash
pip install -r requirements.txt
```

---

### 2. Structure (résumé)

- **`backend/`**
  - `index.js` : serveur **Express** (proxy / API légère).
  - `proxy_server.py`, `generate_api_data.py`, `extract_pop_15_19_vendee_mayenne.py`, `interpolation_pop_15_19.py`, `model_lycees.py` : scripts de traitement / interpolation / génération de données.
  - `requirements.txt` : dépendances Python (pandas, scikit‑learn, openpyxl, matplotlib…).
- **Fichiers `.xlsx` / `.csv` / `.png`** : données sources et graphiques produits pour l’analyse.

---

### 3. Comment le compléter

Tu peux facilement enrichir ce README avec :

- une section **“Front-end”** si tu relies ce backend à un projet React/Next/Vite,
- un **schéma d’architecture** (backend ↔ front ↔ Vercel),
- des exemples d’**endpoints** ou de **commandes** pour regénérer les jeux de données.

Si tu me dis ce que tu veux mettre en avant (plutôt data, plutôt front, plutôt infra), je peux te rédiger un README plus détaillé et orienté démo.

