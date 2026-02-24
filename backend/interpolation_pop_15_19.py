#!/usr/bin/env python3
"""
Interpolation linéaire de la population 15-19 ans entre 2016 et 2022.

Méthode :
  - pente = (pop_2022 - pop_2016) / 6
  - pop_annee = pop_2016 + pente * (annee - 2016)

Années interpolées : 2018, 2019, 2020, 2021, 2022

Utilise les départements de tous les lycées CNEAP (44, 49, 53, 72, 85).
"""

import pandas as pd
from pathlib import Path

# Fichier source (données 2016 et 2022) - tous les départements des lycées
DATA_DIR = Path(__file__).parent.parent
INPUT_CSV = DATA_DIR / "pop_15_19_tous_lycees_2016_2022.csv"
OUTPUT_CSV = DATA_DIR / "pop_15_19_interpolee.csv"
OUTPUT_EXCEL = DATA_DIR / "pop_15_19_interpolee.xlsx"

ANNEES_INTERPOLEES = [2018, 2019, 2020, 2021, 2022]
ANNEE_DEBUT = 2016
ANNEE_FIN = 2022
ECART_ANNEES = ANNEE_FIN - ANNEE_DEBUT  # 6


def interpoler(dep_data: pd.Series, annees: list[int]) -> pd.DataFrame:
    """
    Interpolation linéaire pour un département.

    pop_annee = pop_2016 + pente * (annee - 2016)
    avec pente = (pop_2022 - pop_2016) / 6
    """
    pop_2016 = dep_data["Population_15_19_ans_2016"]
    pop_2022 = dep_data["Population_15_19_ans_2022"]

    pente = (pop_2022 - pop_2016) / ECART_ANNEES

    rows = []
    for annee in annees:
        pop = pop_2016 + pente * (annee - ANNEE_DEBUT)
        rows.append({"annee": annee, "population_15_19": round(pop, 2)})

    return pd.DataFrame(rows)


def main() -> pd.DataFrame:
    """Charge les données, interpole et retourne le DataFrame final."""
    input_file = INPUT_CSV
    if not input_file.exists():
        # Fallback : ancien fichier Vendée/Mayenne uniquement
        fallback = DATA_DIR / "pop_15_19_vendee_mayenne_2016_2022.csv"
        if fallback.exists():
            input_file = fallback
            print(f"  (Utilisation de {fallback.name} - exécutez extract_pop pour tous les lycées)\n")
        else:
            raise FileNotFoundError(f"Aucun fichier trouvé. Exécutez d'abord extract_pop_15_19_vendee_mayenne.py")

    df = pd.read_csv(input_file)

    resultats = []
    for _, row in df.iterrows():
        dep_df = interpoler(row, ANNEES_INTERPOLEES)
        dep_df["code_departement"] = row["Code_departement"]
        dep_df["departement"] = row["Departement"]
        resultats.append(dep_df)

    # DataFrame final : année | population_15_19 | code_departement | departement
    df_final = pd.concat(resultats, ignore_index=True)

    # Réordonner : année | code_departement | departement | population_15_19
    df_final = df_final[
        ["annee", "code_departement", "departement", "population_15_19"]
    ]

    # Sauvegarder
    df_final.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    df_final.to_excel(OUTPUT_EXCEL, index=False)

    print("Interpolation linéaire (2016 → 2022)")
    print(f"  Pente = (pop_2022 - pop_2016) / {ECART_ANNEES}")
    print(f"  Années : {ANNEES_INTERPOLEES}\n")
    print(df_final.to_string(index=False))
    print(f"\n✓ Fichiers sauvegardés : {OUTPUT_CSV.name}, {OUTPUT_EXCEL.name}")

    return df_final


if __name__ == "__main__":
    main()
