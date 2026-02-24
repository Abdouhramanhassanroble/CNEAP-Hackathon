import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

export interface LyceeMarker {
  id: string;
  name: string;
  departement_code: string;
  departement_nom: string;
  region: string;
  lat: number;
  lng: number;
  hasRealData: boolean;
  effectif_actuel: number;
}

// Fallback mock si l'API est injoignable
const MOCK_MARKERS: LyceeMarker[] = [
  { id: 'etablieres', name: 'Établières', departement_code: '85', departement_nom: 'Vendée', region: 'Pays de la Loire', lat: 46.6706, lng: -1.4267, hasRealData: false, effectif_actuel: 468 },
  { id: 'heermont', name: 'Heermont', departement_code: '53', departement_nom: 'Mayenne', region: 'Pays de la Loire', lat: 47.8267, lng: -0.7020, hasRealData: false, effectif_actuel: 379 },
];

const DEP_COLORS: Record<string, string> = {
  '44': '#2563EB', '49': '#7C3AED', '53': '#D4A373', '72': '#059669', '85': '#2D6A4F',
};

interface TerritoireMapProps {
  height?: number;
  className?: string;
  showControls?: boolean;
  lycees?: LyceeMarker[];
  selectedId?: string | null;
  onLyceeClick?: (id: string) => void;
}

export const TerritoireMap = ({
  height = 540,
  className = '',
  showControls = true,
  lycees,
  selectedId,
  onLyceeClick,
}: TerritoireMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const markers = lycees ?? MOCK_MARKERS;

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { center: [47.35, -0.85], zoom: 8, zoomControl: false, scrollWheelZoom: true });
    mapInstanceRef.current = map;
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OSM © CARTO', subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);

    return () => { map.remove(); mapInstanceRef.current = null; markersRef.current = null; };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    markers.forEach(m => {
      const color = DEP_COLORS[m.departement_code] || '#6B7280';
      const isSelected = m.id === selectedId;
      const size = isSelected ? 54 : 42;
      const borderW = isSelected ? 4 : 3;

      L.marker([m.lat, m.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:${color};color:white;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:${isSelected ? 16 : 13}px;font-family:Fraunces,Georgia,serif;box-shadow:0 4px 16px ${color}44${isSelected ? ',0 0 0 3px white,0 0 0 6px ' + color : ''};border:${borderW}px solid white;cursor:pointer;transition:all .2s;">${m.effectif_actuel}</div>`,
          iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        }),
      })
      .on('click', () => onLyceeClick?.(m.id))
      .bindTooltip(`<strong>${m.name}</strong><br/>Dép. ${m.departement_code} — ${m.effectif_actuel} élèves`, { direction: 'top', offset: [0, -20] })
      .addTo(layer);

      if (showLabels) {
        L.marker([m.lat, m.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="text-align:center;font-size:10px;font-weight:500;color:${color};pointer-events:none;text-shadow:0 1px 4px rgba(255,255,255,1);font-family:Outfit,sans-serif;white-space:nowrap;">${m.name}</div>`,
            iconSize: [120, 16], iconAnchor: [60, -8],
          }), interactive: false,
        }).addTo(layer);
      }
    });

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.3));
    }
  }, [markers, selectedId, showLabels, onLyceeClick]);

  // Départements uniques pour la légende
  const deps = [...new Map(markers.map(m => [m.departement_code, { code: m.departement_code, nom: m.departement_nom }])).values()];

  return (
    <div className={`relative ${className}`}>
      {showControls && (
        <div className="absolute top-3 left-3 z-[1000] flex gap-2">
          <button onClick={() => setShowLabels(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all ${showLabels ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 'bg-white/80 border-border text-muted-foreground'}`}>
            Noms
          </button>
        </div>
      )}
      <div ref={mapRef} style={{ height }} className="w-full" />
      {showControls && (
        <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-3 text-[10px] text-foreground bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-sm border border-border/50 flex-wrap">
          {deps.map(d => (
            <span key={d.code} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: DEP_COLORS[d.code] || '#6B7280' }} />
              {d.nom}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
