import { Card, CardContent } from '@/components/ui/card';
import { Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Info, TrendingDown } from 'lucide-react';
import { TerritoireMap } from '@/components/TerritoireMap';

const populationCommunes = [
  { commune: 'La Roche-sur-Yon', pop2025: 1850, pop2030: 1620 },
  { commune: 'Nantes (péri.)', pop2025: 2200, pop2030: 1980 },
  { commune: 'Château-Gontier', pop2025: 980, pop2030: 820 },
  { commune: 'Cholet', pop2025: 1420, pop2030: 1250 },
  { commune: 'Laval', pop2025: 1150, pop2030: 1020 },
  { commune: 'Les Herbiers', pop2025: 680, pop2030: 590 },
  { commune: 'Fontenay-le-C.', pop2025: 520, pop2030: 440 },
  { commune: 'Ancenis', pop2025: 450, pop2030: 380 },
  { commune: 'Mayenne', pop2025: 380, pop2030: 310 },
  { commune: 'Luçon', pop2025: 320, pop2030: 260 },
];

const Territoire = () => (
  <div className="animate-fade-in">
    <section className="max-w-6xl mx-auto px-6 pt-12 pb-4">
      <h1 className="text-3xl tracking-tight mb-2">Carte territoriale</h1>
      <p className="text-muted-foreground mb-8" style={{ fontWeight: 300 }}>
        Implantation, zones de recrutement et densité démographique 15–19 ans
      </p>
    </section>
    <section className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="overflow-hidden">
            <TerritoireMap height={540} showControls={true} />
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-medium mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                Population 15-19 ans
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={populationCommunes} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" />
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'Outfit' }} />
                  <YAxis type="category" dataKey="commune" tick={{ fontSize: 9, fontFamily: 'Outfit' }} width={88} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, fontSize: 11, fontFamily: 'Outfit' }} />
                  <Bar dataKey="pop2025" name="2025" fill="#2D6A4F" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="pop2030" name="2030 (proj.)" fill="#2D6A4F" fillOpacity={0.25} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Indicateurs territoriaux</h3>
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1 text-muted-foreground"><Info size={11} /> Agriculture</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Exploitations</span><span className="font-medium">4 280</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SAU</span><span className="font-medium">185 000 ha</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Emploi</span><span className="flex items-center gap-1 text-destructive text-xs"><TrendingDown size={11} /> -2,4 %/an</span></div>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium mb-2 flex items-center gap-1 text-muted-foreground"><Info size={11} /> Socio-économique</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Chômage</span><span className="font-medium">7,2 %</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Revenu médian</span><span className="font-medium">21 400 €</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pop. active</span><span className="font-medium">1,52 M</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </div>
);

export default Territoire;
