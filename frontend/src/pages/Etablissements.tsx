import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, MapPin, Phone, Users } from 'lucide-react';
import { filieresDetaillees, personnelRH } from '@/data/mockData';

const etabs = {
  etablieres: {
    nom: 'Établières', ville: 'La Roche-sur-Yon', directeur: 'M. Jean-Pierre Dupont',
    tel: '02 51 09 XX XX', eleves: 468, filieres: 9, enseignants: 32,
    internat: '120 places', score: 72, color: '#2D6A4F',
    synthese: "Érosion progressive des effectifs portée par la baisse démographique. Filières CAPA et BTS ACSE les plus exposées. Agroéquipement et Forêt montrent une bonne résilience."
  },
  evron: {
    nom: 'Évron', ville: 'Château-Gontier', directeur: 'Mme Catherine Martin',
    tel: '02 43 07 XX XX', eleves: 379, filieres: 7, enseignants: 25,
    internat: '80 places', score: 64, color: '#D4A373',
    synthese: "Recul d'attractivité lié à la position géographique. La Viticulture reste un atout distinctif. Rapprochement avec Établières recommandé sur les doublons."
  },
};

type TabKey = keyof typeof etabs;

const Etablissements = () => {
  const [tab, setTab] = useState<TabKey>('etablieres');
  const info = etabs[tab];
  const filieres = filieresDetaillees.filter(f => f.etablissement === tab);
  const departs = personnelRH.filter(p => p.etablissement === info.nom).slice(0, 4);

  const getStatut = (proj2030: number, seuilMin: number, delta: number) => {
    if (proj2030 <= seuilMin) return { label: 'Critique', color: 'bg-red-500' };
    if (delta <= -25) return { label: 'Attention', color: 'bg-orange-400' };
    if (delta <= -15) return { label: 'Vigilance', color: 'bg-yellow-400' };
    return { label: 'Stable', color: 'bg-emerald-500' };
  };

  return (
    <div className="animate-fade-in">
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-4">
        <h1 className="text-3xl tracking-tight mb-2">Établissements</h1>
        <p className="text-muted-foreground mb-8" style={{ fontWeight: 300 }}>
          Fiches détaillées, filières et projections par établissement
        </p>

        {/* Tabs */}
        <div className="flex gap-3 mb-10">
          {(Object.keys(etabs) as TabKey[]).map(key => {
            const e = etabs[key];
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-5 py-3 rounded-xl border-2 transition-all text-left ${
                  active ? 'border-current shadow-sm' : 'border-border hover:border-muted-foreground/30'
                }`}
                style={active ? { borderColor: e.color, color: e.color } : {}}
              >
                <span className="text-base font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{e.nom}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{e.ville} — {e.eleves} élèves</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8">
          {/* Left — info */}
          <div className="space-y-5">
            {/* Fiche */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: info.color }} />
                  <h3 className="text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{info.nom}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><MapPin size={12} /> Ville</span><span>{info.ville}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Directeur</span><span>{info.directeur}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Phone size={12} /> Tél.</span><span>{info.tel}</span></div>
                  <div className="border-t border-border pt-2 mt-2" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Filières</span><span className="font-medium">{info.filieres}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Enseignants</span><span className="font-medium">{info.enseignants}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Internat</span><span className="font-medium">{info.internat}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Score */}
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground mb-2">Score de viabilité</p>
                <div
                  className="text-5xl font-light tracking-tight"
                  style={{ fontFamily: 'Fraunces, Georgia, serif', color: info.score >= 70 ? '#2D6A4F' : '#D4A373' }}
                >
                  {info.score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">sur 100</p>
              </CardContent>
            </Card>

            {/* Synthèse */}
            <Card className="severity-green" style={{ borderLeftColor: info.color }}>
              <CardContent className="p-5">
                <p className="text-xs font-medium mb-2">Synthèse</p>
                <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontWeight: 300 }}>
                  {info.synthese}
                </p>
              </CardContent>
            </Card>

            {/* Départs RH */}
            {departs.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-xs font-medium mb-3 flex items-center gap-1.5">
                    <Users size={12} /> Départs prévus
                  </h3>
                  <div className="space-y-2.5">
                    {departs.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{p.poste}</span>
                          <span className="block text-xs text-muted-foreground">{p.depart}</span>
                        </div>
                        <Badge variant={p.remplacement ? 'secondary' : 'destructive'} className="text-[10px]">
                          {p.remplacement ? 'Remplacé' : 'Non remplacé'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right — filières table */}
          <div className="col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="p-5 pb-3 border-b border-border">
                  <h3 className="text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Filières</h3>
                  <p className="text-sm text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
                    Effectifs actuels, projections 2030 et seuils de viabilité
                  </p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Filière</th>
                      <th className="text-center p-4 text-xs font-medium text-muted-foreground">Niveau</th>
                      <th className="text-right p-4 text-xs font-medium text-muted-foreground">2025</th>
                      <th className="text-right p-4 text-xs font-medium text-muted-foreground">2030</th>
                      <th className="text-right p-4 text-xs font-medium text-muted-foreground">Seuil</th>
                      <th className="text-right p-4 text-xs font-medium text-muted-foreground">Évol.</th>
                      <th className="text-center p-4 text-xs font-medium text-muted-foreground">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filieres.map((f, i) => {
                      const statut = getStatut(f.proj2030, f.seuilMin, f.delta);
                      const danger = f.proj2030 <= f.seuilMin;
                      return (
                        <tr key={i} className={`border-b last:border-0 transition-colors ${danger ? 'bg-red-50/40' : 'hover:bg-muted/20'}`}>
                          <td className="p-4 text-sm font-medium">{f.filiere}</td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className="text-[10px] font-normal">{f.niveau}</Badge>
                          </td>
                          <td className="p-4 text-right text-sm">{f.effectif2025}</td>
                          <td className="p-4 text-right text-sm font-medium">{f.proj2030}</td>
                          <td className="p-4 text-right text-sm text-muted-foreground">{f.seuilMin}</td>
                          <td className="p-4 text-right text-sm">
                            <span className="inline-flex items-center gap-0.5 text-destructive">
                              <TrendingDown size={12} />
                              {f.delta}%
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full ${statut.color}`} />
                              {statut.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Etablissements;
