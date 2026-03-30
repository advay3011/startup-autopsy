"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DecisionOption } from "@/lib/types";

// ─── Outcome config ───────────────────────────────────────────────────────────

const OUTCOME_CONFIG: Record<
  string,
  { display: string; color: string; bg: string; border: string; glow: string }
> = {
  SMART: {
    display: "SMART",
    color: "#EDC400",
    bg: "#EDC40018",
    border: "#EDC400",
    glow: "0 0 25px rgba(34,197,94,0.3), 0 0 0 1px rgba(34,197,94,0.5)",
  },
  RISKY: {
    display: "RISKY",
    color: "#B25690",
    bg: "#B2569018",
    border: "#B25690",
    glow: "0 0 25px rgba(239,68,68,0.3), 0 0 0 1px rgba(239,68,68,0.5)",
  },
  CONSERVATIVE: {
    display: "CONSERVATIVE",
    color: "#EDC400",
    bg: "#EDC40018",
    border: "#EDC400",
    glow: "0 0 25px rgba(245,158,11,0.3), 0 0 0 1px rgba(245,158,11,0.5)",
  },
  BOLD: {
    display: "BOLD",
    color: "#EDC400",
    bg: "#EDC40018",
    border: "#EDC400",
    glow: "0 0 25px rgba(59,130,246,0.3), 0 0 0 1px rgba(59,130,246,0.5)",
  },
  RIGHT_CALL: {
    display: "RIGHT CALL",
    color: "#EDC400",
    bg: "#EDC40018",
    border: "#EDC400",
    glow: "0 0 25px rgba(34,197,94,0.3), 0 0 0 1px rgba(34,197,94,0.5)",
  },
};

const DEFAULT_CONFIG = OUTCOME_CONFIG.RISKY;

const NEUTRAL_HOVER = {
  color: "#CCCCCC",
  bg: "#ffffff08",
  border: "#CCCCCC",
  glow: "0 0 15px rgba(255,255,255,0.05)",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DecisionCardProps {
  option: DecisionOption;
  onSelect: (optionId: string) => void;
  isDisabled: boolean;
  isSelected: boolean;
  showHoverPreview?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecisionCard({
  option,
  onSelect,
  isDisabled,
  isSelected,
}: DecisionCardProps): React.ReactElement {
  const [isHovered, setIsHovered] = useState(false);

  const cfg = OUTCOME_CONFIG[option.outcome_label] ?? DEFAULT_CONFIG;

  // Dramatic fade-out for unselected cards after a choice is made
  const isDimmed = isDisabled && !isSelected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: isDimmed ? 0.18 : 1,
        y: 0,
        filter: isDimmed ? "blur(1px)" : "blur(0px)",
        scale: isDimmed ? 0.98 : 1,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* ── Main card button ── */}
      <motion.button
        onClick={() => !isDisabled && onSelect(option.id)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        disabled={isDisabled}
        animate={{
          borderColor: isSelected
            ? cfg.border
            : isHovered && !isDisabled
            ? `${NEUTRAL_HOVER.border}88`
            : "#242424",
          backgroundColor: isSelected
            ? cfg.bg
            : isHovered && !isDisabled
            ? "#161616"
            : "#1a5070",
          boxShadow: isSelected
            ? cfg.glow
            : isHovered && !isDisabled
            ? NEUTRAL_HOVER.glow
            : "none",
          scale: isSelected ? 1.01 : isHovered && !isDisabled ? 1.015 : 1,
        }}
        transition={{ duration: 0.15 }}
        whileTap={!isDisabled ? { scale: 0.99 } : undefined}
        className="w-full text-left rounded-xl border-2 p-4 cursor-pointer disabled:cursor-not-allowed relative overflow-hidden"
      >
        {/* Outcome badge — hidden until selected */}
        <AnimatePresence>
          {isSelected && (
            <motion.span
              key="badge"
              initial={{ opacity: 0, scale: 0.7, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-3 right-3 text-xs font-black px-2.5 py-1 rounded-sm tracking-wider"
              style={{
                color: cfg.color,
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}60`,
              }}
            >
              {cfg.display}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Option letter + text */}
        <div className="flex items-start gap-3 pr-28">
          <motion.span
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black border-2 mt-0.5"
            animate={{
              color: isSelected ? cfg.color : isHovered && !isDisabled ? NEUTRAL_HOVER.color : "#CCCCCC",
              borderColor: isSelected ? cfg.border : isHovered && !isDisabled ? NEUTRAL_HOVER.border : "#2a2a2a",
              backgroundColor: isSelected ? cfg.bg : isHovered && !isDisabled ? NEUTRAL_HOVER.bg : "transparent",
            }}
            transition={{ duration: 0.15 }}
          >
            {option.id.toUpperCase()}
          </motion.span>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold leading-snug transition-colors duration-150"
              style={{ color: isSelected ? "#ffffff" : isHovered ? "#f0f0f0" : "#F0F0F0" }}
            >
              {option.text}
            </p>
            <p className="text-xs text-[#E0E0E0] mt-0.5 font-mono">{option.short_label}</p>
          </div>
        </div>

      </motion.button>

      {/* ── Post-selection reveal ── */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-xl p-4 space-y-3 border"
              style={{
                backgroundColor: `${cfg.border}0a`,
                borderColor: `${cfg.border}25`,
              }}
            >
              {/* Consequence story */}
              <p className="text-sm text-[#dddddd] leading-relaxed font-medium">
                {option.consequence_story}
              </p>

              {/* Plain English explanation */}
              <div className="border-t pt-3" style={{ borderColor: `${cfg.border}20` }}>
                <p className="text-xs font-bold text-[#E0E0E0] uppercase tracking-widest mb-1.5 font-mono">
                  What this means
                </p>
                <p className="text-xs text-[#999999] leading-relaxed">
                  {option.plain_english_explanation}
                </p>
              </div>

              {/* Concept label */}
              {option.concept_explained && (
                <p
                  className="text-xs italic border-t pt-2"
                  style={{ color: `${cfg.color}99`, borderColor: "#1e5570" }}
                >
                  {option.concept_explained}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
