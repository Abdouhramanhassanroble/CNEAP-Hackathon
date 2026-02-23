"use client";

import { useMemo, useState, useCallback } from "react";
import MapContainer from "@/components/MapContainer";
import FiltreFormations from "@/components/FiltreFormations";
import IndicateursChart from "@/components/IndicateursChart";
import PopulationChart from "@/components/PopulationChart";
import type { Etablissement, Filiere } from "@/types";
import etablissementsData from "@/data/etablissements.json";

/**
 * Données mockées : typage explicite pour TypeScript.
 */
const etablissementsInit = etablissementsData as Etablissement[];

export default function Home() {
  const [filieresSelectionnees, setFilieresSelectionnees] = useState<
    Filiere[]
  >([]);
  const [etablissementSelectionne, setEtablissementSelectionne] = useState<
    Etablissement | null
  >(null);

  /** Filtrage des établissements selon les filières choisies (vide = toutes). */
  const etablissementsFiltres = useMemo(() => {
    if (filieresSelectionnees.length === 0)
      return etablissementsInit;
    return etablissementsInit.filter((e) =>
      filieresSelectionnees.some((f) => e.filieres.includes(f))
    );
  }, [filieresSelectionnees]);

  const onToggleFiliere = useCallback((f: Filiere) => {
    setFilieresSelectionnees((prev) => {
      const next = prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f];
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* En-tête */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Carte des lycées — Visualisation & indicateurs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Visualisez les établissements, filtrez par filière et consultez les indicateurs.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : filtre + carte */}
          <div className="lg:col-span-2 space-y-4">
            <FiltreFormations
              filieresSelectionnees={filieresSelectionnees}
              onToggleFiliere={onToggleFiliere}
              nombreEtablissements={etablissementsFiltres.length}
            />
            <div className="h-[420px] sm:h-[480px]">
              <MapContainer
                etablissements={etablissementsFiltres}
                etablissementSelectionne={etablissementSelectionne}
                onSelectEtablissement={setEtablissementSelectionne}
              />
            </div>
          </div>

          {/* Colonne droite : indicateurs + population */}
          <div className="space-y-4">
            {etablissementSelectionne ? (
              <>
                <IndicateursChart
                  indicateurs={etablissementSelectionne.indicateurs}
                  titre={etablissementSelectionne.nom}
                />
                <PopulationChart
                  demographie={etablissementSelectionne.demographie}
                  titre={`Population locale 14–23 ans — ${etablissementSelectionne.ville}`}
                />
                <button
                  type="button"
                  onClick={() => setEtablissementSelectionne(null)}
                  className="w-full py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Fermer la fiche
                </button>
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                <p className="text-sm">
                  Cliquez sur un marqueur de la carte ou sur « Voir les indicateurs » dans une popup pour afficher les graphiques et l’analyse de population.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section analyse population (vue d’ensemble quand aucun établissement sélectionné) */}
        {!etablissementSelectionne && etablissementsFiltres.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Analyse de la population locale (14–23 ans)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {etablissementsFiltres.map((e) => (
                <PopulationChart
                  key={e.id}
                  demographie={e.demographie}
                  titre={`${e.nom} — ${e.ville}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        Données mockées — Démo hackathon • Déploiement Vercel ready
      </footer>
    </div>
  );
}
