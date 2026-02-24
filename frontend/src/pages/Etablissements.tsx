import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, GraduationCap, BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { etablissements, TYPE_LABELS, TYPE_COLORS, type Etablissement, type Formation } from '@/data/etablissements';

const departments = [
  { code: 'all', label: 'Tous les départements' },
  { code: '44', label: 'Loire-Atlantique (44)' },
  { code: '49', label: 'Maine-et-Loire (49)' },
  { code: '53', label: 'Mayenne (53)' },
  { code: '72', label: 'Sarthe (72)' },
  { code: '85', label: 'Vendée (85)' },
];

const FormationBadge = ({ f }: { f: Formation }) => (
  <span
    className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-normal"
    style={{ borderColor: TYPE_COLORS[f.type] + '40', color: TYPE_COLORS[f.type], background: TYPE_COLORS[f.type] + '08' }}
  >
    {f.nom}
  </span>
);

const EtabCard = ({ etab }: { etab: Etablissement }) => {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => {
    const g: Record<Formation['type'], Formation[]> = { initiale: [], apprentissage: [], continue: [], superieur: [] };
    etab.formations.forEach(f => g[f.type].push(f));
    return g;
  }, [etab.formations]);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: etab.color }}>
      <CardContent className="p-0">
        {/* Header cliquable */}
        <button onClick={() => setOpen(v => !v)} className="w-full text-left p-5 hover:bg-muted/20 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-medium truncate" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {etab.nom}
                </h3>
                <Badge variant="outline" className="text-[10px] shrink-0" style={{ borderColor: etab.color + '60', color: etab.color }}>
                  {etab.departement_code}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin size={11} /> {etab.ville} — {etab.adresse}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {etab.specialites.map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-lg font-light tabular-nums" style={{ fontFamily: 'Fraunces, serif', color: etab.color }}>
                  {etab.formations.length}
                </div>
                <div className="text-[10px] text-muted-foreground">formations</div>
              </div>
              {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>
          </div>
        </button>

        {/* Détail formations */}
        {open && (
          <div className="px-5 pb-5 pt-0 border-t border-border animate-fade-in">
            <div className="space-y-4 mt-4">
              {(Object.keys(grouped) as Formation['type'][]).map(type => {
                const list = grouped[type];
                if (list.length === 0) return null;
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>
                        {TYPE_LABELS[type]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({list.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 ml-4">
                      {list.map((f, i) => <FormationBadge key={i} f={f} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Etablissements = () => {
  const [depFilter, setDepFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = etablissements;
    if (depFilter !== 'all') list = list.filter(e => e.departement_code === depFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.nom.toLowerCase().includes(q) ||
        e.ville.toLowerCase().includes(q) ||
        e.specialites.some(s => s.toLowerCase().includes(q)) ||
        e.formations.some(f => f.nom.toLowerCase().includes(q))
      );
    }
    return list;
  }, [depFilter, search]);

  const depCounts = useMemo(() => {
    const c: Record<string, number> = {};
    etablissements.forEach(e => { c[e.departement_code] = (c[e.departement_code] || 0) + 1; });
    return c;
  }, []);

  const totalFormations = useMemo(() => filtered.reduce((acc, e) => acc + e.formations.length, 0), [filtered]);

  return (
    <div className="animate-fade-in">
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-3">
        <h1 className="text-3xl tracking-tight mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          Établissements
        </h1>
        <p className="text-muted-foreground text-sm mb-6" style={{ fontWeight: 300 }}>
          {etablissements.length} établissements CNEAP Pays de la Loire — Formations initiales, apprentissage et continues
        </p>

        {/* Stats rapides */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {departments.slice(1).map(d => (
            <button
              key={d.code}
              onClick={() => setDepFilter(depFilter === d.code ? 'all' : d.code)}
              className={`p-3 rounded-lg border text-center transition-all ${depFilter === d.code ? 'border-current shadow-sm bg-muted/30' : 'border-border hover:border-muted-foreground/30'}`}
            >
              <div className="text-xl font-light tabular-nums" style={{ fontFamily: 'Fraunces, serif' }}>
                {depCounts[d.code] || 0}
              </div>
              <div className="text-[10px] text-muted-foreground">{d.label.split(' (')[0]}</div>
            </button>
          ))}
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un établissement, une ville ou une formation..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <GraduationCap size={14} />
            <span>{filtered.length} établissements — {totalFormations} formations</span>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="space-y-3">
          {filtered.map(etab => <EtabCard key={etab.id} etab={etab} />)}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen size={28} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun établissement trouvé</p>
              <p className="text-xs mt-1">Modifiez vos critères de recherche</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Etablissements;
