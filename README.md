# Carte des lycées — Visualisation & indicateurs

Application web **front-end uniquement** pour visualiser et analyser des établissements scolaires sur une carte interactive (démo hackathon).

## Fonctionnalités

- **Carte interactive** (React Leaflet) centrée sur la France avec marqueurs pour :
  - Campus L'Orion (Évron)
  - Lycée des Établières (La Roche-sur-Yon)
- **Filtre par filière** : Général, Technologique, Professionnel, Agricole — filtre dynamique sans rechargement.
- **Indicateurs par établissement** (Recharts) : taux d'insertion, recherche d'emploi, poursuite d'études, réussite au bac.
- **Analyse de la population locale** : focus 14–23 ans (bar chart par tranche d'âge).

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React Leaflet (carte)
- Recharts (graphiques)
- Données mockées en JSON local

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Build & déploiement Vercel

```bash
npm run build
```

Déploiement : connecter le dépôt Git à Vercel ou `vercel` en CLI. Aucune configuration supplémentaire requise.

## Structure

- `src/app/` — layout, page principale, styles globaux
- `src/components/` — carte (MapContainer, LeafletMap), filtre (FiltreFormations), graphiques (IndicateursChart, PopulationChart)
- `src/data/` — JSON mock (établissements, population locale) + libellés filières
- `src/types/` — types TypeScript partagés

Code modulaire, composants typés et commentés.
# CNEAP-Hackathon
