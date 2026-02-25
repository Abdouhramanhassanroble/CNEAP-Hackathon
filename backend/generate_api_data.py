#!/usr/bin/env python3
"""
Génère les fichiers JSON pour l'API frontend.
Entraîne un modèle Ridge sur TOUS les 22 lycées et projette 2026-2028.
Produit : frontend/public/data/lycees_list.json + lycees_data.json
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.linear_model import Ridge

BASE = Path(__file__).parent.parent
DATA_DIR = BASE / "data"
POP_CSV = DATA_DIR / "pop_15_19_interpolee.csv"
OUTPUT_DIR = BASE / "frontend" / "public" / "data"

# Mapping lycée (clé CSV uppercase) → département
LYCEE_DEP = {
    "LE LANDREAU": "44", "SAINT GILDAS DES BOIS": "44", "NORT SUR ERDRE": "44",
    "SAINT MOLF": "44", "MACHECOUL": "44", "ANCENIS": "44", "CHATEAUBRIANT": "44",
    "GORGES": "44", "LE PELLERIN": "44", "DERVAL - BLAIN": "44",
    "CHOLET": "49", "ANGERS LES BUISSONNETS": "49", "CHEMILLE": "49",
    "LES PONTS DE CE": "49", "ANGERS AGRITEC": "49",
    "EVRON": "53", "BAZOUGES-CHATEAU GONTIER": "53", "MAYENNE": "53",
    "RUILLE SUR LOIR": "72", "LA FERTE BERNARD": "72", "SABLE SUR SARTHE": "72",
    "LA ROCHE SUR YON": "85",
}

# Noms affichables
LYCEE_DISPLAY = {
    "LE LANDREAU": "Le Landreau", "SAINT GILDAS DES BOIS": "Saint-Gildas-des-Bois",
    "NORT SUR ERDRE": "Nort-sur-Erdre", "SAINT MOLF": "Saint-Molf",
    "MACHECOUL": "Machecoul", "ANCENIS": "Ancenis", "CHATEAUBRIANT": "Châteaubriant",
    "GORGES": "Gorges", "LE PELLERIN": "Le Pellerin", "DERVAL - BLAIN": "Derval-Blain",
    "CHOLET": "Cholet", "ANGERS LES BUISSONNETS": "Angers Buissonnets",
    "CHEMILLE": "Chemillé", "LES PONTS DE CE": "Les Ponts-de-Cé",
    "ANGERS AGRITEC": "Angers Agritec", "EVRON": "Evron",
    "BAZOUGES-CHATEAU GONTIER": "Bazouges-Château-Gontier", "MAYENNE": "Mayenne",
    "RUILLE SUR LOIR": "Ruillé-sur-Loir", "LA FERTE BERNARD": "La Ferté-Bernard",
    "SABLE SUR SARTHE": "Sablé-sur-Sarthe", "LA ROCHE SUR YON": "La Roche-sur-Yon",
}

# Coordonnées réelles des villes
COORDS = {
    "LE LANDREAU": (47.1900, -1.2700), "SAINT GILDAS DES BOIS": (47.5150, -1.9800),
    "NORT SUR ERDRE": (47.4400, -1.5000), "SAINT MOLF": (47.3800, -2.4200),
    "MACHECOUL": (46.9900, -1.8200), "ANCENIS": (47.3700, -1.1800),
    "CHATEAUBRIANT": (47.7200, -1.3700), "GORGES": (47.0980, -1.3000),
    "LE PELLERIN": (47.2000, -1.7600), "DERVAL - BLAIN": (47.6800, -1.6700),
    "CHOLET": (47.0600, -0.8800), "ANGERS LES BUISSONNETS": (47.4700, -0.5500),
    "CHEMILLE": (47.2200, -0.7300), "LES PONTS DE CE": (47.4300, -0.5200),
    "ANGERS AGRITEC": (47.4800, -0.5600), "EVRON": (48.1500, -0.4000),
    "BAZOUGES-CHATEAU GONTIER": (47.8300, -0.7000), "MAYENNE": (48.3000, -0.6200),
    "RUILLE SUR LOIR": (47.7400, 0.5500), "LA FERTE BERNARD": (48.1900, 0.6500),
    "SABLE SUR SARTHE": (47.8400, -0.3300), "LA ROCHE SUR YON": (46.6700, -1.4300),
}

DEP_NAMES = {"44": "Loire-Atlantique", "49": "Maine-et-Loire", "53": "Mayenne", "72": "Sarthe", "85": "Vendée"}


def find_evolution_csv() -> Path:
    for f in DATA_DIR.glob("*evolution*Feuil1*.csv"):
        return f
    return DATA_DIR / "evolution effectif de 2018 à 2025(1).xlsx - Feuil1.csv"


def load_all_effectifs(path: Path) -> pd.DataFrame:
    """Charge les effectifs de TOUS les lycées en format long."""
    df = pd.read_csv(path, encoding="utf-8")
    col_lycee = df.columns[0]
    df = df.rename(columns={col_lycee: "lycee_raw"})
    df["lycee_raw"] = df["lycee_raw"].str.strip().str.upper()
    df = df[df["lycee_raw"] != "TOTAL"].copy()

    year_cols = [c for c in df.columns if "Octobre" in str(c)]
    df_long = df.melt(
        id_vars=["lycee_raw"], value_vars=year_cols,
        var_name="annee_str", value_name="effectifs_raw",
    )
    df_long["annee"] = df_long["annee_str"].str.extract(r"(\d{4})").astype(int)
    df_long["effectifs"] = (
        df_long["effectifs_raw"].astype(str)
        .str.replace(" ", "").str.replace("\u202f", "").astype(float)
    )
    df_long["departement_code"] = df_long["lycee_raw"].map(LYCEE_DEP)
    df_long = df_long.dropna(subset=["departement_code"])
    return df_long[["annee", "lycee_raw", "departement_code", "effectifs"]].drop_duplicates()


def load_and_extrapolate_pop(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["code_departement"] = df["code_departement"].astype(str).str.strip()
    extrap = []
    for code, grp in df.groupby("code_departement"):
        grp = grp.sort_values("annee")
        pop_2018 = grp[grp["annee"] == 2018]["population_15_19"].values[0]
        pop_2022 = grp[grp["annee"] == 2022]["population_15_19"].values[0]
        pente = (pop_2022 - pop_2018) / 4
        for annee in range(2018, 2029):
            pop = grp[grp["annee"] == annee]["population_15_19"].values[0] if annee <= 2022 else pop_2022 + pente * (annee - 2022)
            extrap.append({"annee": annee, "code_departement": code, "population_15_19": round(pop, 2)})
    return pd.DataFrame(extrap)


def prepare_all_data(effectifs: pd.DataFrame, pop: pd.DataFrame) -> pd.DataFrame:
    """Construit le DataFrame long avec population et lag."""
    df = effectifs.merge(pop, left_on=["annee", "departement_code"], right_on=["annee", "code_departement"], how="left")
    df = df[["annee", "lycee_raw", "departement_code", "effectifs", "population_15_19"]].copy()
    df["taux_captation"] = df["effectifs"] / df["population_15_19"]
    df = df.sort_values(["lycee_raw", "annee"])
    df["lag1_effectifs"] = df.groupby("lycee_raw")["effectifs"].shift(1)
    return df


def train_global_model(df: pd.DataFrame):
    """
    Entraîne un Ridge sur TOUS les lycées.
    Features : annee, lag1_effectifs, population_15_19 (pas de one-hot lycée pour généraliser).
    """
    train = df[df["annee"] <= 2023].copy()
    feature_cols = ["annee", "lag1_effectifs", "population_15_19"]
    X = train[feature_cols].fillna(train["effectifs"].mean())
    y = train["effectifs"]
    model = Ridge(alpha=1.0, random_state=42)
    model.fit(X, y)

    test = df[df["annee"].isin([2024, 2025])].copy()
    if not test.empty:
        X_test = test[feature_cols].fillna(train["effectifs"].mean())
        y_pred = model.predict(X_test)
        y_true = test["effectifs"].values
        mae = float(np.mean(np.abs(y_true - y_pred)))
        mape = float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100)
    else:
        mae, mape = 0.0, 0.0

    return model, feature_cols, mae, mape


def forecast_lycee(model, feature_cols, lycee_hist: pd.DataFrame, pop: pd.DataFrame, years: list[int]) -> list[dict]:
    """Projection récursive pour un lycée."""
    dep = lycee_hist["departement_code"].iloc[0]
    last = lycee_hist.sort_values("annee").iloc[-1]
    lag1 = last["effectifs"]
    preds = []
    for annee in years:
        pop_rows = pop[(pop["code_departement"] == dep) & (pop["annee"] == annee)]
        pop_val = pop_rows["population_15_19"].values[0] if not pop_rows.empty else last["population_15_19"]
        X = pd.DataFrame([{"annee": annee, "lag1_effectifs": lag1, "population_15_19": pop_val}])
        pred = max(0, round(model.predict(X[feature_cols])[0]))
        preds.append({"year": annee, "baseline": pred, "population_15_19": pop_val})
        lag1 = pred
    return preds


def compute_metrics(lycee_hist: pd.DataFrame) -> dict:
    """Calcule les métriques pour un lycée."""
    d = lycee_hist.sort_values("annee")
    years = d["annee"].values.astype(float)
    effs = d["effectifs"].values
    slope = float(np.polyfit(years, effs, 1)[0])

    tc = d["taux_captation"].dropna()
    tc_first = tc.iloc[0] * 100 if len(tc) > 0 else 0
    tc_last = tc.iloc[-1] * 100 if len(tc) > 0 else 0

    return {
        "pente_annuelle": round(slope, 2),
        "mape": 0,  # filled globally
        "captation_2018": round(tc_first, 3),
        "captation_2025": round(tc_last, 3),
        "delta_captation_points": round(tc_last - tc_first, 3),
        "seuil_critique": 50,
    }


def make_id(name: str) -> str:
    return name.lower().replace(" ", "_").replace("-", "_")


def main():
    print("=== Génération des données API pour le frontend ===\n")

    evo_csv = find_evolution_csv()
    if not evo_csv.exists():
        print(f"ERREUR: {evo_csv} introuvable"); return
    if not POP_CSV.exists():
        print(f"ERREUR: {POP_CSV} introuvable"); return

    effectifs = load_all_effectifs(evo_csv)
    pop = load_and_extrapolate_pop(POP_CSV)
    df = prepare_all_data(effectifs, pop)

    print(f"  Lycées chargés : {df['lycee_raw'].nunique()}")
    print(f"  Années : {df['annee'].min()} → {df['annee'].max()}")

    model, feature_cols, global_mae, global_mape = train_global_model(df)
    print(f"  Modèle Ridge global — MAE: {global_mae:.1f}, MAPE: {global_mape:.1f}%")

    lycees_list = []
    lycees_data = {}

    for lycee_raw in sorted(df["lycee_raw"].unique()):
        lid = make_id(lycee_raw)
        dep = LYCEE_DEP.get(lycee_raw, "44")
        name = LYCEE_DISPLAY.get(lycee_raw, lycee_raw.title())
        lat, lng = COORDS.get(lycee_raw, (47.2, -1.5))

        lycee_hist = df[df["lycee_raw"] == lycee_raw].copy()

        # Métriques
        metrics = compute_metrics(lycee_hist)
        metrics["mape"] = round(global_mape, 1)

        # Séries historiques (2018-2025)
        series = []
        for _, row in lycee_hist.sort_values("annee").iterrows():
            series.append({
                "year": int(row["annee"]),
                "actual": int(row["effectifs"]),
                "baseline": int(row["effectifs"]),
                "scenario": int(row["effectifs"]),
            })

        # Projections 2026-2028
        projections = forecast_lycee(model, feature_cols, lycee_hist, pop, [2026, 2027, 2028])
        for p in projections:
            series.append({
                "year": p["year"],
                "actual": None,
                "baseline": int(p["baseline"]),
                "scenario": int(p["baseline"]),
            })

        lycees_list.append({
            "id": lid,
            "name": name,
            "departement_code": dep,
            "departement_nom": DEP_NAMES.get(dep, dep),
            "region": "Pays de la Loire",
            "lat": lat,
            "lng": lng,
            "hasRealData": True,
            "effectif_actuel": int(lycee_hist[lycee_hist["annee"] == lycee_hist["annee"].max()]["effectifs"].values[0]),
        })

        lycees_data[lid] = {
            "lycee": {"id": lid, "name": name, "departement_code": dep, "lat": lat, "lng": lng},
            "metrics": metrics,
            "series": series,
        }

        eff_last = int(lycee_hist.sort_values("annee").iloc[-1]["effectifs"])
        proj_last = projections[-1]["baseline"] if projections else eff_last
        print(f"  {name:35s}  {eff_last} (2025) → {proj_last} (2028)  pente={metrics['pente_annuelle']:+.1f}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_DIR / "lycees_list.json", "w", encoding="utf-8") as f:
        json.dump(lycees_list, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "lycees_data.json", "w", encoding="utf-8") as f:
        json.dump(lycees_data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ {len(lycees_list)} lycées exportés dans {OUTPUT_DIR}/")
    print(f"  - lycees_list.json ({len(lycees_list)} entrées)")
    print(f"  - lycees_data.json ({len(lycees_data)} entrées)")


if __name__ == "__main__":
    main()
