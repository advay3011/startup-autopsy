"use client";

import { motion } from "framer-motion";
import type { DecisionOption } from "@/lib/types/game";

const OUTCOME_STYLES: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  SMART: {
    label: "SMART",
    color: "#EDC400",
    bg: "#EDC40010",
    border: "#EDC40030",
  },
  RISKY: {
    label: "RISKY",
    color: "#B25690",
    bg: "#B2569010",
    border: "#B2569030",
  },
  CONSERVATIVE: {
    label: "SAFE",
    color: "#EDC400",
    bg: "#EDC40010",
    border: "#EDC40030",
  },
  BOLD: {
    label: "BOLD",
    color: "#EDC400",
    bg: "#EDC40010",
    border: "#EDC40030",
  },
};

interface DecisionCardProps {
  option: DecisionOption;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  index: number;
}

export default function DecisionCard({
  option,
  onSelect,
  disabled,
  index,
}: DecisionCardProps) {
  const style = OUTCOME_STYLES[option.outcome_label] ?? OUTCOME_STYLES.RISKY;

  const impactItems = [
    option.financial_impact.cash_change !== 0 && {
      label: "Cash",
      value: option.financial_impact.cash_change,
      format: "cash",
    },
    option.financial_impact.monthly_burn_change !== 0 && {
      label: "Monthly Burn",
      value: option.financial_impact.monthly_burn_change,
      format: "cash",
    },
    option.financial_impact.monthly_revenue_change !== 0 && {
      label: "Revenue",
      value: option.financial_impact.monthly_revenue_change,
      format: "cash",
    },
    option.financial_impact.health_score_change !== 0 && {
      label: "Health",
      value: option.financial_impact.health_score_change,
      format: "points",
    },
  ].filter(Boolean) as Array<{
    label: string;
    value: number;
    format: string;
  }>;

  function formatImpact(value: number, format: string): string {
    const sign = value > 0 ? "+" : "";
    if (format === "cash") {
      const abs = Math.abs(value);
      if (abs >= 1_000_000_000) return `${sign}$${(value / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `${sign}$${(value / 1_000_000).toFixed(0)}M`;
      return `${sign}$${(value / 1_000).toFixed(0)}K`;
    }
    return `${sign}${value.toFixed(0)} pts`;
  }

  function impactColor(value: number, label: string): string {
    if (label === "Monthly Burn") {
      return value > 0 ? "#B25690" : "#1D71BA"; // more burn = bad
    }
    return value > 0 ? "#1D71BA" : "#B25690";
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className="w-full text-left group relative overflow-hidden rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: "#1a5070",
        borderColor: "#2a6080",
      }}
      whileHover={
        !disabled
          ? {
              borderColor: style.border,
              backgroundColor: style.bg,
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.99 } : undefined}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Option letter */}
            <span
              className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border"
              style={{
                color: style.color,
                borderColor: style.border,
                backgroundColor: style.bg,
              }}
            >
              {option.id.toUpperCase()}
            </span>
            <p className="text-sm font-medium text-white leading-snug">
              {option.text}
            </p>
          </div>

          {/* Outcome label */}
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded"
            style={{ color: style.color, backgroundColor: style.bg }}
          >
            {style.label}
          </span>
        </div>

        {/* Financial impact preview */}
        {impactItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {impactItems.map((item) => (
              <span
                key={item.label}
                className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#123a50] border border-[#1e1e1e]"
                style={{
                  color: impactColor(item.value, item.label),
                }}
              >
                {item.label}: {formatImpact(item.value, item.format)}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}
