"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { GameState } from "@/lib/types";

interface RunwayChartProps {
  gameHistory: GameState[];
  currentGameState: GameState;
}

function formatCashB(value: number): string {
  if (Math.abs(value) >= 1) return `$${value.toFixed(2)}B`;
  return `$${(value * 1000).toFixed(0)}M`;
}

export default function RunwayChart({
  gameHistory,
  currentGameState,
}: RunwayChartProps) {
  const allStates = [...gameHistory, currentGameState];

  if (allStates.length < 2) return null;

  const data = allStates.map((s, i) => ({
    label: i === 0 ? "Start" : `D${i}`,
    cashB: s.cash / 1_000_000_000,
    runway: s.runway_months,
  }));

  // Amber reference: cash equivalent of 3 months runway at current burn rate
  const latestBurn = currentGameState.monthly_burn;
  const amberCashB = latestBurn > 0 ? (latestBurn * 3) / 1_000_000_000 : null;

  return (
    <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-4">
      <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-3">
        Cash Over Time
      </p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e5570" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#E0E0E0", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#E0E0E0", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatCashB(v)}
              width={52}
            />
            <Tooltip
              contentStyle={{
                background: "#1e5570",
                border: "1px solid #333333",
                borderRadius: 8,
                fontSize: 11,
                color: "#F0F0F0",
              }}
              formatter={(value: number, name: string) => {
                if (name === "cashB") return [formatCashB(value), "Cash remaining"];
                return [`${value.toFixed(1)} mo`, "Runway"];
              }}
              labelStyle={{ color: "#CCCCCC" }}
            />

            {/* Bankruptcy floor */}
            <ReferenceLine
              y={0}
              stroke="#B25690"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: "Bankrupt",
                position: "insideBottomRight",
                fill: "#B25690",
                fontSize: 9,
              }}
            />

            {/* 3-month runway warning */}
            {amberCashB !== null && amberCashB > 0 && (
              <ReferenceLine
                y={amberCashB}
                stroke="#1D71BA"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{
                  value: "3 mo runway",
                  position: "insideTopRight",
                  fill: "#1D71BA",
                  fontSize: 9,
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="cashB"
              name="cashB"
              stroke="#1D71BA"
              strokeWidth={2}
              dot={{ fill: "#1D71BA", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#1D71BA" }}
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
