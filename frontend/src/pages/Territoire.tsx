import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin, X } from 'lucide-react';
import { TerritoireMap, LyceeMarker } from '@/components/TerritoireMap';
import { LyceePanel, LyceeData } from '@/components/LyceePanel';

const Territoire = () => {
  const [lycees, setLycees] = useState<LyceeMarker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lyceeData, setLyceeData] = useState<LyceeData | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // API en local, fallback JSON statique en prod (Vercel n'a pas le backend)
    fetch('/api/lycees')
      .then(r => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : Promise.reject()))
      .then(setLycees)
      .catch(() => fetch('/data/lycees_list.json').then(r => r.json()).then(setLycees).catch(() => setLycees([])));
  }, []);

  const handleClick = useCallback(async (id: string) => {
    setSelectedId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/lycees/${id}`);
      if (res.ok && res.headers.get('content-type')?.includes('json')) {
        setLyceeData(await res.json());
        return;
      }
      throw new Error();
    } catch {
      // Fallback prod : charger lycees_data.json et extraire par id
      try {
        const all = await fetch('/data/lycees_data.json').then(r => r.json());
        setLyceeData(all[id] || null);
      } catch {
        setLyceeData(null);
      }
    } finally {
      setLoading(false);
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, []);

  const handleClose = () => { setSelectedId(null); setLyceeData(null); };

  const selectedLycee = lycees.find(l => l.id === selectedId);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-3">
        <h1 className="text-3xl tracking-tight mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          Territoire
        </h1>
        <p className="text-muted-foreground text-sm" style={{ fontWeight: 300 }}>
          22 lycées CNEAP Pays de la Loire — Cliquez sur un établissement pour explorer ses données
        </p>
      </section>

      {/* Carte pleine largeur */}
      <section className="max-w-7xl mx-auto px-6 pb-4">
        <Card className="overflow-hidden shadow-lg">
          <TerritoireMap
            height={selectedId ? 420 : 560}
            showControls
            lycees={lycees}
            selectedId={selectedId}
            onLyceeClick={handleClick}
          />
        </Card>
      </section>

      {/* Panneau lycée sélectionné */}
      {(loading || lyceeData) && (
        <section ref={panelRef} className="max-w-7xl mx-auto px-6 pb-12">
          {/* Barre titre du lycée */}
          {selectedLycee && (
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {selectedLycee.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedLycee.departement_nom} ({selectedLycee.departement_code}) — {selectedLycee.effectif_actuel} élèves en 2025
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:bg-muted/50"
              >
                <X size={12} /> Fermer
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="animate-spin mr-2" size={18} /> Chargement des données...
            </div>
          )}

          {!loading && lyceeData && (
            <LyceePanel data={lyceeData} />
          )}
        </section>
      )}

      {/* Message d'aide quand rien n'est sélectionné */}
      {!selectedId && !loading && (
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <div className="text-center py-8 text-muted-foreground">
            <MapPin size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Sélectionnez un lycée sur la carte</p>
            <p className="text-xs mt-1">pour voir les effectifs, projections ML et simuler l'attractivité</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Territoire;
