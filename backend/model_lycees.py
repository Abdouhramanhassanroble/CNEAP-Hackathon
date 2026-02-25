#!/usr/bin/env python3
"""
Modélisation des effectifs de 2 lycées (Evron, La Roche-sur-Yon)
croisant avec la démographie 15-19 ans par département.

Données : effectifs 2018-2025 + population 15-19 interpolée (INSEE).
"""

import matplotlib
matplotlib.use("Agg")  # Backend non-interactif pour exécution en script
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
import matplotlib.pyplot as plt

# Chemins
BASE = Path(__file__).parent.parent
DATA_DIR = BASE / "data"
IMAGES_DIR = BASE / "images"
POP_CSV = DATA_DIR / "pop_15_19_interpolee.csv"


def _find_evolution_csv() -> Path:
    """Recherche le fichier CSV des effectifs (nom peut varier selon encodage)."""
    for f in DATA_DIR.glob("*evolution*Feuil1*.csv"):
        return f
    for f in DATA_DIR.glob("*effectif*2025*.csv"):
        return f
    return DATA_DIR / "evolution effectif de 2018 à 2025(1).xlsx - Feuil1.csv"

# Mapping lycée → département
LYCEE_DEP = {"EVRON": "53", "LA ROCHE SUR YON": "85"}
LYCEE_NOM = {"EVRON": "Evron", "LA ROCHE SUR YON": "LaRoche"}


# -----------------------------------------------------------------------------
# A) PREPARATION DES DONNÉES
# -----------------------------------------------------------------------------


def load_effectifs(path: Path) -> pd.DataFrame:
    """Charge les effectifs et restructure en format long."""
    df = pd.read_csv(path, encoding="utf-8")
    # Première colonne = nom lycée
    col_lycee = df.columns[0]
    df = df.rename(columns={col_lycee: "lycee_raw"})
    df["lycee_raw"] = df["lycee_raw"].str.strip().str.upper()

    # Garder Evron et La Roche
    df = df[df["lycee_raw"].isin(["EVRON", "LA ROCHE SUR YON"])].copy()
    df["lycee"] = df["lycee_raw"].map(LYCEE_NOM)
    df["departement_code"] = df["lycee_raw"].map(LYCEE_DEP)

    # Pivoter : colonnes année → lignes
    year_cols = [c for c in df.columns if "Octobre" in str(c)]
    df_long = df.melt(
        id_vars=["lycee_raw", "lycee", "departement_code"],
        value_vars=year_cols,
        var_name="annee_str",
        value_name="effectifs_raw",
    )
    df_long["annee"] = df_long["annee_str"].str.extract(r"(\d{4})").astype(int)
    # Nettoyer effectifs (espaces milliers)
    df_long["effectifs"] = (
        df_long["effectifs_raw"]
        .astype(str)
        .str.replace(" ", "")
        .str.replace("\u202f", "")
        .astype(float)
    )
    df_long = df_long[["annee", "lycee", "departement_code", "effectifs"]].drop_duplicates()
    return df_long


def load_and_extrapolate_pop(path: Path) -> pd.DataFrame:
    """
    Charge pop_15_19, extrapole 2023-2028 à partir de la tendance 2018-2022.
    """
    df = pd.read_csv(path)
    df["code_departement"] = df["code_departement"].astype(str).str.strip()

    extrap = []
    for code, grp in df.groupby("code_departement"):
        grp = grp.sort_values("annee")
        pop_2018 = grp[grp["annee"] == 2018]["population_15_19"].values[0]
        pop_2022 = grp[grp["annee"] == 2022]["population_15_19"].values[0]
        pente = (pop_2022 - pop_2018) / 4

        for annee in range(2018, 2029):
            if annee <= 2022:
                pop = grp[grp["annee"] == annee]["population_15_19"].values[0]
            else:
                pop = pop_2022 + pente * (annee - 2022)
            extrap.append({
                "annee": annee,
                "code_departement": code,
                "departement": grp["departement"].iloc[0],
                "population_15_19": round(pop, 2),
            })

    return pd.DataFrame(extrap)


def prepare_data(effectifs: pd.DataFrame, population: pd.DataFrame) -> pd.DataFrame:
    """Construit le DataFrame long avec toutes les colonnes demandées."""
    df = effectifs.merge(
        population,
        left_on=["annee", "departement_code"],
        right_on=["annee", "code_departement"],
        how="left",
        suffixes=("", "_pop"),
    )
    df = df[["annee", "lycee", "departement_code", "effectifs", "population_15_19"]].copy()
    df["taux_captation"] = df["effectifs"] / df["population_15_19"]

    # lag1_effectifs par lycée
    df = df.sort_values(["lycee", "annee"])
    df["lag1_effectifs"] = df.groupby("lycee")["effectifs"].shift(1)

    return df


