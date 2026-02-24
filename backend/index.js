import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'frontend', 'public', 'data');

const lyceesList = JSON.parse(readFileSync(join(DATA_DIR, 'lycees_list.json'), 'utf-8'));
const lyceesData = JSON.parse(readFileSync(join(DATA_DIR, 'lycees_data.json'), 'utf-8'));

const PROXY_URL = process.env.OPENAI_BASE_URL || 'http://127.0.0.1:8002/v1';

const app = express();
app.use(express.json());

// GET /api/lycees — liste pour la map
app.get('/api/lycees', (_req, res) => {
  res.json(lyceesList);
});

// GET /api/lycees/:id — données complètes d'un lycée
app.get('/api/lycees/:id', (req, res) => {
  const data = lyceesData[req.params.id];
  if (!data) return res.status(404).json({ error: 'Lycée non trouvé' });
  res.json(data);
});

// POST /api/lycees/:id/simulate — simulation attractivité
app.post('/api/lycees/:id/simulate', (req, res) => {
  const data = lyceesData[req.params.id];
  if (!data) return res.status(404).json({ error: 'Lycée non trouvé' });

  let delta = Number(req.body.delta_attractivite) || 0;
  delta = Math.max(-0.20, Math.min(0.40, delta));

  const scenario = data.series
    .filter(s => s.actual === null)
    .map(s => ({
      year: s.year,
      scenario: Math.round(s.baseline * (1 + delta)),
    }));

  res.json({ lycee_id: req.params.id, delta_attractivite: delta, scenario });
});

// ---------------------------------------------------------------------------
// POST /api/lycees/:id/analyze — Analyse LLM (via proxy Azure GPT-4o)
// ---------------------------------------------------------------------------

const analysisCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function buildAnalysisInput(id, delta) {
  const data = lyceesData[id];
  if (!data) return null;

  const { lycee, metrics, series } = data;
  const dep = lycee.departement_code;

  const historique = series.filter(s => s.actual !== null).map(s => ({ annee: s.year, effectifs: s.actual }));
  const baseline = series.filter(s => s.actual === null).map(s => ({ annee: s.year, effectifs: s.baseline }));

  const input = {
    lycee: { nom: lycee.name, departement_code: dep, id },
    metrics: {
      pente_annuelle: metrics.pente_annuelle,
      captation_2018: metrics.captation_2018,
      captation_2025: metrics.captation_2025,
      delta_captation_points: metrics.delta_captation_points,
      mape_modele: metrics.mape,
      seuil_critique: metrics.seuil_critique,
    },
    historique,
    projection_baseline: baseline,
    baseline_2028_sous_seuil: baseline.length > 0 && baseline[baseline.length - 1].effectifs < metrics.seuil_critique,
  };

  // Lycées du même département pour comparaison
  const voisins = Object.entries(lyceesData)
    .filter(([k, v]) => v.lycee.departement_code === dep && k !== id)
    .map(([, v]) => ({
      nom: v.lycee.name,
      pente_annuelle: v.metrics.pente_annuelle,
      effectif_2025: v.series.filter(s => s.actual !== null).slice(-1)[0]?.actual ?? 0,
      baseline_2028: v.series.filter(s => s.actual === null).slice(-1)[0]?.baseline ?? 0,
      captation_2025: v.metrics.captation_2025,
    }));
  if (voisins.length > 0) input.lycees_meme_departement = voisins;

  if (delta !== 0) {
    const scenario = baseline.map(b => ({
      annee: b.annee,
      effectifs_scenario: Math.round(b.effectifs * (1 + delta)),
      gain: Math.round(b.effectifs * (1 + delta)) - b.effectifs,
    }));
    const gains = scenario.map(s => s.gain);
    input.scenario = {
      delta_attractivite_pct: Math.round(delta * 100),
      projections: scenario,
      gain_moyen: Math.round(gains.reduce((a, b) => a + b, 0) / gains.length),
    };
  }

  return input;
}

