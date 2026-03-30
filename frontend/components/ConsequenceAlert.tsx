"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ConsequenceResult } from "@/lib/types/game";

interface ConsequenceAlertProps {
  result: ConsequenceResult;
  onContinue: () => void;
  onGetExplanation: () => void;
  aiExplanation?: string | null;
  loadingExplanation?: boolean;
}

const OUTCOME_COLORS: Record<string, string> = {
  SMART: "#1D71BA",
  RISKY: "#B25690",
  CONSERVATIVE: "#1D71BA",
  BOLD: "#1D71BA",
};

export default function ConsequenceAlert({
  result,
  onContinue,
  onGetExplanation,
  aiExplanation,
  loadingExplanation,
}: ConsequenceAlertProps) {
  const { option_chosen, real_company_option, chose_what_real_company_did } = result;
  const outcomeColor =
    OUTCOME_COLORS[option_chosen.outcome_label] ?? "#CCCCCC";
  const isSmart = option_chosen.outcome_label === "SMART";
  const isGameOver = result.game_over;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-lg bg-[#1a5070] border border-[#2a6080] rounded-2xl overflow-hidden"
      >
        {/* Header bar */}
        <div
          className="h-1"
          style={{ backgroundColor: outcomeColor }}
        />

        <div className="p-6">
          {/* Outcome label */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={{
                color: outcomeColor,
                backgroundColor: `${outcomeColor}15`,
              }}
            >
              {option_chosen.outcome_label}
            </span>
            {isGameOver && (
              <span className="text-xs font-bold text-[#B25690] animate-pulse">
                ● GAME OVER
              </span>
            )}
          </div>

          {/* Consequence story */}
          <p className="text-base font-medium text-white mb-3 leading-relaxed">
            {option_chosen.consequence_story}
          </p>

          {/* Plain English explanation */}
          <div className="bg-[#123a50] border border-[#1e1e1e] rounded-lg p-4 mb-4">
            <p className="text-xs text-[#CCCCCC] uppercase tracking-wider mb-2">
              What this means
            </p>
            <p className="text-sm text-[#F0F0F0] leading-relaxed">
              {option_chosen.plain_english_explanation}
            </p>
          </div>

          {/* Concept box */}
          <div
            className="border rounded-lg p-3 mb-4"
            style={{
              borderColor: `${outcomeColor}30`,
              backgroundColor: `${outcomeColor}08`,
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: outcomeColor }}>
              Financial Concept
            </p>
            <p className="text-sm text-[#aaaaaa] leading-relaxed">
              {option_chosen.concept_explained}
            </p>
          </div>

          {/* Real company comparison */}
          <div className="border border-[#1e1e1e] rounded-lg p-3 mb-4">
            <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-2">
              What the real company did
            </p>
            <p className="text-sm text-[#CCCCCC] mb-1">
              {real_company_option.text}
            </p>
            {chose_what_real_company_did ? (
              <p className="text-xs text-[#B25690]">
                ↑ You made the same mistake they did.
              </p>
            ) : isSmart ? (
              <p className="text-xs text-[#E0E0E0]">
                ✓ You made a smarter call than the real founders.
              </p>
            ) : (
              <p className="text-xs text-[#E0E0E0]">
                You chose differently than the real company.
              </p>
            )}
          </div>

          {/* Learning moment */}
          <div className="bg-[#0d0d0d] rounded-lg p-3 mb-4">
            <p className="text-xs text-[#E0E0E0] mb-1">Key Lesson</p>
            <p className="text-xs text-[#CCCCCC] italic leading-relaxed">
              &ldquo;{result.learning_moment}&rdquo;
            </p>
          </div>

          {/* AI Explanation */}
          {aiExplanation ? (
            <div className="border border-[#1D71BA]/20 rounded-lg p-3 mb-4 bg-[#1D71BA]/5">
              <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-2">
                ✦ AI Tutor
              </p>
              <p className="text-sm text-[#F0F0F0] leading-relaxed">
                {aiExplanation}
              </p>
            </div>
          ) : (
            <button
              onClick={onGetExplanation}
              disabled={loadingExplanation}
              className="w-full text-center text-xs text-[#E0E0E0] hover:text-[#E0E0E0] transition-colors py-2 mb-2 disabled:opacity-50"
            >
              {loadingExplanation
                ? "Getting AI explanation..."
                : "✦ Get plain English explanation from AI tutor"}
            </button>
          )}

          {/* Continue */}
          <button
            onClick={onContinue}
            className="w-full bg-white text-black text-sm font-semibold py-3 rounded-xl hover:bg-[#f0f0f0] transition-colors active:scale-[0.98]"
          >
            {isGameOver
              ? "See Final Results"
              : result.next_decision
              ? "Next Decision →"
              : "Complete →"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
