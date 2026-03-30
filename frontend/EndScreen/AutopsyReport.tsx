"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EndingType } from "@/lib/types";
import type {
  DecisionHistoryEntry,
  GameState,
  ScoreResult,
  Scenario,
} from "@/lib/types";
import { getAutopsyReport } from "@/lib/api";
import ShareCard from "./ShareCard";
import ConceptSummary from "./ConceptSummary";

const ENDING_CONFIG: Record<
  EndingType,
  { headline: string; sub: string; color: string }
> = {
  [EndingType.BANKRUPT]: {
    headline: "💀 Company Bankrupt",
    sub: "The runway hit zero.",
    color: "#B25690",
  },
  [EndingType.SAVED]: {
    headline: "🎉 Company Saved!",
    sub: "Against the odds, you pulled it off.",
    color: "#EDC400",
  },
  [EndingType.STRUGGLING]: {
    headline: "⚠️ Barely Survived",
    sub: "Alive, but on life support.",
    color: "#EDC400",
  },
};

// ─── Animation wrapper ────────────────────────────────────────────────────────

function Section({
  delay,
  children,
  className,
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Decision timeline row ────────────────────────────────────────────────────

function DecisionRow({
  entry,
  scenario,
  index,
}: {
  entry: DecisionHistoryEntry;
  scenario: Scenario;
  index: number;
}) {
  const decision = scenario.decisions.find(
    (d) => d.decision_number === entry.decision_number
  );
  const chosenOption = decision?.options.find((o) => o.id === entry.option_id);
  const realOption = decision?.options.find((o) => o.is_what_real_company_did);

  const hChange = entry.health_score_change;
  const hColor = hChange >= 0 ? "#1D71BA" : "#B25690";
  const hSign = hChange > 0 ? "+" : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
      className="flex items-start gap-3 py-2.5 border-b border-[#1e5570] last:border-0"
    >
      {/* Decision number */}
      <span className="shrink-0 w-6 h-6 rounded bg-[#1e5570] text-[#E0E0E0] text-xs flex items-center justify-center font-mono mt-0.5">
        {entry.decision_number}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-0.5">
          {entry.concept.replace(/_/g, " ")}
        </p>
        <p className="text-sm text-[#F0F0F0] leading-snug mb-1">
          {chosenOption?.short_label ?? entry.option_id}
        </p>
        {entry.chose_what_real_company_did ? (
          <p className="text-xs text-[#B25690]">
            ✕ Same choice as the real {scenario.company} team
          </p>
        ) : entry.is_smart_choice ? (
          <p className="text-xs text-[#E0E0E0]">✓ Smart choice</p>
        ) : realOption ? (
          <p className="text-xs text-[#E0E0E0]">
            Real team chose: {realOption.short_label}
          </p>
        ) : null}
      </div>

      {/* Health delta */}
      <span
        className="shrink-0 text-xs font-mono font-bold tabular-nums"
        style={{ color: hColor }}
      >
        {hSign}{hChange.toFixed(0)}
      </span>
    </motion.div>
  );
}

// ─── Score breakdown row ──────────────────────────────────────────────────────

function ScoreRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  const color = positive ? "#1D71BA" : value < 0 ? "#B25690" : "#aaaaaa";
  const sign = value > 0 ? "+" : "";
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[#E0E0E0]">{label}</span>
      <span className="font-mono" style={{ color }}>
        {sign}{value}
      </span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AutopsyReportProps {
  scoreResult: ScoreResult;
  scenario: Scenario;
  gameState: GameState;
  endingType: EndingType;
  decisionHistory: DecisionHistoryEntry[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AutopsyReport({
  scoreResult,
  scenario,
  gameState: _gameState, // available for future use (e.g. final cash display)
  endingType,
  decisionHistory,
  onPlayAgain,
  onGoHome,
}: AutopsyReportProps) {
  const cfg = ENDING_CONFIG[endingType];
  const ending =
    endingType === EndingType.SAVED
      ? scenario.endings.saved
      : endingType === EndingType.BANKRUPT
      ? scenario.endings.bankrupt
      : scenario.endings.struggling;

  const smartCount = decisionHistory.filter((e) => e.is_smart_choice).length;
  const copiedCount = decisionHistory.filter(
    (e) => e.chose_what_real_company_did
  ).length;

  // AI Autopsy Report
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getAutopsyReport(
          scenario.id,
          scoreResult.final_state.health_score,
          endingType,
          scoreResult.final_state.cash,
          scoreResult.final_state.runway_months,
          decisionHistory,
          scenario.concepts_taught
        );
        setAiReport(res.report);
      } catch {
        setAiReport(null);
      } finally {
        setAiLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── 1. Dramatic header ── */}
        <Section delay={0} className="text-center">
          <p className="text-xs text-[#CCCCCC] uppercase tracking-widest mb-4">
            Autopsy Report · {scenario.company}
          </p>
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="text-4xl font-bold mb-2"
            style={{ color: cfg.color }}
          >
            {cfg.headline}
          </motion.h1>
          <p className="text-sm text-[#CCCCCC]">{cfg.sub}</p>
          <p className="text-xs text-[#E0E0E0] mt-1">{scenario.concept}</p>
        </Section>

        {/* ── 2. Final score ── */}
        <Section delay={0.2}>
          <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-1">
                  Final Score
                </p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-5xl font-bold font-mono text-white tabular-nums"
                >
                  {scoreResult.total_score}
                </motion.p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold mb-1" style={{ color: cfg.color }}>
                  {scoreResult.verdict}
                </p>
                <p className="text-xs text-[#E0E0E0]">out of 1000</p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="space-y-2 border-t border-[#1e5570] pt-4">
              <ScoreRow label="Base score (health × 10)" value={scoreResult.base_score} />
              {scoreResult.smart_choice_bonus > 0 && (
                <ScoreRow
                  label={`Smart choices (${Math.round(scoreResult.smart_choice_bonus / 50)} × +50)`}
                  value={scoreResult.smart_choice_bonus}
                  positive
                />
              )}
              {scoreResult.saved_bonus > 0 && (
                <ScoreRow
                  label="Company saved bonus"
                  value={scoreResult.saved_bonus}
                  positive
                />
              )}
              {scoreResult.real_company_penalty < 0 && (
                <ScoreRow
                  label={`Real company copies (${Math.abs(Math.round(scoreResult.real_company_penalty / 30))} × −30)`}
                  value={scoreResult.real_company_penalty}
                />
              )}
              <div className="flex justify-between text-xs pt-2 border-t border-[#1e5570]">
                <span className="font-semibold text-white">Total</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {scoreResult.total_score}
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 3. AI CEO Performance Review ── */}
        <Section delay={0.3}>
          <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">✦</span>
              <p className="text-xs text-[#E0E0E0] uppercase tracking-wider font-semibold">
                AI CEO Performance Review
              </p>
            </div>
            {aiLoading ? (
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-xs text-[#E0E0E0]"
              >
                Generating your personalized review...
              </motion.p>
            ) : aiReport ? (
              <p className="text-sm text-[#F0F0F0] leading-relaxed italic">
                &ldquo;{aiReport}&rdquo;
              </p>
            ) : null}
          </div>
        </Section>

        {/* ── 4. Real company comparison ── */}
        <Section delay={0.35}>
          <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-5">
            <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-3">
              What happened in real life
            </p>
            <p className="text-sm text-[#CCCCCC] leading-relaxed mb-3">
              {scenario.real_outcome}
            </p>
            <div
              className="rounded-lg p-3 border"
              style={{
                borderColor: `${cfg.color}30`,
                backgroundColor: `${cfg.color}08`,
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: cfg.color }}>
                Your ending vs. reality
              </p>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                {ending.story}
              </p>
              {ending.lesson && (
                <p className="text-xs text-[#E0E0E0] italic mt-2">
                  {ending.lesson}
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* ── 4. Concept mastery ── */}
        <Section delay={0.45}>
          <ConceptSummary mastery={scoreResult.concept_mastery} />
        </Section>

        {/* ── 5. Decision timeline ── */}
        <Section delay={0.55}>
          <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-5">
            <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-1">
              Your decisions
            </p>
            <p className="text-xs text-[#CCCCCC] mb-4">
              {smartCount} smart · {copiedCount} same as real company
            </p>
            <div>
              {decisionHistory.map((entry, i) => (
                <DecisionRow
                  key={entry.decision_number}
                  entry={entry}
                  scenario={scenario}
                  index={i}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* ── 6. What you learned ── */}
        <Section delay={0.65}>
          <div className="border-l-2 border-[#1D71BA] bg-[#EDC40008] rounded-r-xl pl-5 pr-5 py-4">
            <p className="text-xs text-[#E0E0E0] uppercase tracking-wider font-semibold mb-2">
              What you learned
            </p>
            <p className="text-sm text-[#F0F0F0] leading-relaxed">
              {scenario.what_you_learned_summary}
            </p>
          </div>
        </Section>

        {/* ── 7. Action buttons ── */}
        <Section delay={0.75}>
          <div className="flex gap-3">
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] active:bg-[#d0d0d0] transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onGoHome}
              className="flex-1 py-3 rounded-xl bg-[#1a5070] border border-[#2a6080] text-white text-sm font-semibold hover:bg-[#1e5570] transition-colors"
            >
              Try Another Scenario
            </button>
          </div>
        </Section>

        {/* ── 8. Shareable card ── */}
        <Section delay={0.85}>
          <ShareCard
            company={scenario.company}
            concept={scenario.concept}
            score={scoreResult.total_score}
            endingType={endingType}
          />
        </Section>

      </div>
    </div>
  );
}
