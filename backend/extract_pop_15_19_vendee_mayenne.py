#!/usr/bin/env python3
"""
Extraction de la population totale (Hommes + Femmes) 15-19 ans
pour les départements des lycées CNEAP - 2016 et 2022.

Lycées et départements :
  - Loire-Atlantique (44): LE LANDREAU, SAINT GILDAS, NORT SUR ERDRE, SAINT MOLF,
    MACHECOUL, ANCENIS, CHATEAUBRIANT, GORGES, LE PELLERIN, DERVAL-BLAIN
  - Maine-et-Loire (49): CHOLET, ANGERS Buissonnets, CHEMILLE, LES PONTS DE CE, ANGERS Agritec
  - Mayenne (53): EVRON, BAZOUGES-CHATEAU GONTIER, MAYENNE
  - Sarthe (72): RUILLE SUR LOIR, LA FERTE BERNARD, SABLE SUR SARTHE
  - Vendée (85): LA ROCHE SUR YON
"""

import pandas as pd
from pathlib import Path

# Configuration
DATA_DIR = Path(__file__).parent.parent / "data"
FICHIER_EXCEL = DATA_DIR / "pop-sexe-age-quinquennal6822.xlsx"
OUTPUT_CSV = DATA_DIR / "pop_15_19_tous_lycees_2016_2022.csv"
OUTPUT_EXCEL = DATA_DIR / "pop_15_19_tous_lycees_2016_2022.xlsx"

# Mapping lycée → département (Pays de la Loire)
# 44 Loire-Atlantique | 49 Maine-et-Loire | 53 Mayenne | 72 Sarthe | 85 Vendée
LYCEE_DEPARTEMENT = {
    "LE LANDREAU": "44", "SAINT GILDAS DES BOIS": "44", "NORT SUR ERDRE": "44",
    "SAINT MOLF": "44", "MACHECOUL": "44", "ANCENIS": "44", "CHATEAUBRIANT": "44",
    "GORGES": "44", "LE PELLERIN": "44", "DERVAL - BLAIN": "44",
    "CHOLET": "49", "ANGERS Les Buissonnets": "49", "CHEMILLE": "49",
    "LES PONTS DE CE": "49", "ANGERS Agritec": "49",
    "EVRON": "53", "BAZOUGES-CHATEAU GONTIER": "53", "MAYENNE": "53",
    "RUILLE SUR LOIR": "72", "LA FERTE BERNARD": "72", "SABLE SUR SARTHE": "72",
    "LA ROCHE SUR YON": "85",
}
DEPTS = sorted(set(LYCEE_DEPARTEMENT.values()))

# Indices des colonnes: 0=Région, 1=Département, 2=Libellé, 9=15-19H, 10=15-19F
# (structure identique pour DEP_2016 et DEP_2022)
COLS_ID = [0, 1, 2]
COLS_15_19 = [9, 10]


def extraire_donnees(feuille: str, annee: str) -> pd.DataFrame:
    """Extrait la population totale 15-19 ans (H+F) pour les départements ciblés."""
    df = pd.read_excel(
        FICHIER_EXCEL,
        sheet_name=feuille,
        header=10,
        usecols=COLS_ID + COLS_15_19,
    )
    df.columns = ["Code_region", "Code_departement", "Departement", "Hommes_15_19", "Femmes_15_19"]

    # Filtrer les départements ciblés
    df["Code_departement"] = df["Code_departement"].astype(str).str.strip()
    df = df[df["Code_departement"].isin(DEPTS)].copy()

    # Population totale = Hommes + Femmes
    df[f"Population_15_19_ans_{annee}"] = df["Hommes_15_19"] + df["Femmes_15_19"]
    return df[["Code_departement", "Departement", "Code_region", f"Population_15_19_ans_{annee}"]]


def main():
    if not FICHIER_EXCEL.exists():
        print(f"Erreur: Fichier {FICHIER_EXCEL} introuvable.")
        return

    print(f"Extraction population 15-19 ans (2016 et 2022) pour {len(DEPTS)} départements : {', '.join(DEPTS)}...\n")

    df_2016 = extraire_donnees("DEP_2016", "2016")
    df_2022 = extraire_donnees("DEP_2022", "2022")

    if df_2016.empty or df_2022.empty:
        print("Aucune donnée extraite.")
        return

    result = df_2016.merge(
        df_2022[["Code_departement", "Population_15_19_ans_2022"]],
        on="Code_departement",
        how="outer",
    )

    # Réordonner les colonnes
    result = result[["Code_departement", "Departement", "Code_region", "Population_15_19_ans_2016", "Population_15_19_ans_2022"]]

    print(f"  ✓ DEP_2016: {len(df_2016)} départements")
    print(f"  ✓ DEP_2022: {len(df_2022)} départements")

    # Sauvegarder
    result.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    result.to_excel(OUTPUT_EXCEL, index=False)

    print(f"\n✓ Données sauvegardées:")
    print(f"  - CSV: {OUTPUT_CSV}")
    print(f"  - Excel: {OUTPUT_EXCEL}")

    print("\n--- Résumé ---")
    print(result.to_string(index=False))


if __name__ == "__main__":
    main()
