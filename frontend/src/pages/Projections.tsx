import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
  ScatterChart, Scatter, ZAxis, Cell, ReferenceArea
} from 'recharts';
import {
  AlertTriangle, AlertCircle, CheckCircle, Info,
  ChevronDown, ChevronUp, ArrowRight, SlidersHorizontal,
  RotateCcw, TrendingDown, BrainCircuit
} from 'lucide-react';
import { alertes, riskMatrixData, featureImportance } from '@/data/mockData';

/* ── Modèle de projection ── */
const DEFAULTS = { horizon: 5, poidsDemographie: 45, poidsHistorique: 25, poidsAttractivite: 15, poidsAgricole: 10, croissanceExterne: 0 };

function computeProjection(p: typeof DEFAULTS) {
  const base = 847;
  const rate = -0.028 * (p.poidsDemographie / 45) - 0.015 * (p.poidsHistorique / 25)
    - 0.01 * (p.poidsAttractivite / 15) - 0.005 * (p.poidsAgricole / 10) + p.croissanceExterne / 100;
  return Array.from({ length: p.horizon + 1 }, (_, i) => ({
    year: String(2025 + i),
    optimiste: Math.round(base * Math.pow(1 + rate * 0.5, i)),
    median: Math.round(base * Math.pow(1 + rate, i)),
    pessimiste: Math.round(base * Math.pow(1 + rate * 1.5, i)),
  }));
}

const sevIcon = { red: AlertTriangle, orange: AlertCircle, yellow: Info, green: CheckCircle };
const sevColor = { red: '#DC2626', orange: '#D4A373', yellow: '#CA8A04', green: '#2D6A4F' };

