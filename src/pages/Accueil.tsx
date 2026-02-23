import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, AlertTriangle, AlertCircle, CheckCircle, Info, X
} from 'lucide-react';
import { alertes } from '@/data/mockData';
import { TerritoireMap } from '@/components/TerritoireMap';
import { Link } from 'react-router-dom';

const sevIcon = { red: AlertTriangle, orange: AlertCircle, yellow: Info, green: CheckCircle };
const sevColor = { red: '#DC2626', orange: '#D4A373', yellow: '#CA8A04', green: '#2D6A4F' };
const sevBg = { red: 'bg-red-50', orange: 'bg-orange-50', yellow: 'bg-yellow-50', green: 'bg-emerald-50' };

const figures = [
  { value: '847', label: 'Élèves', sub: 'dans le réseau en 2025' },
  { value: '743', label: 'Projetés 2030', sub: '-12,3 % en 5 ans' },
  { value: '68', label: 'Viabilité', sub: 'sur 100 — seuil : 50' },
  { value: '3', label: 'Alertes', sub: 'filières sous seuil' },
];

type AlerteType = typeof alertes[number];

const Accueil = () => {
  const [selected, setSelected] = useState<AlerteType | null>(null);
  const topAlertes = alertes.filter(a => a.severity === 'red' || a.severity === 'orange').slice(0, 6);

  return (
    <div className="animate-fade-in">
      {/* ── Hero : Map immersive ── */}
      <section className="relative">
        <div className="absolute inset-0 z-[400] pointer-events-none">
          <div className="max-w-6xl mx-auto px-6 pt-8">
            <div className="pointer-events-auto inline-block bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-md">
              <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">Observatoire Prospectif</p>
              <h1 className="text-2xl md:text-3xl leading-tight tracking-tight mb-3" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                Enseignement agricole
                <span className="text-primary"> en Pays de la Loire</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontWeight: 300 }}>
                Suivi des effectifs, projections démographiques et alertes
                pour les établissements Établières et Heermont.
              </p>
            </div>
          </div>
        </div>
        <TerritoireMap height={480} showControls={true} />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent z-[500] pointer-events-none" />
      </section>

      {/* ── Chiffres clés ── */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-[600]">
        <div className="grid grid-cols-4 gap-4">
          {figures.map((f, i) => (
            <Card key={i} className={`animate-fade-up stagger-${i + 1} hover:shadow-md transition-shadow bg-card/95 backdrop-blur-sm`}>
              <CardContent className="p-5">
                <div className="text-3xl font-light tracking-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{f.value}</div>
                <div className="text-sm font-medium mt-1">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Alertes cliquables ── */}
      <section className="max-w-6xl mx-auto px-6 mt-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl tracking-tight mb-1">Alertes prioritaires</h2>
            <p className="text-muted-foreground text-sm" style={{ fontWeight: 300 }}>
              Cliquez sur une alerte pour voir le détail et la recommandation
            </p>
          </div>
          <Link to="/projections" className="text-sm text-primary hover:underline flex items-center gap-1">
            Toutes les alertes <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {topAlertes.map((a, i) => {
            const Icon = sevIcon[a.severity];
            const isSelected = selected?.id === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setSelected(isSelected ? null : a)}
                className={`text-left animate-fade-up stagger-${Math.min(i + 1, 4)} group`}
              >
                <Card className={`severity-${a.severity} h-full transition-all cursor-pointer
                  ${isSelected
                    ? 'ring-2 ring-offset-2 shadow-lg'
                    : 'hover:shadow-md hover:-translate-y-0.5'
                  }`}
                  style={isSelected ? { '--tw-ring-color': sevColor[a.severity] } as React.CSSProperties : {}}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} style={{ color: sevColor[a.severity] }} />
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0"
                        style={{ borderColor: sevColor[a.severity], color: sevColor[a.severity] }}>
                        {a.level}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">{a.etablissement}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-snug">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed" style={{ fontWeight: 300 }}>
                      {a.description}
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Panneau détail alerte */}
        {selected && (
          <div className="mt-4 animate-fade-up">
            <Card className={`severity-${selected.severity} ${sevBg[selected.severity]} border-2`}
              style={{ borderColor: sevColor[selected.severity] + '40' }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(() => { const Icon = sevIcon[selected.severity]; return <Icon size={20} style={{ color: sevColor[selected.severity] }} />; })()}
                    <div>
                      <h3 className="text-lg font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{selected.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{selected.etablissement} — {selected.categorie} — {selected.date}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4" style={{ fontWeight: 300 }}>
                  {selected.description}
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 border border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight size={14} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Recommandation</p>
                    <p className="text-sm font-medium leading-relaxed">{selected.recommandation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* ── Navigation rapide ── */}
      <section className="max-w-6xl mx-auto px-6 mt-14">
        <div className="grid grid-cols-3 gap-4">
          <Link to="/territoire">
            <Card className="group hover:shadow-md transition-all cursor-pointer border-primary/20 hover:border-primary/40 h-full">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Explorer le territoire</h3>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>Carte détaillée et données</p>
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
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>Filières et viabilité</p>
                </div>
                <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/projections">
            <Card className="group hover:shadow-md transition-all cursor-pointer border-primary/20 hover:border-primary/40 h-full">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Projections & Simulateur</h3>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>Scénarios et matrice de risques</p>
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
