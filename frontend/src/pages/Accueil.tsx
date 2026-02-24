import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, TrendingUp, GraduationCap, Target } from 'lucide-react';
import { TerritoireMap, LyceeMarker } from '@/components/TerritoireMap';
import { Link } from 'react-router-dom';
import { etablissements, TYPE_COLORS, TYPE_LABELS, type Formation } from '@/data/etablissements';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LyceeDataEntry {
  lycee: { id: string; name: string; departement_code: string };
  metrics: { pente_annuelle: number; captation_2025: number };
  series: { year: number; actual: number | null; baseline: number | null }[];
}

const DEP_POP_15_19: Record<string, number> = {
  '44': 95430, '49': 58272, '53': 19468, '72': 36937, '85': 40887,
};
const DEP_NAMES: Record<string, string> = {
  '44': 'Loire-Atlantique', '49': 'Maine-et-Loire', '53': 'Mayenne', '72': 'Sarthe', '85': 'Vendée',
};
const DEP_COLORS: Record<string, string> = {
  '44': '#2563EB', '49': '#7C3AED', '53': '#D4A373', '72': '#059669', '85': '#2D6A4F',
};

const Accueil = () => {
  const [lycees, setLycees] = useState<LyceeMarker[]>([]);
  const [lyceesData, setLyceesData] = useState<Record<string, LyceeDataEntry>>({});

  useEffect(() => {
    fetch('/api/lycees').then(r => r.json()).then(setLycees).catch(() => {});
    fetch('/data/lycees_data.json').then(r => r.json()).then(setLyceesData).catch(() => {});
  }, []);

  const totals = useMemo(() => {
    const entries = Object.values(lyceesData);
    if (entries.length === 0) return { eleves2025: 7239, proj2028: 7601, penteMoy: 2.8, captMoy: 0 };

    let e2025 = 0, p2028 = 0;
    const pentes: number[] = [];
    const capts: number[] = [];
    entries.forEach(d => {
      const actuals = d.series.filter(s => s.actual !== null);
      const baselines = d.series.filter(s => s.actual === null);
      if (actuals.length) e2025 += actuals[actuals.length - 1].actual!;
      if (baselines.length) p2028 += baselines[baselines.length - 1].baseline!;
      pentes.push(d.metrics.pente_annuelle);
      if (d.metrics.captation_2025) capts.push(d.metrics.captation_2025);
    });
    return {
      eleves2025: e2025,
      proj2028: p2028,
      penteMoy: +(pentes.reduce((a, b) => a + b, 0) / pentes.length).toFixed(1),
      captMoy: +(capts.reduce((a, b) => a + b, 0) / capts.length).toFixed(2),
    };
  }, [lyceesData]);

  const formationStats = useMemo(() => {
    const counts: Record<Formation['type'], number> = { initiale: 0, apprentissage: 0, continue: 0, superieur: 0 };
    etablissements.forEach(e => e.formations.forEach(f => counts[f.type]++));
    return (Object.keys(counts) as Formation['type'][]).map(type => ({
      type,
      label: TYPE_LABELS[type],
      count: counts[type],
      color: TYPE_COLORS[type],
    }));
  }, []);

  const depStats = useMemo(() => {
    return Object.entries(DEP_NAMES).map(([code, nom]) => {
      const nbLycees = lycees.filter(l => l.departement_code === code).length || etablissements.filter(e => e.departement_code === code).length;
      const totalEff = lycees.filter(l => l.departement_code === code).reduce((s, l) => s + l.effectif_actuel, 0);
      return { code, nom, nbLycees, totalEff, pop15_19: DEP_POP_15_19[code], color: DEP_COLORS[code] };
    });
  }, [lycees]);

  const evol = totals.eleves2025 > 0 ? ((totals.proj2028 - totals.eleves2025) / totals.eleves2025 * 100).toFixed(1) : '0';

  return (
    <div className="animate-fade-in">
      {/* Hero : Map avec overlay */}
      <section className="relative">
        <div className="absolute inset-0 z-[400] pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 pt-8">
            <div className="pointer-events-auto inline-block bg-white/88 backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-lg">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Observatoire Prospectif CNEAP</p>
              <h1 className="text-2xl md:text-3xl leading-tight tracking-tight mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                Enseignement agricole
                <span className="text-primary"> Pays de la Loire</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontWeight: 300 }}>
                22 établissements — Effectifs, projections ML et simulation d'attractivité
              </p>
            </div>
          </div>
        </div>
        <TerritoireMap height={480} showControls={false} lycees={lycees} onLyceeClick={() => {}} />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent z-[500] pointer-events-none" />
      </section>

      {/* Pancartes chiffres clés */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-[600]">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: <Users size={18} />, value: totals.eleves2025.toLocaleString(), label: 'Élèves 2025', sub: 'total réseau CNEAP', color: '#2D6A4F' },
            { icon: <Target size={18} />, value: totals.proj2028.toLocaleString(), label: 'Projetés 2028', sub: `${Number(evol) >= 0 ? '+' : ''}${evol}% (Ridge)`, color: '#D4A373' },
            { icon: <TrendingUp size={18} />, value: `${totals.penteMoy > 0 ? '+' : ''}${totals.penteMoy}`, label: 'Pente moyenne', sub: 'élèves/an par lycée', color: totals.penteMoy >= 0 ? '#2D6A4F' : '#DC2626' },
            { icon: <GraduationCap size={18} />, value: `${totals.captMoy}%`, label: 'Captation moy.', sub: 'taux moyen 2025', color: '#7C3AED' },
          ].map((f, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow bg-card/95 backdrop-blur-sm border-l-4" style={{ borderLeftColor: f.color }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">{f.icon}<span className="text-[10px] uppercase tracking-wider font-medium">{f.label}</span></div>
                <div className="text-3xl font-light tracking-tight tabular-nums" style={{ fontFamily: 'Fraunces, Georgia, serif', color: f.color }}>{f.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{f.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboard par département */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-xl tracking-tight mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Par département</h2>
        <p className="text-xs text-muted-foreground mb-4">Population 15-19 ans (INSEE 2022) et effectifs CNEAP</p>
        <div className="grid grid-cols-5 gap-3">
          {depStats.map(d => (
            <Card key={d.code} className="hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: d.color }}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{d.nom}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{d.code}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pop. 15-19</span>
                    <span className="font-medium tabular-nums">{d.pop15_19.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lycées CNEAP</span>
                    <span className="font-medium">{d.nbLycees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Effectifs</span>
                    <span className="font-medium tabular-nums">{d.totalEff.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Captation</span>
                    <span className="font-medium tabular-nums" style={{ color: d.color }}>
                      {d.pop15_19 > 0 ? (d.totalEff / d.pop15_19 * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboard formations */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-xl tracking-tight mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Offre de formation</h2>
        <p className="text-xs text-muted-foreground mb-4">Répartition par type sur les 22 établissements</p>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <Card>
              <CardContent className="p-5 pt-6">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={formationStats} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" />
                    <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
                    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, fontFamily: 'Outfit' }} />
                    <Bar dataKey="count" name="Formations" radius={[0, 6, 6, 0]} barSize={28}>
                      {formationStats.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3">
            {formationStats.map(f => (
              <Card key={f.type} className="border-l-4" style={{ borderLeftColor: f.color }}>
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium">{f.label}</div>
                    <div className="text-[10px] text-muted-foreground">sur 22 établissements</div>
                  </div>
                  <div className="text-2xl font-light tabular-nums" style={{ fontFamily: 'Fraunces, serif', color: f.color }}>
                    {f.count}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation rapide */}
      <section className="max-w-7xl mx-auto px-6 mt-10 pb-12">
        <div className="grid grid-cols-3 gap-4">
          <Link to="/territoire">
            <Card className="group hover:shadow-md transition-all cursor-pointer border-primary/20 hover:border-primary/40 h-full">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Explorer la carte</h3>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>Carte interactive des 22 lycées</p>
                </div>
                <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/etablissements">
            <Card className="group hover:shadow-md transition-all cursor-pointer border-primary/20 hover:border-primary/40 h-full">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Fiches établissements</h3>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>22 lycées — formations détaillées</p>
                </div>
                <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/territoire">
            <Card className="group hover:shadow-md transition-all cursor-pointer border-primary/20 hover:border-primary/40 h-full">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Simulation IA</h3>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>Projections, scénarios et analyse IA</p>
                </div>
                <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Accueil;