const SYSTEM_PROMPT = `Tu es un assistant d'aide à la décision pour le réseau CNEAP Pays de la Loire.
Contexte institutionnel (à utiliser, sans inventer) :
- PDL ~3,96M hab. en 2026, croissance ~+0,35%/an.
- Jeunes 14–23 ans ~630k (~15,9%).
- Scolarisation 15–17 ans >95%, 18–24 ans ~49%.
- Polarisation urbaine Nantes/Angers, enjeux ruraux Mayenne/Sarthe, accessibilité et internat clés.
- Réseau CNEAP PDL : internat comme avantage, capacités et positionnements par site (ex: Évron capacité 250, internat 120, ratio 48%).
Règles :
1) N'invente aucun chiffre ; cite les chiffres fournis par l'API.
2) Ne dis jamais "fermeture" ; parle de fragilité/risque si justifié.
3) Distingue faits (données) vs hypothèses (scénarios).
Style : concis, actionnable, orienté comité de pilotage.`;

const USER_PROMPT_TEMPLATE = `À partir du JSON ci-dessous, rédige :

SECTION 1 — DIAGNOSTIC (baseline) :
- 3-5 bullets de constats chiffrés (tendance, captation, démographie si fournie, projection vs seuil)
- 1 paragraphe d'interprétation (structurel vs démographique) + 2 risques/opportunités
- 3 recommandations N+1/N+3 (effort faible/moyen/fort)

SECTION 2 — SCÉNARIO (uniquement si delta_attractivite != 0) :
- Rappelle la valeur du delta_attractivite en %
- Donne les gains 2026/2027/2028 et le gain moyen (déjà calculés)
- Explique ce que cela signifie concrètement (leviers plausibles) : 2-3 options
- 2 hypothèses + 2 limites

Si delta_attractivite == 0 ou absent, n'affiche pas la section 2 (ou indique 'Aucun scénario appliqué').

JSON :
`;

async function callLLM(analysisInput) {
  const response = await fetch(`${PROXY_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT_TEMPLATE + JSON.stringify(analysisInput, null, 2) },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Proxy error ${response.status}: ${err}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || '';
}

function splitSections(text) {
  const s2Markers = ['SECTION 2', 'SCÉNARIO', 'SCENARIO'];
  let splitIdx = -1;
  for (const marker of s2Markers) {
    const idx = text.toUpperCase().indexOf(marker);
    if (idx > 0) { splitIdx = idx; break; }
  }
  if (splitIdx > 0) {
    return {
      diagnostic: text.slice(0, splitIdx).replace(/^[\s—\-#]+|[\s—\-#]+$/g, '').trim(),
      scenario: text.slice(splitIdx).trim(),
    };
  }
  return { diagnostic: text.trim(), scenario: null };
}

app.post('/api/lycees/:id/analyze', async (req, res) => {
  const { id } = req.params;
  const data = lyceesData[id];
  if (!data) return res.status(404).json({ error: 'Lycée non trouvé' });

  let delta = Number(req.body.delta_attractivite) || 0;
  delta = Math.max(-0.20, Math.min(0.40, delta));
  const deltaKey = Math.round(delta * 100);

  const cacheKey = `${id}:${deltaKey}`;
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return res.json(cached.result);
  }

  const analysisInput = buildAnalysisInput(id, delta);
  if (!analysisInput) return res.status(404).json({ error: 'Données introuvables' });

  try {
    const raw = await callLLM(analysisInput);
    const result = splitSections(raw);
    analysisCache.set(cacheKey, { result, ts: Date.now() });
    res.json(result);
  } catch (err) {
    console.error('LLM error:', err.message);
    res.json({
      diagnostic: 'Analyse IA temporairement indisponible. Vérifiez que le proxy OpenAI est lancé (port 8002).',
      scenario: delta !== 0 ? 'Analyse du scénario indisponible.' : null,
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API backend → http://localhost:${PORT}`));
