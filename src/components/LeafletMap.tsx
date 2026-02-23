"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Etablissement } from "@/types";

/** Icône personnalisée pour les marqueurs (évite l'icône par défaut cassée en production) */
function createIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<span style="
      display: block;
      width: 24px;
      height: 24px;
      background: #0ea5e9;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const CENTER_FRANCE: [number, number] = [46.603354, 1.888334];
const ZOOM = 6;

interface LeafletMapProps {
  etablissements: Etablissement[];
  etablissementSelectionne: Etablissement | null;
  onSelectEtablissement: (e: Etablissement | null) => void;
}

/**
 * Recentre la carte quand la sélection change (composant interne).
 */
function FitBounds({ etablissements }: { etablissements: Etablissement[] }) {
  const map = useMap();
  useEffect(() => {
    if (etablissements.length === 0) return;
    if (etablissements.length === 1) {
      map.setView(etablissements[0].coordonnees, 12);
      return;
    }
    const bounds = L.latLngBounds(
      etablissements.map((e) => e.coordonnees as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
  }, [map, etablissements]);
  return null;
}

export default function LeafletMap({
  etablissements,
  etablissementSelectionne,
  onSelectEtablissement,
}: LeafletMapProps) {
  const icon = useRef(createIcon()).current;

  const renderPopup = useCallback(
    (e: Etablissement) => (
      <Popup>
        <div className="p-1 min-w-[200px]">
          <h3 className="font-semibold text-slate-800">{e.nom}</h3>
          <p className="text-sm text-slate-600">{e.ville}</p>
          <ul className="mt-2 text-xs space-y-1 text-slate-700">
            <li>Insertion pro : <strong>{e.indicateurs.tauxInsertion}%</strong></li>
            <li>Recherche emploi : <strong>{e.indicateurs.tauxRechercheEmploi}%</strong></li>
            <li>Réussite bac : <strong>{e.indicateurs.tauxReussiteBac}%</strong></li>
          </ul>
          <button
            type="button"
            onClick={() => onSelectEtablissement(e)}
            className="mt-2 w-full py-1.5 px-2 text-xs font-medium rounded bg-primary-500 text-white hover:bg-primary-600"
          >
            Voir les indicateurs
          </button>
        </div>
      </Popup>
    ),
    [onSelectEtablissement]
  );

  return (
    <LeafletMapContainer
      center={CENTER_FRANCE}
      zoom={ZOOM}
      className="w-full h-full min-h-[400px] z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds etablissements={etablissements} />
      {etablissements.map((e) => (
        <Marker
          key={e.id}
          position={e.coordonnees}
          icon={icon}
          eventHandlers={{
            click: () => onSelectEtablissement(etablissementSelectionne?.id === e.id ? null : e),
          }}
        >
          {renderPopup(e)}
        </Marker>
      ))}
    </LeafletMapContainer>
  );
}
