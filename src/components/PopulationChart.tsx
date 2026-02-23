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
import type { Demographie } from "@/types";

const COULEURS = ["#0ea5e9", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"];

interface PopulationChartProps {
  /** Démographie par tranche (ex. 14-15 ans, 16-17 ans…) */
  demographie: Demographie[];
  /** Titre optionnel */
  titre?: string;
}

/**
 * Graphique population locale, focus 14–23 ans (bar chart par tranche).
 */
export default function PopulationChart({
  demographie,
  titre = "Population locale (14–23 ans)",
}: PopulationChartProps) {
  const data = demographie.map((d) => ({
    name: d.tranche,
    effectif: d.effectif,
    pourcentage: d.pourcentage,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{titre}</h3>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "effectif") return [value, "Effectif"];
                if (name === "pourcentage") return [`${value}%`, "Part"];
                return [value, name];
              }}
              contentStyle={{ borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="effectif" radius={[4, 4, 0, 0]} maxBarSize={36}>
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
