import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const etablissements = [
  { nom: 'Établières', ville: 'La Roche-sur-Yon', lat: 46.6706, lng: -1.4267, eleves: 468, color: '#2D6A4F', filieres: 9, score: 72 },
  { nom: 'Heermont', ville: 'Château-Gontier', lat: 47.8267, lng: -0.7020, eleves: 379, color: '#D4A373', filieres: 7, score: 64 },
];

const communes = [
  { nom: 'Nantes', lat: 47.2184, lng: -1.5536, pop: 2200 },
  { nom: 'Angers', lat: 47.4784, lng: -0.5632, pop: 1800 },
  { nom: 'Le Mans', lat: 48.0061, lng: 0.1996, pop: 1600 },
  { nom: 'La Roche-sur-Yon', lat: 46.6706, lng: -1.4267, pop: 1850 },
  { nom: 'Saint-Nazaire', lat: 47.2733, lng: -2.2138, pop: 1100 },
  { nom: 'Cholet', lat: 47.0596, lng: -0.8788, pop: 1420 },
  { nom: 'Laval', lat: 48.0735, lng: -0.7714, pop: 1150 },
  { nom: 'Saumur', lat: 47.2600, lng: -0.0773, pop: 600 },
  { nom: 'Les Herbiers', lat: 46.8690, lng: -1.0130, pop: 680 },
  { nom: 'Fontenay-le-Comte', lat: 46.4628, lng: -0.8066, pop: 520 },
  { nom: 'Ancenis', lat: 47.3663, lng: -1.1770, pop: 450 },
  { nom: 'Mayenne', lat: 48.3006, lng: -0.6161, pop: 380 },
  { nom: 'Luçon', lat: 46.4542, lng: -1.1681, pop: 320 },
  { nom: 'Château-Gontier', lat: 47.8267, lng: -0.7020, pop: 980 },
  { nom: 'Segré', lat: 47.6855, lng: -0.8695, pop: 350 },
  { nom: 'La Flèche', lat: 47.6975, lng: -0.0762, pop: 420 },
  { nom: 'Challans', lat: 46.8463, lng: -1.8752, pop: 550 },
  { nom: "Les Sables-d'Olonne", lat: 46.4969, lng: -1.7831, pop: 480 },
  { nom: 'Pornic', lat: 47.1130, lng: -2.1019, pop: 280 },
  { nom: 'Rezé', lat: 47.1894, lng: -1.5658, pop: 700 },
];

const km = (n: number) => n * 1000;

interface TerritoireMapProps {
  height?: number;
  className?: string;
  showControls?: boolean;
}