const Projections = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [showSim, setShowSim] = useState(false);

  /* Simulator state */
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [poidsDemographie, setPoidsDemographie] = useState(DEFAULTS.poidsDemographie);
  const [poidsHistorique, setPoidsHistorique] = useState(DEFAULTS.poidsHistorique);
  const [poidsAttractivite, setPoidsAttractivite] = useState(DEFAULTS.poidsAttractivite);
  const [poidsAgricole, setPoidsAgricole] = useState(DEFAULTS.poidsAgricole);
  const [croissanceExterne, setCroissanceExterne] = useState(DEFAULTS.croissanceExterne);

  const projData = useMemo(() => computeProjection({ horizon, poidsDemographie, poidsHistorique, poidsAttractivite, poidsAgricole, croissanceExterne }),
    [horizon, poidsDemographie, poidsHistorique, poidsAttractivite, poidsAgricole, croissanceExterne]);

  const last = projData[projData.length - 1];
  const delta = ((last.median - 847) / 847 * 100).toFixed(1);
  const totalPoids = poidsDemographie + poidsHistorique + poidsAttractivite + poidsAgricole;

  const resetSim = () => { setHorizon(DEFAULTS.horizon); setPoidsDemographie(DEFAULTS.poidsDemographie); setPoidsHistorique(DEFAULTS.poidsHistorique); setPoidsAttractivite(DEFAULTS.poidsAttractivite); setPoidsAgricole(DEFAULTS.poidsAgricole); setCroissanceExterne(DEFAULTS.croissanceExterne); };

  const filtered = filter === 'all' ? alertes : alertes.filter(a => a.severity === filter);
  const counts = { red: alertes.filter(a => a.severity === 'red').length, orange: alertes.filter(a => a.severity === 'orange').length, yellow: alertes.filter(a => a.severity === 'yellow').length, green: alertes.filter(a => a.severity === 'green').length };

  return (
    <div className="animate-fade-in">
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-4">
        <h1 className="text-3xl tracking-tight mb-2">Projections & Risques</h1>
        <p className="text-muted-foreground mb-8" style={{ fontWeight: 300 }}>
          Modèle prospectif, simulateur de scénarios, alertes et matrice de risques
        </p>
      </section>

      {/* ═══ CHART + SIMULATOR ═══ */}
      <section className="max-w-6xl mx-auto px-6">
        {/* Simulator toggle */}
        <button
          onClick={() => setShowSim(s => !s)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm mb-5 transition-all ${
            showSim ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border text-muted-foreground hover:border-muted-foreground/30'
          }`}
        >
          <SlidersHorizontal size={15} />
          Simulateur de scénarios
          {showSim ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className={`grid gap-6 ${showSim ? 'grid-cols-3' : 'grid-cols-3'}`}>
          {/* Simulator panel (collapsible) */}
          {showSim && (
            <Card className="animate-fade-in">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Paramètres</h3>
                  <button onClick={resetSim} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCcw size={11} /> Réinit.
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span>Horizon</span><span className="font-medium tabular-nums">{horizon} ans</span></div>
                  <Slider value={[horizon]} onValueChange={v => setHorizon(v[0])} max={10} min={3} step={1} />
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Pondération des facteurs</p>
                  {[
                    { label: 'Démographie', val: poidsDemographie, set: setPoidsDemographie, max: 80 },
                    { label: 'Historique', val: poidsHistorique, set: setPoidsHistorique, max: 60 },
                    { label: 'Attractivité', val: poidsAttractivite, set: setPoidsAttractivite, max: 50 },
                    { label: 'Agriculture', val: poidsAgricole, set: setPoidsAgricole, max: 40 },
                  ].map(s => (
                    <div key={s.label} className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs"><span>{s.label}</span><span className="font-medium tabular-nums">{s.val}%</span></div>
                      <Slider value={[s.val]} onValueChange={v => s.set(v[0])} max={s.max} min={0} step={5} />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${totalPoids === 100 ? 'bg-primary' : 'bg-destructive'}`}
                        style={{ width: `${Math.min(totalPoids, 100)}%` }} />
                    </div>
                    <span className={`text-[11px] font-medium tabular-nums ${totalPoids === 100 ? 'text-primary' : 'text-destructive'}`}>{totalPoids}%</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-1">
                  <div className="flex justify-between text-xs"><span>Croissance externe</span><span className="font-medium tabular-nums">{croissanceExterne > 0 ? '+' : ''}{croissanceExterne}%</span></div>
                  <Slider value={[croissanceExterne]} onValueChange={v => setCroissanceExterne(v[0])} max={5} min={-3} step={0.5} />
                  <p className="text-[10px] text-muted-foreground">Nouvelles filières, communication, partenariats…</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart */}
          <Card className={showSim ? 'col-span-2' : 'col-span-2'}>
            <CardContent className="p-6 pt-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {showSim ? 'Résultat de la simulation' : 'Trois scénarios d\'évolution'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
                    Effectifs réseau — 2025 à {2025 + horizon}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown size={14} className="text-destructive" />
                  <span className="text-sm font-medium" style={{ color: Number(delta) < -15 ? '#DC2626' : Number(delta) < -5 ? '#D4A373' : '#2D6A4F' }}>
                    {delta}% sur {horizon} ans
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={projData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fontFamily: 'Outfit' }} axisLine={{ stroke: 'hsl(40 15% 88%)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Outfit' }} domain={['dataMin - 50', 'dataMax + 30']} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, fontFamily: 'Outfit', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Outfit', paddingTop: 12 }} />
                  <ReferenceLine y={650} stroke="#DC2626" strokeDasharray="8 4" strokeWidth={1.5}
                    label={{ value: 'Zone critique', position: 'right', fontSize: 10, fill: '#DC2626', fontFamily: 'Outfit' }} />
                  <Area type="monotone" dataKey="optimiste" stroke="#2D6A4F" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Optimiste" />
                  <Area type="monotone" dataKey="median" stroke="#2D6A4F" fill="url(#gradSim)" strokeWidth={2.5} name="Médian" dot={{ r: 3, fill: '#2D6A4F' }} />
                  <Area type="monotone" dataKey="pessimiste" stroke="#DC2626" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Pessimiste" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Explainability — always visible */}
          {!showSim && (
            <Card>
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Pourquoi cette baisse ?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontWeight: 300 }}>
                    Chute démographique 2010–2015 dans le bassin de recrutement et baisse tendancielle de l'attractivité CAPA.
                  </p>
                </div>
                <div className="space-y-2.5">
                  {featureImportance.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-28 text-muted-foreground text-xs truncate">{f.factor}</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${f.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-medium">{f.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xl font-light" style={{ fontFamily: 'Fraunces, serif', color: '#2D6A4F' }}>{last.optimiste}</div>
                    <div className="text-[10px] text-muted-foreground">Optimiste</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-xl font-light" style={{ fontFamily: 'Fraunces, serif' }}>{last.median}</div>
                    <div className="text-[10px] text-muted-foreground">Médian</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-light" style={{ fontFamily: 'Fraunces, serif', color: '#DC2626' }}>{last.pessimiste}</div>
                    <div className="text-[10px] text-muted-foreground">Pessimiste</div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">Fiabilité : 78 % — MAPE ±8,2 %</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Result cards when simulator is open */}
        {showSim && (
          <div className="grid grid-cols-3 gap-4 mt-4 animate-fade-in">
            <Card className="bg-emerald-50/50">
              <CardContent className="p-4 text-center">
                <p className="text-[11px] text-muted-foreground mb-0.5">Optimiste</p>
                <div className="text-2xl font-light" style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2D6A4F' }}>{last.optimiste}</div>
                <p className="text-xs text-muted-foreground">{((last.optimiste - 847) / 847 * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/[0.03] border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-[11px] text-muted-foreground mb-0.5">Médian</p>
                <div className="text-2xl font-light" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{last.median}</div>
                <p className="text-xs font-medium" style={{ color: Number(delta) < -10 ? '#DC2626' : '#D4A373' }}>{delta}%</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50/50">
              <CardContent className="p-4 text-center">
                <p className="text-[11px] text-muted-foreground mb-0.5">Pessimiste</p>
                <div className="text-2xl font-light" style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#DC2626' }}>{last.pessimiste}</div>
                <p className="text-xs text-muted-foreground">{((last.pessimiste - 847) / 847 * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* ═══ ALERTS ═══ */}
      <section className="max-w-6xl mx-auto px-6 mt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl tracking-tight">Alertes</h2>
          <div className="flex gap-2">
            {(['red', 'orange', 'yellow', 'green'] as const).map(s => (
              <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${filter === s ? 'border-current font-medium' : 'border-border text-muted-foreground'}`}
                style={filter === s ? { borderColor: sevColor[s], color: sevColor[s] } : {}}>
                <span className={`dot dot-${s}`} style={{ width: 7, height: 7 }} /> {counts[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map(a => {
            const Icon = sevIcon[a.severity];
            const open = expanded === a.id;
            return (
              <Card key={a.id} className={`severity-${a.severity}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(open ? null : a.id)}>
                    <Icon size={15} style={{ color: sevColor[a.severity] }} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{a.title}</span>
                      <span className="text-xs text-muted-foreground ml-3">{a.etablissement}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-normal flex-shrink-0">{a.categorie}</Badge>
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {open && (
                    <div className="mt-3 ml-7 space-y-2 animate-fade-in">
                      <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontWeight: 300 }}>{a.description}</p>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40">
                        <ArrowRight size={12} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm"><span className="font-medium">Recommandation :</span> {a.recommandation}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ═══ RISK MATRIX ═══ */}
      <section className="max-w-6xl mx-auto px-6 mt-14">
        <div className="mb-6">
          <h2 className="text-2xl tracking-tight mb-1">Matrice des risques</h2>
          <p className="text-muted-foreground" style={{ fontWeight: 300 }}>Probabilité × Impact — taille proportionnelle au nombre d'élèves</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart margin={{ top: 10, right: 40, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" />
                <XAxis type="number" dataKey="probabilite" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'Outfit' }}
                  label={{ value: 'Probabilité (%)', position: 'bottom', fontSize: 11, fontFamily: 'Outfit' }} />
                <YAxis type="number" dataKey="impact" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'Outfit' }}
                  label={{ value: 'Impact', angle: -90, position: 'left', fontSize: 11, fontFamily: 'Outfit' }} />
                <ZAxis type="number" dataKey="eleves" range={[60, 350]} />
                <ReferenceArea x1={50} y1={50} x2={100} y2={100} fill="#DC2626" fillOpacity={0.04} label={{ value: 'Agir', fontSize: 10, fill: '#DC2626' }} />
                <ReferenceArea x1={0} y1={50} x2={50} y2={100} fill="#D4A373" fillOpacity={0.03} />
                <ReferenceArea x1={50} y1={0} x2={100} y2={50} fill="#CA8A04" fillOpacity={0.03} />
                <ReferenceArea x1={0} y1={0} x2={50} y2={50} fill="#2D6A4F" fillOpacity={0.03} />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-card p-3 rounded-lg border shadow-sm text-xs" style={{ fontFamily: 'Outfit' }}>
                      <div className="font-medium mb-1">{d.name}</div>
                      <div>Probabilité : {d.probabilite} %</div>
                      <div>Impact : {d.impact}/100</div>
                      {d.eleves > 0 && <div>Élèves : {d.eleves}</div>}
                    </div>
                  );
                }} />
                <Scatter data={riskMatrixData}>
                  {riskMatrixData.map((e, i) => {
                    const c = e.categorie === 'Formation' ? '#2D6A4F' : e.categorie === 'Territoire' ? '#D4A373' : e.categorie === 'RH' ? '#7C3AED' : '#CA8A04';
                    return <Cell key={i} fill={c} fillOpacity={0.7} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-5 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#2D6A4F' }} /> Formation</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#D4A373' }} /> Territoire</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#7C3AED' }} /> RH</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#CA8A04' }} /> Investissement</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Projections;
