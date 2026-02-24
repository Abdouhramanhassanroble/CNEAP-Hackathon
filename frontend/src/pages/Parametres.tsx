import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Key, Database, CheckCircle, XCircle, Eye, EyeOff, Save, Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'cneap_api_config';

export interface ApiConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
}

const PRESETS = [
  { label: 'Anthropic (Claude)', endpoint: 'https://api.anthropic.com/v1/messages', model: 'claude-sonnet-4-20250514' },
  { label: 'Azure OpenAI (CNEAP)', endpoint: 'https://apigatewayinnovation.azure-api.net/openai-api/deployments/gpt-4o/chat', model: 'gpt-4o' },
  { label: 'OpenAI Direct', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { label: 'OpenAI (GPT-4o-mini)', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'Personnalisé', endpoint: '', model: '' },
];

const sources = [
  { nom: 'INSEE Démographie', statut: true, desc: 'Population 15-19 ans par département (2016-2022)' },
  { nom: 'Effectifs CNEAP', statut: true, desc: 'Effectifs 22 lycées (2018-2025)' },
  { nom: 'Modèle Ridge', statut: true, desc: 'Projections 2026-2028 (MAE=16.2, MAPE=5.2%)' },
  { nom: 'Formations', statut: true, desc: 'Détail formations par établissement' },
];

export function loadApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { apiKey: '', apiEndpoint: 'https://api.anthropic.com/v1/messages', model: 'claude-sonnet-4-20250514' };
}

function saveApiConfig(config: ApiConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

const Parametres = () => {
  const [config, setConfig] = useState<ApiConfig>(loadApiConfig);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null);

  useEffect(() => { setSaved(false); setTestResult(null); }, [config.apiKey, config.apiEndpoint, config.model]);

  const handleSave = () => {
    saveApiConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/lycees/evron/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delta_attractivite: 0,
          api_key: config.apiKey,
          api_endpoint: config.apiEndpoint,
          model: config.model,
        }),
      });
      const data = await res.json();
      setTestResult(data.diagnostic && !data.diagnostic.includes('Erreur') && !data.diagnostic.includes('non configuré') ? 'ok' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const selectPreset = (idx: number) => {
    const p = PRESETS[idx];
    setConfig(prev => ({ ...prev, apiEndpoint: p.endpoint, model: p.model }));
  };

  const maskedKey = config.apiKey ? config.apiKey.slice(0, 8) + '••••••••' + config.apiKey.slice(-4) : '';

  return (
    <div className="animate-fade-in">
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-3">
        <h1 className="text-3xl tracking-tight mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Paramètres</h1>
        <p className="text-muted-foreground text-sm mb-8" style={{ fontWeight: 300 }}>
          Configuration de l'API IA et jeux de données
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Clé API */}
          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-emerald-600" />
                <h3 className="text-lg font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Clé API</h3>
              </div>

              {/* Presets */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fournisseur</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => selectPreset(i)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        config.apiEndpoint === p.endpoint && config.model === p.model
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clé */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clé API</label>
                <div className="relative mt-1.5">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="sk-... ou votre clé Azure"
                    className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
                  />
                  <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {config.apiKey && !showKey && (
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">{maskedKey}</p>
                )}
              </div>

              {/* Endpoint */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Endpoint API</label>
                <input
                  type="text"
                  value={config.apiEndpoint}
                  onChange={e => setConfig(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
                />
              </div>

              {/* Modèle */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modèle</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="gpt-4o"
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave}
                  className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all">
                  <Save size={14} /> {saved ? 'Sauvegardé !' : 'Sauvegarder'}
                </button>
                <button onClick={handleTest} disabled={!config.apiKey || testing}
                  className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-all disabled:opacity-50">
                  <Sparkles size={14} /> {testing ? 'Test...' : 'Tester la connexion'}
                </button>
                {testResult === 'ok' && <CheckCircle size={16} className="text-emerald-600" />}
                {testResult === 'error' && <XCircle size={16} className="text-red-500" />}
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                La clé est stockée dans le navigateur (localStorage). Elle est envoyée au backend uniquement lors des analyses IA.
              </p>
            </CardContent>
          </Card>

          {/* Jeux de données */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-primary" />
                <h3 className="text-lg font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Jeux de données</h3>
              </div>

              <div className="space-y-3">
                {sources.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border hover:shadow-sm transition-shadow">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{s.nom}</div>
                      <div className="text-xs text-muted-foreground" style={{ fontWeight: 300 }}>{s.desc}</div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">Actif</Badge>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Résumé</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Lycées</span><span className="font-medium">22</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Départements</span><span className="font-medium">5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Années historiques</span><span className="font-medium">2018-2025</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Projection</span><span className="font-medium">2026-2028</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Modèle</span><span className="font-medium">Ridge (α=1.0)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">MAPE</span><span className="font-medium">5.2%</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Parametres;
