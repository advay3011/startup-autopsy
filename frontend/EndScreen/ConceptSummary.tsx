"use client";

import { motion } from "framer-motion";
import type { ConceptMastery, MasteryLevel } from "@/lib/types";

interface ConceptSummaryProps {
  mastery: ConceptMastery[];
}

const MASTERY_CONFIG: Record<
  MasteryLevel,
  { label: string; color: string; icon: string }
> = {
  mastered: { label: "MASTERED", color: "#EDC400", icon: "✓" },
  learning: { label: "LEARNING", color: "#EDC400", icon: "→" },
  missed:   { label: "NEEDS WORK", color: "#B25690", icon: "✕" },
};

export default function ConceptSummary({ mastery }: ConceptSummaryProps) {
  if (mastery.length === 0) return null;

  return (
    <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-5">
      <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-4">
        Concept mastery
      </p>
      <div className="space-y-2">
        {mastery.map((m, i) => {
          const cfg = MASTERY_CONFIG[m.mastery_level];
          const smartPct =
            m.decisions_faced > 0
              ? Math.round((m.smart_choices / m.decisions_faced) * 100)
              : 0;
          return (
            <motion.div
              key={m.concept}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
              className="flex items-center justify-between bg-[#0d0d0d] border border-[#1e5570] rounded-lg px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span style={{ color: cfg.color }} className="text-sm shrink-0">
                  {cfg.icon}
                </span>
                <span className="text-sm text-[#F0F0F0] capitalize truncate">
                  {m.concept.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#E0E0E0] hidden sm:block">
                  {smartPct}% smart
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
                >
                  {cfg.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
