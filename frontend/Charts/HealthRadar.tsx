"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { HealthBreakdown } from "@/lib/types";

interface HealthRadarProps {
  healthBreakdown: HealthBreakdown;
  previousBreakdown: HealthBreakdown | null;
}

function overallScore(b: HealthBreakdown): number {
  return (
    b.burn_rate_health * 0.25 +
    b.revenue_growth * 0.25 +
    b.unit_economics * 0.2 +
    b.cash_flow * 0.2 +
    b.investor_confidence * 0.1
  );
}

function radarColor(score: number): string {
  if (score >= 60) return "#71B379";
  if (score >= 30) return "#71B379";
  return "#B25690";
}

// Recharts RadarChart reads all data from the top-level `data` prop.
// To overlay two shapes, both values must live in the same row.
function buildData(
  current: HealthBreakdown,
  previous: HealthBreakdown | null
): Array<{ subject: string; current: number; previous: number; fullMark: number }> {
  return [
    {
      subject: "Burn Rate",
      current: current.burn_rate_health,
      previous: previous?.burn_rate_health ?? 0,
      fullMark: 100,
    },
    {
      subject: "Revenue",
      current: current.revenue_growth,
      previous: previous?.revenue_growth ?? 0,
      fullMark: 100,
    },
    {
      subject: "Unit Econ",
      current: current.unit_economics,
      previous: previous?.unit_economics ?? 0,
      fullMark: 100,
    },
    {
      subject: "Cash Flow",
      current: current.cash_flow,
      previous: previous?.cash_flow ?? 0,
      fullMark: 100,
    },
    {
      subject: "Investors",
      current: current.investor_confidence,
      previous: previous?.investor_confidence ?? 0,
      fullMark: 100,
    },
  ];
}

export default function HealthRadar({
  healthBreakdown,
  previousBreakdown,
}: HealthRadarProps) {
  const score = overallScore(healthBreakdown);
  const color = radarColor(score);
  const data = buildData(healthBreakdown, previousBreakdown);

  return (
    <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-4">
      <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-3">
        Health Breakdown
      </p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
            <PolarGrid stroke="#1e1e1e" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#E0E0E0", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: "#1e5570",
                border: "1px solid #333333",
                borderRadius: 8,
                fontSize: 11,
                color: "#F0F0F0",
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(0)}/100`,
                name === "current" ? "Now" : "Previous",
              ]}
            />

            {/* Ghost of previous state */}
            {previousBreakdown && (
              <Radar
                dataKey="previous"
                stroke="#333333"
                fill="#333333"
                fillOpacity={0.2}
                isAnimationActive
                animationDuration={500}
              />
            )}

            {/* Current state */}
            <Radar
              dataKey="current"
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              dot={{ fill: color, r: 3 }}
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
