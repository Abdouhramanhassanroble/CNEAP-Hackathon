import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingDown, TrendingUp, RotateCcw, Sparkles, Loader2, BarChart3, Target, Gauge } from 'lucide-react';

export interface LyceeSeries {
  year: number;
  actual: number | null;
  baseline: number | null;
  scenario: number | null;
}

export interface LyceeMetrics {
  pente_annuelle: number;
  mape: number;
  captation_2018: number;
  captation_2025: number;
  delta_captation_points: number;
  seuil_critique: number;
}

export interface LyceeInfo {
  id: string;
  name: string;
  departement_code: string;
  lat: number;
  lng: number;
}

export interface LyceeData {
  lycee: LyceeInfo;
  metrics: LyceeMetrics;
  series: LyceeSeries[];
}

interface Props {
  data: LyceeData;
}

export const LyceePanel = ({ data }: Props) => {
  const { lycee, metrics, series: initialSeries } = data;
  const [series, setSeries] = useState(initialSeries);
  const [delta, setDelta] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [analysis, setAnalysis] = useState<{ diagnostic: string; scenario: string | null } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    setSeries(initialSeries);
    setDelta(0);
    setAnalysis(null);
  }, [initialSeries]);

  const runAnalysis = useCallback(async () => {
    setAnalysisLoading(true);
    try {
      const res = await fetch(`/api/lycees/${lycee.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta_attractivite: delta / 100 }),
      });
      if (!res.ok) throw new Error();
      setAnalysis(await res.json());
    } catch {
      setAnalysis({ diagnostic: 'Analyse indisponible. Vérifiez que le proxy IA est lancé.', scenario: null });
    } finally {
      setAnalysisLoading(false);
    }
  }, [lycee.id, delta]);

  const simulate = useCallback((newDelta: number) => {
    setDelta(newDelta);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/lycees/${lycee.id}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta_attractivite: newDelta / 100 }),
        });
        if (!res.ok) return;
        const result = await res.json();
        setSeries(prev => prev.map(s => {
          const match = result.scenario.find((r: { year: number }) => r.year === s.year);
          return match ? { ...s, scenario: match.scenario } : s;
        }));
      } catch {
        setSeries(prev => prev.map(s =>
          s.actual === null
            ? { ...s, scenario: Math.round((s.baseline ?? 0) * (1 + newDelta / 100)) }
            : s
        ));
      }
    }, 250);
  }, [lycee.id]);

  const reset = () => { simulate(0); setDelta(0); };

  const effActuel = series.filter(s => s.actual !== null).slice(-1)[0]?.actual ?? 0;
  const effProj = series.filter(s => s.actual === null).slice(-1)[0]?.baseline ?? 0;
  const Trend = metrics.pente_annuelle >= 0 ? TrendingUp : TrendingDown;
  const trendColor = metrics.pente_annuelle >= 0 ? '#2D6A4F' : '#DC2626';
  const evolution = effActuel > 0 ? ((effProj - effActuel) / effActuel * 100).toFixed(1) : '0';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Métriques — cartes horizontales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: <BarChart3 size={15} />, label: 'Effectif 2025', value: effActuel, color: '#2D6A4F' },
          { icon: <Target size={15} />, label: 'Projection 2028', value: effProj, color: '#D4A373' },
          { icon: <Trend size={15} />, label: 'Pente annuelle', value: `${metrics.pente_annuelle > 0 ? '+' : ''}${metrics.pente_annuelle}`, color: trendColor },
          { icon: <Gauge size={15} />, label: 'MAPE modèle', value: `${metrics.mape}%`, color: '#6B7280' },
          { icon: <TrendingDown size={15} />, label: 'Évol. 2025→2028', value: `${Number(evolution) > 0 ? '+' : ''}${evolution}%`, color: Number(evolution) >= 0 ? '#2D6A4F' : '#DC2626' },
        ].map(m => (
          <Card key={m.label} className="border-l-4" style={{ borderLeftColor: m.color }}>
            <CardContent className="p-3.5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                {m.icon}
                <span className="text-[10px] uppercase tracking-wider font-medium">{m.label}</span>
              </div>
              <div className="text-2xl font-light tabular-nums" style={{ fontFamily: 'Fraunces, serif', color: m.color }}>
                {m.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Captation */}
      <div className="flex items-center gap-4 px-2 py-2 bg-muted/30 rounded-lg">
        <span className="text-xs text-muted-foreground font-medium">Taux de captation</span>
        <div className="flex items-center gap-1.5">
          <Trend size={13} style={{ color: trendColor }} />
          <span className="text-sm font-medium" style={{ color: trendColor }}>
            {metrics.captation_2018}% → {metrics.captation_2025}%
          </span>
          <span className="text-xs text-muted-foreground">
            ({metrics.delta_captation_points > 0 ? '+' : ''}{metrics.delta_captation_points} pts)
          </span>
        </div>
      </div>

      {/* Graphe + Slider côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Graphe — 2/3 */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5 pt-6">
            <h3 className="text-sm font-medium mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Effectifs 2018–2028
            </h3>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={series} margin={{ top: 5, right: 25, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fontFamily: 'Outfit' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Outfit' }} domain={['dataMin - 30', 'dataMax + 30']} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, fontFamily: 'Outfit', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string) => [value, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Outfit', paddingTop: 10 }} />
                <ReferenceLine x={2025} stroke="#999" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Projection →', position: 'top', fontSize: 10, fill: '#999' }} />
                <Line type="monotone" dataKey="actual" stroke="#2D6A4F" strokeWidth={3} name="Historique"
                  dot={{ r: 4, fill: '#2D6A4F', strokeWidth: 2, stroke: 'white' }} connectNulls={false} />
                <Line type="monotone" dataKey="baseline" stroke="#D4A373" strokeWidth={2.5} strokeDasharray="8 4" name="Baseline ML"
                  dot={{ r: 3 }} connectNulls />
                {delta !== 0 && (
                  <Line type="monotone" dataKey="scenario" stroke="#7C3AED" strokeWidth={2.5} strokeDasharray="4 2" name="Scénario"
                    dot={{ r: 3, fill: '#7C3AED' }} connectNulls />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Panneau droit — Slider + bouton IA */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                Simulation attractivité
              </h3>
              <div className="text-center py-3">
                <div className="text-3xl font-light tabular-nums" style={{ fontFamily: 'Fraunces, serif', color: delta > 0 ? '#2D6A4F' : delta < 0 ? '#DC2626' : '#6B7280' }}>
                  {delta === 0 ? 'Attractivité actuelle' : `${delta > 0 ? '+' : ''}${delta}%`}
                </div>
                {delta !== 0 && (
                  <button onClick={reset} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto">
                    <RotateCcw size={11} /> Réinitialiser
                  </button>
                )}
              </div>
              <Slider
                value={[delta]}
                onValueChange={v => simulate(v[0])}
                min={-20}
                max={40}
                step={5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>-20%</span>
                <span>+40%</span>
              </div>
              {delta !== 0 && (
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 space-y-1">
                  {series.filter(s => s.actual === null).map(s => (
                    <div key={s.year} className="flex justify-between">
                      <span>{s.year}</span>
                      <span>
                        <span className="text-muted-foreground">{s.baseline}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium" style={{ color: (s.scenario ?? 0) >= (s.baseline ?? 0) ? '#2D6A4F' : '#DC2626' }}>
                          {s.scenario}
                        </span>
                        <span className="ml-1 text-[10px]">
                          ({(s.scenario ?? 0) - (s.baseline ?? 0) >= 0 ? '+' : ''}{(s.scenario ?? 0) - (s.baseline ?? 0)})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bouton analyse IA */}
          <button
            onClick={runAnalysis}
            disabled={analysisLoading}
            className="w-full flex items-center justify-center gap-2.5 text-sm font-medium px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-white hover:from-emerald-800 hover:to-emerald-900 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-wait"
          >
            {analysisLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {analysisLoading ? 'Analyse en cours...' : 'Analyser avec IA'}
          </button>
        </div>
      </div>

      {/* Résultat analyse IA */}
      {analysis && (
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Analyse IA</h3>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Diagnostic</h4>
              <div className="text-sm leading-relaxed whitespace-pre-line">{analysis.diagnostic}</div>
            </div>
            {analysis.scenario && (
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-2">
                  Scénario ({delta > 0 ? '+' : ''}{delta}%)
                </h4>
                <div className="text-sm leading-relaxed whitespace-pre-line">{analysis.scenario}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