# -----------------------------------------------------------------------------
# B) VISUALISATIONS
# -----------------------------------------------------------------------------


def plot_effectifs(df: pd.DataFrame, ax: plt.Axes | None = None) -> plt.Axes:
    """Courbes des effectifs 2018-2025 pour les deux lycées."""
    if ax is None:
        fig, ax = plt.subplots(figsize=(9, 5))
    for lycee in df["lycee"].unique():
        d = df[df["lycee"] == lycee].sort_values("annee")
        ax.plot(d["annee"], d["effectifs"], "o-", label=lycee, linewidth=2, markersize=8)
    ax.set_xlabel("Année")
    ax.set_ylabel("Effectifs")
    ax.set_title("Effectifs des lycées Evron et La Roche-sur-Yon (2018-2025)")
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_xticks(range(2018, 2026))
    return ax


def plot_taux_captation(df: pd.DataFrame, ax: plt.Axes | None = None) -> plt.Axes:
    """Courbes du taux de captation 2018-2025."""
    if ax is None:
        fig, ax = plt.subplots(figsize=(9, 5))
    for lycee in df["lycee"].unique():
        d = df[df["lycee"] == lycee].sort_values("annee")
        ax.plot(d["annee"], d["taux_captation"] * 100, "o-", label=lycee, linewidth=2, markersize=8)
    ax.set_xlabel("Année")
    ax.set_ylabel("Taux de captation (%)")
    ax.set_title("Taux de captation (effectifs / pop. 15-19) - 2018-2025")
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_xticks(range(2018, 2026))
    return ax


def plot_pop_par_departement(pop: pd.DataFrame, ax: plt.Axes | None = None) -> plt.Axes:
    """Courbe pop_15_19 2018-2028 par département."""
    if ax is None:
        fig, ax = plt.subplots(figsize=(9, 5))
    for dep in pop["departement"].unique():
        d = pop[pop["departement"] == dep].sort_values("annee")
        ax.plot(d["annee"], d["population_15_19"], "o-", label=dep, linewidth=2, markersize=6)
    ax.set_xlabel("Année")
    ax.set_ylabel("Population 15-19 ans")
    ax.set_title("Population 15-19 ans par département (2018-2028)")
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_xticks(range(2018, 2029))
    return ax


# -----------------------------------------------------------------------------
# C) INDICATEURS
# -----------------------------------------------------------------------------


def print_indicators(df: pd.DataFrame, pop: pd.DataFrame) -> None:
    """Affiche les indicateurs demandés."""
    print("\n" + "=" * 60)
    print("INDICATEURS")
    print("=" * 60)

    for lycee in df["lycee"].unique():
        d = df[df["lycee"] == lycee].sort_values("annee")
        X = d[["annee"]].values
        y = d["effectifs"].values
        slope = np.polyfit(X.flatten(), y, 1)[0]
        print(f"\n{lycee}:")
        print(f"  - Pente annuelle (régression linéaire effectifs): {slope:.2f} élèves/an")

        eff_2018 = d[d["annee"] == 2018]["effectifs"].values[0]
        eff_2025 = d[d["annee"] == 2025]["effectifs"].values[0]
        evol = (eff_2025 - eff_2018) / eff_2018 * 100
        print(f"  - Évolution % 2018→2025 effectifs: {evol:.1f}%")

    for code in ["53", "85"]:
        p = pop[pop["code_departement"] == code]
        pop_2018 = p[p["annee"] == 2018]["population_15_19"].values[0]
        pop_2022 = p[p["annee"] == 2022]["population_15_19"].values[0]
        evol = (pop_2022 - pop_2018) / pop_2018 * 100
        dep = p["departement"].iloc[0]
        print(f"\n{dep} (dép. {code}):")
        print(f"  - Évolution % 2018→2022 pop. 15-19: {evol:.1f}%")

    print("\nTaux de captation:")
    for lycee in df["lycee"].unique():
        d = df[df["lycee"] == lycee]
        tc_2018 = d[d["annee"] == 2018]["taux_captation"].values[0] * 100
        tc_2025 = d[d["annee"] == 2025]["taux_captation"].values[0] * 100
        evol = tc_2025 - tc_2018
        print(f"  - {lycee}: {tc_2018:.2f}% (2018) → {tc_2025:.2f}% (2025), Δ = {evol:.2f} pts")


# -----------------------------------------------------------------------------
# D) MODÈLE ML & BACKTEST
# -----------------------------------------------------------------------------


