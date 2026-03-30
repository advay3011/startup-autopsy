"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DecisionCard from "@/components/Game/DecisionCard";
import { submitDecision, getHint } from "@/lib/api";
import type { ConsequenceResult, Decision, GameState } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface StoryPanelProps {
  scenarioId: string;
  company: string;
  companyEmoji: string;
  decision: Decision;
  gameState: GameState;
  isLoading: boolean;
  onDecisionMade: (optionId: string, consequence: ConsequenceResult) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StoryPanel({
  scenarioId,
  company,
  companyEmoji,
  decision,
  gameState,
  isLoading,
  onDecisionMade,
}: StoryPanelProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [consequence, setConsequence] = useState<ConsequenceResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shuffledOptions = useMemo(() => {
    const opts = [...decision.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [decision.id]);

  const realOption = decision.options.find((o) => o.is_what_real_company_did);
  const hasDecided = consequence !== null;

  // AI Hint — show when health is below 40
  const [hint, setHint] = useState<string | null>(null);
  const showHint = gameState.health_score < 40 && !hasDecided;

  useEffect(() => {
    if (!showHint) return;
    void (async () => {
      try {
        const res = await getHint(
          scenarioId,
          gameState.health_score,
          gameState.cash,
          gameState.runway_months,
          gameState.monthly_burn,
          decision.concept_being_taught
        );
        if (res.hint) setHint(res.hint);
      } catch {
        // silently fail
      }
    })();
  }, [showHint, decision.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSelect(optionId: string) {
    if (submitting || hasDecided || isLoading) return;

    setSelectedOptionId(optionId);
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitDecision({
        scenarioId,
        decisionNumber: decision.decision_number,
        optionId,
        currentGameState: gameState,
      });
      setConsequence(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit decision.");
      setSelectedOptionId(null);
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (!consequence || !selectedOptionId) return;
    onDecisionMade(selectedOptionId, consequence);
  }

  return (
    <motion.div
      key={decision.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      {/* ── Situation header ── */}
      <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-[#E0E0E0] uppercase tracking-wider">
            Decision {decision.decision_number} of 8
          </span>
          <span className="text-[#333333]">·</span>
          <span className="text-xs font-mono text-[#E0E0E0] uppercase tracking-wider">
            {decision.concept_being_taught.replace(/_/g, " ")}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-white leading-snug mb-2">
          {decision.situation}
        </h2>
        <p className="text-sm text-[#CCCCCC] leading-relaxed">
          {decision.context}
        </p>
      </div>

      {/* ── AI Hint (when struggling) ── */}
      <AnimatePresence>
        {showHint && hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-l-2 border-[#1D71BA] bg-[#EDC40008] rounded-r-xl pl-4 pr-4 py-3">
              <p className="text-xs text-[#E0E0E0] uppercase tracking-wider font-semibold mb-1">
                ✦ AI Advisor
              </p>
              <p className="text-xs text-[#E0E0E0] leading-relaxed italic">
                {hint}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-[#fca5a5] bg-[#B25690]/10 border border-[#B25690]/30 rounded-lg px-4 py-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2×2 Decision grid ── */}
      <div className="grid grid-cols-2 gap-3">
        {shuffledOptions.map((option) => {
          const isSelected = option.id === selectedOptionId;
          // After a decision: disable all cards. During submission: disable all.
          const isDisabled = isLoading || submitting || (hasDecided && !isSelected);
          // Selected card stays interactive-looking but click is blocked by hasDecided guard.
          const isCardDisabled = isLoading || submitting || hasDecided;

          return (
            <DecisionCard
              key={option.id}
              option={option}
              onSelect={handleSelect}
              isDisabled={isCardDisabled}
              isSelected={isSelected}
              showHoverPreview={false}
            />
          );
        })}
      </div>

      {/* ── Loading indicator ── */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-[#E0E0E0]"
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ●
            </motion.span>
            Calculating consequences…
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post-decision reveal ── */}
      <AnimatePresence>
        {hasDecided && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            {/* Learning moment */}
            <div className="border-l-2 border-[#1D71BA] bg-[#EDC40008] rounded-r-xl pl-4 pr-4 py-3">
              <p className="text-xs text-[#E0E0E0] uppercase tracking-wider font-semibold mb-1">
                The lesson
              </p>
              <p className="text-sm text-[#F0F0F0] leading-relaxed">
                {decision.learning_moment}
              </p>
            </div>

            {/* Real company reveal */}
            {realOption && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="bg-[#123a50] border border-[#1e1e1e] rounded-xl px-4 py-3"
              >
                <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-2">
                  {companyEmoji} What the real {company} team did →
                </p>
                <p className="text-sm text-[#CCCCCC] leading-snug">
                  <span className="text-white font-medium">
                    {realOption.short_label}
                  </span>
                  {" — "}
                  {realOption.text}
                </p>
                {realOption.real_company_note && (
                  <p className="text-xs text-[#E0E0E0] mt-1.5 italic">
                    {realOption.real_company_note}
                  </p>
                )}
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              onClick={handleContinue}
              className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] active:bg-[#F0F0F0] transition-colors duration-150"
            >
              {consequence?.game_over ? "See your autopsy report →" : "Continue →"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
