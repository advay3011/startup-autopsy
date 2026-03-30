"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GameState } from "@/lib/types";

interface DashboardProps {
  state: GameState;
  prevState?: GameState | null;
}

function fmtCash(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtRunway(m: number): string {
  if (m >= 999) return "∞";
  if (m >= 12) return `${(m / 12).toFixed(1)}y`;
  return `${m.toFixed(1)}mo`;
}

function delta(curr: number, prev: number | undefined): number | null {
  if (prev === undefined || prev === curr) return null;
  return curr - prev;
}

function hColor(s: number) { return s >= 60 ? "#1D71BA" : s >= 30 ? "#1D71BA" : "#B25690"; }
function rColor(m: number) { return m >= 6 ? "#1D71BA" : m >= 3 ? "#1D71BA" : "#B25690"; }

function DeltaChip({ value, invert }: { value: number; invert?: boolean }) {
  const good = invert ? value < 0 : value > 0;
  const c = good ? "#1D71BA" : "#B25690";
  const sign = value > 0 ? "+" : "";
  const display = Math.abs(value) > 999_000 ? fmtCash(value) : `${sign}${value.toFixed(1)}`;
  return (
    <motion.span
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md font-mono"
      style={{ color: c, background: `${c}12` }}
    >
      {display}
    </motion.span>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#CCCCCC] w-24 shrink-0">{label}</span>
      <div className="flex-1 h-[6px] bg-[#144058] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] font-mono text-[#E0E0E060] w-8 text-right tabular-nums">
        {value.toFixed(0)}
      </span>
    </div>
  );
}

export default function Dashboard({ state, prevState }: DashboardProps) {
  const cashD = delta(state.cash, prevState?.cash);
  const burnD = delta(state.monthly_burn, prevState?.monthly_burn);
  const revD = delta(state.monthly_revenue, prevState?.monthly_revenue);
  const runD = delta(state.runway_months, prevState?.runway_months);
  const healthD = delta(state.health_score, prevState?.health_score);

  const hc = hColor(state.health_score);
  const rc = rColor(state.runway_months);
  const netBurn = state.monthly_burn - state.monthly_revenue;
  const b = state.health_breakdown;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1a5070", border: "1px solid #2a6080" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2a6080" }}>
        <span className="text-[11px] font-semibold text-[#CCCCCC] uppercase tracking-widest">Overview</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#2a6080]">{state.decisions_made}/8</span>
          {state.is_game_over && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-[10px] font-bold text-[#B25690]"
            >
              ● GAME OVER
            </motion.span>
          )}
        </div>
      </div>

      {/* Hero: Company Health */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-[11px] text-[#CCCCCC] uppercase tracking-wider mb-1">Company Health</p>
        <div className="flex items-baseline gap-2">
          <motion.span
            key={state.health_score}
            initial={{ opacity: 0.3, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[42px] font-bold font-mono tabular-nums leading-none tracking-tight"
            style={{ color: hc }}
          >
            {state.health_score.toFixed(0)}
          </motion.span>
          <span className="text-sm text-[#2a6080] font-mono">/100</span>
          <AnimatePresence mode="wait">
            {healthD !== null && <DeltaChip key={healthD} value={healthD} />}
          </AnimatePresence>
        </div>
        <div className="mt-3 h-2 bg-[#144058] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${hc}, ${hc}88)` }}
            animate={{ width: `${state.health_score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="h-px mx-5" style={{ background: "#2a6080" }} />

      {/* Key Metrics 2x2 */}
      <div className="grid grid-cols-2">
        <div className="px-5 py-4 border-r border-b" style={{ borderColor: "#2a6080" }}>
          <p className="text-[11px] text-[#CCCCCC] mb-1">Cash Remaining</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-white">{fmtCash(state.cash)}</span>
            <AnimatePresence mode="wait">
              {cashD !== null && <DeltaChip key={cashD} value={cashD} />}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-5 py-4 border-b" style={{ borderColor: "#2a6080" }}>
          <p className="text-[11px] text-[#CCCCCC] mb-1">Runway</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums" style={{ color: rc }}>
              {fmtRunway(state.runway_months)}
            </span>
            <AnimatePresence mode="wait">
              {runD !== null && <DeltaChip key={runD} value={runD} />}
            </AnimatePresence>
          </div>
          {state.runway_months < 3 && (
            <p className="text-[10px] text-[#B25690] mt-0.5">⚠ Critical</p>
          )}
        </div>

        <div className="px-5 py-4 border-r" style={{ borderColor: "#2a6080" }}>
          <p className="text-[11px] text-[#CCCCCC] mb-1">Monthly Burn</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums"
              style={{ color: state.monthly_burn > 100_000_000 ? "#B25690" : "#1D71BA" }}>
              {fmtCash(state.monthly_burn)}
            </span>
            <AnimatePresence mode="wait">
              {burnD !== null && <DeltaChip key={burnD} value={burnD} invert />}
            </AnimatePresence>
          </div>
          <p className="text-[10px] text-[#2a6080] font-mono mt-0.5">net {fmtCash(netBurn)}/mo</p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[11px] text-[#CCCCCC] mb-1">Revenue</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-[#E0E0E0]">
              {fmtCash(state.monthly_revenue)}
            </span>
            <AnimatePresence mode="wait">
              {revD !== null && <DeltaChip key={revD} value={revD} />}
            </AnimatePresence>
          </div>
          <p className="text-[10px] text-[#2a6080] font-mono mt-0.5">per month</p>
        </div>
      </div>

      <div className="h-px" style={{ background: "#2a6080" }} />

      {/* Health Breakdown */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-[11px] text-[#E0E0E060] uppercase tracking-wider font-semibold mb-3">Health Breakdown</p>
        <FunnelBar label="Burn Rate" value={b.burn_rate_health} max={100} color="#B25690" />
        <FunnelBar label="Revenue" value={b.revenue_growth} max={100} color="#1D71BA" />
        <FunnelBar label="Unit Economics" value={b.unit_economics} max={100} color="#1D71BA" />
        <FunnelBar label="Cash Flow" value={b.cash_flow} max={100} color="#1D71BA" />
        <FunnelBar label="Investors" value={b.investor_confidence} max={100} color="#a855f7" />
      </div>

      {/* Subscribers */}
      {state.subscribers > 0 && (
        <>
          <div className="h-px" style={{ background: "#2a6080" }} />
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[11px] text-[#CCCCCC]">Subscribers</span>
            <motion.span
              key={state.subscribers}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold font-mono tabular-nums text-[#F0F0F0]"
            >
              {state.subscribers.toLocaleString()}
            </motion.span>
          </div>
        </>
      )}
    </div>
  );
}
