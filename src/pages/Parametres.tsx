import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, Database, CheckCircle, XCircle, RotateCcw, SlidersHorizontal
} from 'lucide-react';

const sources = [
  { nom: 'INSEE Démographie', statut: true, sync: '15/02/2025', desc: 'Pop. communale 15-19 ans' },
  { nom: 'SAFRAN Agriculture', statut: true, sync: '14/02/2025', desc: 'Indicateurs agricoles régionaux' },
  { nom: 'ONISEP', statut: true, sync: '10/02/2025', desc: 'Orientation et vœux Affelnet' },
  { nom: 'CNEAP Interne', statut: true, sync: '15/02/2025', desc: 'Effectifs et filières établissements' },
  { nom: 'DRAAF', statut: false, sync: '01/01/2025', desc: 'Données régionales agriculture' },
];

const DEFAULTS = { seuilEleves: 15, seuilViabilite: 50, seuilRemplissage: 70 };

const Parametres = () => {
  const [seuilEleves, setSeuilEleves] = useState(DEFAULTS.seuilEleves);
  const [seuilViabilite, setSeuilViabilite] = useState(DEFAULTS.seuilViabilite);
  const [seuilRemplissage, setSeuilRemplissage] = useState(DEFAULTS.seuilRemplissage);

  const reset = () => { setSeuilEleves(DEFAULTS.seuilEleves); setSeuilViabilite(DEFAULTS.seuilViabilite); setSeuilRemplissage(DEFAULTS.seuilRemplissage); };

  return (
    <div className="animate-fade-in">
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-4">
        <h1 className="text-3xl tracking-tight mb-2">Paramètres</h1>
        <p className="text-muted-foreground mb-10" style={{ fontWeight: 300 }}>
          Seuils d'alerte et sources de données
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 gap-8">
          {/* ── Seuils ── */}
          <Card>
            <CardContent className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  <AlertTriangle size={18} className="text-primary" />
                  Seuils d'alerte
                </h3>
                <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RotateCcw size={12} /> Réinitialiser
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <p className="text-sm font-medium">Minimum élèves par filière</p>
                    <p className="text-xs text-muted-foreground">Seuil de viabilité d'une filière</p>
                  </div>
                  <span className="text-2xl font-light tabular-nums" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{seuilEleves}</span>
                </div>
                <Slider value={[seuilEleves]} onValueChange={v => setSeuilEleves(v[0])} max={30} min={5} step={1} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>5</span><span>30</span></div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <p className="text-sm font-medium">Score viabilité critique</p>
                    <p className="text-xs text-muted-foreground">Déclenche une alerte rouge réseau</p>
                  </div>
                  <span className="text-2xl font-light tabular-nums" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{seuilViabilite}</span>
                </div>
                <Slider value={[seuilViabilite]} onValueChange={v => setSeuilViabilite(v[0])} max={80} min={20} step={5} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>20</span><span>80</span></div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <p className="text-sm font-medium">Taux de remplissage alerte</p>
                    <p className="text-xs text-muted-foreground">Déclenche une alerte orange</p>
                  </div>
                  <span className="text-2xl font-light tabular-nums" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{seuilRemplissage}%</span>
                </div>
                <Slider value={[seuilRemplissage]} onValueChange={v => setSeuilRemplissage(v[0])} max={100} min={40} step={5} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>40%</span><span>100%</span></div>
              </div>
            </CardContent>
          </Card>

          {/* ── Aperçu impact ── */}
          <div className="space-y-5">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={14} />
                  Aperçu avec ces seuils
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-medium text-red-800">
                        Filières critiques ({seuilEleves > 15 ? '5' : seuilEleves > 10 ? '3' : '2'})
                      </span>
                    </div>
                    <p className="text-xs text-red-700/70">Effectifs projetés &lt; {seuilEleves} élèves en 2030</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-xs font-medium text-orange-800">Score viabilité</span>
                    </div>
                    <p className="text-xs text-orange-700/70">
                      {seuilViabilite >= 68
                        ? `Le réseau (68/100) passe sous le seuil de ${seuilViabilite}`
                        : `Le réseau (68/100) reste au-dessus du seuil de ${seuilViabilite}`}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-xs font-medium text-yellow-800">Remplissage</span>
                    </div>
                    <p className="text-xs text-yellow-700/70">
                      {seuilRemplissage > 76
                        ? `Taux actuel (76%) sous le seuil de ${seuilRemplissage}% → alerte`
                        : `Taux actuel (76%) au-dessus du seuil de ${seuilRemplissage}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontWeight: 300 }}>
                  Ajuster les seuils à la hausse augmente la sensibilité (plus d'alertes précoces).
                  À la baisse, on réduit le bruit pour se concentrer sur les situations critiques.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Sources de données ── */}
      <section className="max-w-5xl mx-auto px-6 mt-14">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg mb-5 flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              <Database size={18} className="text-primary" />
              Sources de données
            </h3>
            <div className="space-y-3">
              {sources.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border hover:shadow-sm transition-shadow">
                  {s.statut
                    ? <CheckCircle size={18} className="text-primary flex-shrink-0" />
                    : <XCircle size={18} className="text-destructive flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.nom}</div>
                    <div className="text-xs text-muted-foreground" style={{ fontWeight: 300 }}>{s.desc}</div>
                  </div>
                  <Badge variant={s.statut ? 'secondary' : 'destructive'} className="text-[11px]">
                    {s.statut ? `Sync. ${s.sync}` : 'Hors ligne'}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-5 leading-relaxed" style={{ fontWeight: 300 }}>
              Une source hors ligne dégrade la fiabilité des projections sur les facteurs associés.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Parametres;