export const TerritoireMap = ({ height = 520, className = '', showControls = true }: TerritoireMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ heat: L.LayerGroup; zones: L.LayerGroup } | null>(null);
  const [showHeat, setShowHeat] = useState(true);
  const [showZones, setShowZones] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { center: [47.35, -0.85], zoom: 8, zoomControl: false, scrollWheelZoom: true });
    mapInstanceRef.current = map;
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OSM © CARTO', subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    const heat = L.layerGroup().addTo(map);
    const zones = L.layerGroup().addTo(map);
    const markers = L.layerGroup().addTo(map);
    layersRef.current = { heat, zones };

    // Heatmap
    communes.forEach(c => {
      L.circleMarker([c.lat, c.lng], {
        radius: Math.max(5, Math.sqrt(c.pop / 40)),
        fillColor: '#DC2626', fillOpacity: Math.min(0.6, 0.15 + c.pop / 3000),
        stroke: true, color: '#DC2626', weight: 1, opacity: 0.2,
      }).bindTooltip(`<strong>${c.nom}</strong><br/>Pop. 15-19 ans : ~${c.pop.toLocaleString('fr-FR')}`).addTo(heat);
    });

    // Zones
    etablissements.forEach(e => {
      L.circle([e.lat, e.lng], { radius: km(30), fillColor: e.color, fillOpacity: 0.03, stroke: true, color: e.color, weight: 1.5, dashArray: '8 6', opacity: 0.3 }).addTo(zones);
      L.circle([e.lat, e.lng], { radius: km(15), fillColor: e.color, fillOpacity: 0.07, stroke: true, color: e.color, weight: 2, dashArray: '4 4', opacity: 0.45 }).addTo(zones);
    });

    // Overlap
    const mid: [number, number] = [(etablissements[0].lat + etablissements[1].lat) / 2, (etablissements[0].lng + etablissements[1].lng) / 2];
    L.circle(mid, { radius: km(22), fillColor: '#DC2626', fillOpacity: 0.05, stroke: true, color: '#DC2626', weight: 1.5, dashArray: '5 5', opacity: 0.35 })
      .bindTooltip("<strong>Zone d'overlap</strong><br/>Bassin partagé ~62%").addTo(zones);

    // Markers
    etablissements.forEach(e => {
      L.marker([e.lat, e.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:${e.color};color:white;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:15px;font-family:Fraunces,Georgia,serif;box-shadow:0 4px 16px ${e.color}44;border:3px solid white;cursor:pointer;">${e.eleves}</div>`,
          iconSize: [48, 48], iconAnchor: [24, 24],
        }),
      }).bindPopup(`
        <div style="min-width:200px;font-family:Outfit,system-ui,sans-serif;padding:4px;">
          <h3 style="margin:0 0 4px;font-size:16px;font-weight:600;font-family:Fraunces,Georgia,serif;color:${e.color}">${e.nom}</h3>
          <p style="margin:0 0 10px;color:#7C8594;font-size:12px;">📍 ${e.ville}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
            <div style="padding:8px;background:#F9F7F4;border-radius:8px;"><div style="color:#7C8594;font-size:10px;">Élèves</div><div style="font-weight:600;font-size:18px;font-family:Fraunces,serif;">${e.eleves}</div></div>
            <div style="padding:8px;background:#F9F7F4;border-radius:8px;"><div style="color:#7C8594;font-size:10px;">Score viabilité</div><div style="font-weight:600;font-size:18px;font-family:Fraunces,serif;color:${e.score >= 70 ? '#2D6A4F' : '#D4A373'}">${e.score}</div></div>
          </div>
        </div>
      `, { maxWidth: 250 }).addTo(markers);

      L.marker([e.lat, e.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="text-align:center;font-size:12px;font-weight:500;color:${e.color};pointer-events:none;text-shadow:0 1px 6px rgba(255,255,255,1);font-family:Outfit,sans-serif;">${e.nom}</div>`,
          iconSize: [120, 20], iconAnchor: [60, -10],
        }), interactive: false,
      }).addTo(markers);
    });

    map.fitBounds(L.latLngBounds(etablissements.map(e => [e.lat, e.lng] as [number, number])).pad(0.6));

    return () => { map.remove(); mapInstanceRef.current = null; layersRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const l = layersRef.current;
    if (!map || !l) return;
    if (showHeat) {
      if (!map.hasLayer(l.heat)) map.addLayer(l.heat);
    } else {
      map.removeLayer(l.heat);
    }
    if (showZones) {
      if (!map.hasLayer(l.zones)) map.addLayer(l.zones);
    } else {
      map.removeLayer(l.zones);
    }
  }, [showHeat, showZones]);

  return (
    <div className={`relative ${className}`}>
      {showControls && (
        <div className="absolute top-3 left-3 z-[1000] flex gap-2">
          <button onClick={() => setShowHeat(h => !h)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all ${showHeat ? 'bg-red-50/90 border-red-200 text-red-700' : 'bg-white/80 border-border text-muted-foreground'}`}>
            <span className={`w-2 h-2 rounded-full ${showHeat ? 'bg-red-500' : 'bg-muted-foreground/30'}`} /> Démographie
          </button>
          <button onClick={() => setShowZones(z => !z)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all ${showZones ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 'bg-white/80 border-border text-muted-foreground'}`}>
            Zones de chalandise
          </button>
        </div>
      )}
      <div ref={mapRef} style={{ height }} className="w-full" />
      {showControls && (
        <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-3 text-[11px] text-foreground bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-sm border border-border/50">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#2D6A4F' }} /> Établières</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#D4A373' }} /> Heermont</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/60" /> Pop. 15-19</span>
        </div>
      )}
    </div>
  );
};
