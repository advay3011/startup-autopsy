"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { GameState } from "@/lib/types";

interface VsRealChartProps {
  gameHistory: GameState[];
  realCompanyHistory: number[];
}

export default function VsRealChart({
  gameHistory,
  realCompanyHistory,
}: VsRealChartProps) {
  const playerScores = gameHistory.map((s) => s.health_score);

  if (playerScores.length < 2 && realCompanyHistory.length < 2) return null;

  const maxLen = Math.max(playerScores.length, realCompanyHistory.length);

  const data = Array.from({ length: maxLen }, (_, i) => ({
    label: i === 0 ? "Start" : `D${i}`,
    you: playerScores[i] ?? null,
    real: realCompanyHistory[i] ?? null,
  }));

  return (
    <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-4">
      <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-3">
        You vs. Real Company (Health Score)
      </p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e5570" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#E0E0E0", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#E0E0E0", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
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
                name === "you" ? "You" : "Real company",
              ]}
              labelStyle={{ color: "#CCCCCC" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: "#CCCCCC", paddingTop: 8 }}
              formatter={(value: string) =>
                value === "you" ? "You" : "Real Company"
              }
            />

            <Line
              type="monotone"
              dataKey="you"
              name="you"
              stroke="#1D71BA"
              strokeWidth={2}
              dot={{ fill: "#1D71BA", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#1D71BA" }}
              connectNulls
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="real"
              name="real"
              stroke="#B25690"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ fill: "#B25690", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
