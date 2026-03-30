"use client";

import { motion } from "framer-motion";
import type { Decision } from "@/lib/types/game";
import DecisionCard from "./DecisionCard";

interface StoryPanelProps {
  decisionNumber: number;
  decision: Decision;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export default function StoryPanel({
  decisionNumber,
  decision,
  onSelect,
  disabled,
}: StoryPanelProps) {
  return (
    <motion.div
      key={decision.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4"
    >
      {/* Decision header */}
      <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-[#E0E0E0]">
            DECISION {decisionNumber} OF 8
          </span>
          <span className="text-[#333333]">•</span>
          <span className="text-xs font-mono text-[#E0E0E0] uppercase tracking-wider">
            {decision.concept_being_taught.replace(/_/g, " ")}
          </span>
        </div>

        <h2 className="text-base font-semibold text-white leading-snug mb-2">
          {decision.situation}
        </h2>

        <p className="text-sm text-[#CCCCCC] leading-relaxed">
          {decision.context}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {decision.options.map((option, i) => (
          <DecisionCard
            key={option.id}
            option={option}
            onSelect={onSelect}
            disabled={disabled}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}