def encode_features(df: pd.DataFrame) -> pd.DataFrame:
    """Crée les features pour le modèle."""
    X = df.copy()
    X["lycee_Evron"] = (X["lycee"] == "Evron").astype(int)
    X["lycee_LaRoche"] = (X["lycee"] == "LaRoche").astype(int)
    return X


def train_model(X_train: pd.DataFrame, y_train: pd.Series):
    """Entraîne un modèle Ridge."""
    cols = ["annee", "lycee_Evron", "lycee_LaRoche", "lag1_effectifs", "population_15_19"]
    X = X_train[cols].fillna(X_train["effectifs"].mean())  # lag1 manquant première année
    model = Ridge(alpha=1.0, random_state=42)
    model.fit(X, y_train)
    return model, cols


def backtest(
    df: pd.DataFrame,
    train_years: tuple[int, int],
    test_years: tuple[int, int],
) -> tuple[object, list[str], float, float]:
    """Backtest temporel : train 2018-2023, test 2024-2025."""
    annee_min, annee_max = train_years
    test_min, test_max = test_years

    train = df[(df["annee"] >= annee_min) & (df["annee"] <= annee_max)].copy()
    test = df[(df["annee"] >= test_min) & (df["annee"] <= test_max)].copy()

    train_enc = encode_features(train)
    test_enc = encode_features(test)

    model, cols = train_model(
        train_enc,
        train["effectifs"],
    )

    X_test = test_enc[cols].copy()
    # Remplir lag1 pour le test (utiliser les vrais effectifs)
    for idx in X_test.index:
        lycee = test.loc[idx, "lycee"]
        annee = test.loc[idx, "annee"]
        lag_row = df[(df["lycee"] == lycee) & (df["annee"] == annee - 1)]
        if not lag_row.empty:
            X_test.loc[idx, "lag1_effectifs"] = lag_row["effectifs"].values[0]

    X_test = X_test.fillna(train["effectifs"].mean())
    y_pred = model.predict(X_test)
    y_true = test["effectifs"].values

    mae = mean_absolute_error(y_true, y_pred)
    mape = np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100

    return model, cols, mae, mape


# -----------------------------------------------------------------------------
# E) PROJECTION RÉCURSIVE N+3
# -----------------------------------------------------------------------------


def _predict_one_year(
    model,
    feature_cols: list[str],
    lycee: str,
    annee: int,
    lag1: float,
    pop_val: float,
    evron_cap_decline: bool = True,
) -> float:
    """
    Prédit les effectifs pour une année.
    Si evron_cap_decline=True et lycee=Evron : empêche la hausse (pred = min(pred, lag1)).
    """
    le = 1 if lycee == "Evron" else 0
    lr = 1 if lycee == "LaRoche" else 0
    X = pd.DataFrame([{
        "annee": annee,
        "lycee_Evron": le,
        "lycee_LaRoche": lr,
        "lag1_effectifs": lag1,
        "population_15_19": pop_val,
    }])
    pred = model.predict(X[feature_cols])[0]
    pred = max(0, round(pred, 0))

    if evron_cap_decline and lycee == "Evron":
        pred = min(pred, lag1)

    return pred


def forecast_recursive(
    model,
    feature_cols: list[str],
    df_hist: pd.DataFrame,
    pop: pd.DataFrame,
    years: list[int],
    evron_cap_decline: bool = True,
) -> pd.DataFrame:
    """
    Projection récursive : utilise la prédiction précédente comme lag1.

    Args:
        evron_cap_decline: Si True, Evron ne peut pas remonter (pred <= lag1).
                           Mettre à False pour le scénario 'action' où la hausse est autorisée.
    """
    projections = []

    for lycee in df_hist["lycee"].unique():
        dep = df_hist[df_hist["lycee"] == lycee]["departement_code"].iloc[0]
        last_row = df_hist[(df_hist["lycee"] == lycee)].sort_values("annee").iloc[-1]
        lag1 = last_row["effectifs"]

        for annee in years:
            pop_val = pop[(pop["code_departement"] == dep) & (pop["annee"] == annee)]["population_15_19"].values[0]
            pred = _predict_one_year(
                model, feature_cols, lycee, annee, lag1, pop_val, evron_cap_decline
            )
            projections.append({
                "annee": annee,
                "lycee": lycee,
                "departement_code": dep,
                "effectifs": pred,
                "population_15_19": pop_val,
            })
            lag1 = pred

    return pd.DataFrame(projections)


# -----------------------------------------------------------------------------
# F) SIMULATION ACTION EVRON
# -----------------------------------------------------------------------------


