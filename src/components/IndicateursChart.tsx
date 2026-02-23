"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Indicateurs } from "@/types";

const COULEURS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b"];

interface IndicateursChartProps {
  indicateurs: Indicateurs;
  /** Titre optionnel (ex. nom de l'établissement) */
  titre?: string;
}

/**
 * Graphique en barres pour les indicateurs clés (insertion, recherche emploi, etc.).
 */
export default function IndicateursChart({
  indicateurs,
  titre,
}: IndicateursChartProps) {
  const data = [
    { name: "Insertion pro.", value: indicateurs.tauxInsertion },
    { name: "Recherche emploi", value: indicateurs.tauxRechercheEmploi },
    { name: "Poursuite études", value: indicateurs.tauxPoursuiteEtudes },
    { name: "Réussite bac", value: indicateurs.tauxReussiteBac },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {titre && (
        <h3 className="text-sm font-semibold text-slate-800 mb-3">{titre}</h3>
      )}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          >
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Taux"]}
              contentStyle={{ borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((_, index) => (
                <Cell key={index} fill={COULEURS[index % COULEURS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
