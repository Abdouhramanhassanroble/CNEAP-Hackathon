"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Etablissement } from "@/types";

/**
 * Carte Leaflet chargée uniquement côté client (évite les erreurs SSR avec window).
 */
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-200 rounded-xl">
      <span className="text-slate-600 font-medium">Chargement de la carte…</span>
    </div>
  ),
});

interface MapContainerProps {
  etablissements: Etablissement[];
  etablissementSelectionne: Etablissement | null;
  onSelectEtablissement: (e: Etablissement | null) => void;
}

/**
 * Conteneur de la carte : gère le chargement dynamique et transmet les props.
 */
export default function MapContainer({
  etablissements,
  etablissementSelectionne,
  onSelectEtablissement,
}: MapContainerProps) {
  const key = useMemo(
    () => etablissements.map((e) => e.id).join(","),
    [etablissements]
  );

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg border border-slate-200">
      <LeafletMap
        key={key}
        etablissements={etablissements}
        etablissementSelectionne={etablissementSelectionne}
        onSelectEtablissement={onSelectEtablissement}
      />
    </div>
  );
}