def projet_evron_action(
    proj_baseline: pd.DataFrame,
    pop: pd.DataFrame,
    mode: str = "plus30",
) -> pd.DataFrame:
    """
    Scénario 'action Evron' : +30 élèves à partir de 2026 (ou +10% attractivité).
    Retourne projection Evron modifiée 2026-2028.
    """
    proj = proj_baseline[proj_baseline["lycee"] == "Evron"].copy()

    if mode == "plus30":
        proj["effectifs"] = proj["effectifs"] + 30
    else:  # +10% taux captation
        proj["taux_captation"] = proj["effectifs"] / proj["population_15_19"] * 1.10
        proj["effectifs"] = (proj["taux_captation"] * proj["population_15_19"]).round(0)

    return proj


def plot_effectifs_avec_projection(
    df: pd.DataFrame,
    proj: pd.DataFrame,
    proj_evron_action: pd.DataFrame | None = None,
) -> None:
    """Graphe effectifs 2018-2028 (historique + projeté en pointillé)."""
    fig, ax = plt.subplots(figsize=(11, 6))

    # Historique
    for lycee in df["lycee"].unique():
        d = df[df["lycee"] == lycee].sort_values("annee")
        ax.plot(d["annee"], d["effectifs"], "o-", label=f"{lycee} (historique)", linewidth=2, markersize=8)

    # Projection baseline
    for lycee in proj["lycee"].unique():
        d = proj[proj["lycee"] == lycee].sort_values("annee")
        ax.plot(d["annee"], d["effectifs"], "--", label=f"{lycee} (projeté)", linewidth=2, alpha=0.8)

    # Evron action
    if proj_evron_action is not None and not proj_evron_action.empty:
        d = proj_evron_action.sort_values("annee")
        ax.plot(d["annee"], d["effectifs"], "-.", label="Evron action (+30)", linewidth=2, color="green")

    ax.axvline(2025.5, color="gray", linestyle=":", alpha=0.5)
    ax.set_xlabel("Année")
    ax.set_ylabel("Effectifs")
    ax.set_title("Effectifs 2018-2028 (historique + projection + scénario Evron)")
    ax.legend(loc="best", fontsize=8)
    ax.grid(True, alpha=0.3)
    ax.set_xticks(range(2018, 2029))
    plt.tight_layout()
    plt.savefig(IMAGES_DIR / "effectifs_2018_2028.png", dpi=120, bbox_inches="tight")
    plt.close()


# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------


def main() -> None:
    print("Chargement des données...")

    EVOLUTION_CSV = _find_evolution_csv()
    if not EVOLUTION_CSV.exists():
        print(f"ERREUR: fichier effectifs introuvable dans {DATA_DIR}")
        return
    print(f"  Effectifs: {EVOLUTION_CSV.name}")
    if not POP_CSV.exists():
        print(f"ERREUR: {POP_CSV} introuvable.")
        return

    effectifs = load_effectifs(EVOLUTION_CSV)
    pop = load_and_extrapolate_pop(POP_CSV)

    df = prepare_data(effectifs, pop)
    df_full = df.copy()

    print("\n--- DataFrame long (extrait) ---")
    print(df.head(10).to_string())
    print("...")

    # B) Visualisations
    fig, axes = plt.subplots(2, 1, figsize=(9, 10))
    plot_effectifs(df_full, axes[0])
    plot_taux_captation(df_full, axes[1])
    plt.tight_layout()
    plt.savefig(IMAGES_DIR / "effectifs_et_taux.png", dpi=120, bbox_inches="tight")
    plt.close()

    fig2, ax2 = plt.subplots(figsize=(9, 5))
    plot_pop_par_departement(pop, ax2)
    plt.tight_layout()
    plt.savefig(IMAGES_DIR / "pop_15_19_dep.png", dpi=120, bbox_inches="tight")
    plt.close()

    # C) Indicateurs
    print_indicators(df_full, pop)

    # D) Modèle & backtest
    print("\n" + "=" * 60)
    print("MODÈLE ML - Backtest temporel (train 2018-2023, test 2024-2025)")
    print("=" * 60)
    model, cols, mae, mape = backtest(df_full, (2018, 2023), (2024, 2025))
    print(f"MAE = {mae:.2f} élèves")
    print(f"MAPE = {mape:.1f}%")

    # E) Projection 2026-2028
    proj = forecast_recursive(model, cols, df_full, pop, [2026, 2027, 2028])
    print("\n--- Projection 2026-2028 ---")
    print(proj.to_string(index=False))

    # F) Simulation action Evron
    proj_evron_action = projet_evron_action(proj, pop, mode="plus30")
    print("\n--- Evron action (+30 élèves à partir de 2026) ---")
    print(proj_evron_action[["annee", "lycee", "effectifs"]].to_string(index=False))

    # Graphe final
    plot_effectifs_avec_projection(df_full, proj, proj_evron_action)

    print("\n✓ Script terminé.")


if __name__ == "__main__":
    main()
