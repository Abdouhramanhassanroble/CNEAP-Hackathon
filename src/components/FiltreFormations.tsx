"use client";

import type { Filiere } from "@/types";
import { FILIERES } from "@/data/filieres";

interface FiltreFormationsProps {
  /** Filières actuellement sélectionnées (vide = toutes) */
  filieresSelectionnees: Filiere[];
  onToggleFiliere: (f: Filiere) => void;
  /** Nombre d'établissements affichés après filtre */
  nombreEtablissements: number;
}

/**
 * Menu de filtre par filière : filtre dynamique des établissements affichés.
 */
export default function FiltreFormations({
  filieresSelectionnees,
  onToggleFiliere,
  nombreEtablissements,
}: FiltreFormationsProps) {
  const toutesSelectionnees = filieresSelectionnees.length === 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800 mb-3">
        Filtre par filière
      </h2>
      <div className="flex flex-wrap gap-2">
        {FILIERES.map(({ value, label }) => {
          const actif =
            toutesSelectionnees || filieresSelectionnees.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggleFiliere(value)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${
                  actif
                    ? "bg-primary-500 text-white hover:bg-primary-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {nombreEtablissements} établissement
        {nombreEtablissements !== 1 ? "s" : ""} affiché
        {nombreEtablissements !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
