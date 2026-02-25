# OATIA — Observatoire Prospectif CNEAP Pays de la Loire

Application web pour analyser les lycées agricoles du réseau CNEAP en Pays de la Loire : effectifs, projections ML, simulation d'attractivité et analyse IA.

## Fonctionnalités

- **Carte interactive** — 22 lycées CNEAP géolocalisés sur les 5 départements (Loire-Atlantique, Maine-et-Loire, Mayenne, Sarthe, Vendée)
- **Tableau de bord** — Effectifs 2025, projections 2028, pente annuelle, taux de captation
- **Simulation d'attractivité** — Scénarios -20 % à +40 % sur les effectifs projetés
- **Analyse IA** — Diagnostic et recommandations via OpenAI / Anthropic / Azure (clé à configurer)
- **Fiches établissements** — Détail des formations par lycée

## Structure du projet

```
├── frontend/          # App React + Vite + TypeScript
│   ├── src/
│   │   ├── components/ # Carte, panneaux, UI
│   │   ├── pages/     # Accueil, Territoire, Établissements, Paramètres
│   │   └── data/      # Données statiques
│   └── public/data/   # lycees_list.json, lycees_data.json, GeoJSON
├── backend/           # API Express (Node.js)
│   ├── index.js       # Endpoints /api/lycees, simulate, analyze
│   └── generate_api_data.py  # Génération des JSON à partir des sources
├── data/              # Données sources (CSV, XLSX, ZIP)
├── images/            # Graphiques générés (PNG)
└── .github/workflows/ # CI (lint, build, tests)
```

## Prérequis

- **Node.js** 18+ et npm
- **Python 3** (pour régénérer les données si besoin)

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/Abdouhramanhassanroble/CNEAP-Hackathon.git
cd CNEAP-Hackathon

# Installer les dépendances frontend
cd frontend
npm install
```

## Lancer en local

```bash
# Depuis frontend/ : frontend + API backend
npm run dev:full
```

- **Frontend** : http://localhost:8080 (ou 8081 si 8080 est occupé)
- **API** : http://localhost:3001

Le proxy Vite redirige `/api` vers le backend.

## Build & déploiement

```bash
cd frontend
npm run build
```

Le build produit `frontend/dist/`. Pour un déploiement Vercel :

1. Connecter le dépôt à [Vercel](https://vercel.com)
2. Configurer le **Root Directory** sur `frontend` (Settings → General)
3. Les déploiements se lancent automatiquement à chaque push sur `main`

> **Note** : En production Vercel, seul le frontend est déployé. L’API n’est pas disponible ; les données sont chargées depuis les fichiers JSON statiques (`lycees_list.json`, `lycees_data.json`).

## Configuration IA

Pour activer l’analyse IA (Territoire → sélectionner un lycée → « Analyser avec IA ») :

1. Aller dans **Paramètres**
2. Choisir un fournisseur (Anthropic, Azure OpenAI, OpenAI)
3. Saisir la clé API et l’endpoint
4. Cliquer sur **Sauvegarder** puis **Tester la connexion**

La clé est stockée localement dans le navigateur (localStorage).

## Données

- **Effectifs** : 2018–2025 (historique), 2026–2028 (projections Ridge)
- **Population 15–19 ans** : INSEE par département
- **Modèle** : Ridge (MAE ≈ 16.2, MAPE ≈ 5.2 %)

Les fichiers `lycees_list.json` et `lycees_data.json` sont générés par `backend/generate_api_data.py` à partir des sources dans `data/` (CSV, XLSX). Les graphiques sont écrits dans `images/`.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Frontend seul |
| `npm run dev:api` | Backend seul |
| `npm run dev:full` | Frontend + backend |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
| `npm run test` | Tests Vitest |

## Technologies

- **Frontend** : React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Leaflet, Recharts
- **Backend** : Express 5, Node.js
- **IA** : OpenAI, Anthropic, Azure OpenAI (via clé configurée)

---

© 2025 CNEAP — Observatoire Prospectif Pays de la Loire
