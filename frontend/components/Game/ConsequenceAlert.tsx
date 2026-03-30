"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EndingType } from "@/lib/types";
import type { ConsequenceResult } from "@/lib/types";
import { getFollowup } from "@/lib/api";

// ─── Outcome → header config ─────────────────────────────────────────────────

const OUTCOME_HEADER: Record<
  string,
  { text: string; color: string }
> = {
  SMART:      { text: "Smart Move.",      color: "#EDC400" },
  RIGHT_CALL: { text: "Smart Move.",      color: "#EDC400" },
  RISKY:      { text: "Bold Decision.",   color: "#EDC400" },
  BOLD:       { text: "Bold Decision.",   color: "#EDC400" },
  CONSERVATIVE: { text: "Playing it Safe.", color: "#EDC400" },
};

const ENDING_LABEL: Record<EndingType, { text: string; color: string }> = {
  [EndingType.BANKRUPT]:   { text: "BANKRUPT",   color: "#B25690" },
  [EndingType.SAVED]:      { text: "SAVED",      color: "#EDC400" },
  [EndingType.STRUGGLING]: { text: "STRUGGLING", color: "#EDC400" },
};

// ─── Impact pill ─────────────────────────────────────────────────────────────

interface ImpactPillProps {
  label: string;
  value: number;
  format: "cash" | "months" | "pts";
  invert?: boolean;
}

function formatRaw(value: number, format: ImpactPillProps["format"]): string {
  const abs = Math.abs(value);
  if (format === "cash") {
    if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(0)}M`;
    return `${(abs / 1_000).toFixed(0)}K`;
  }
  if (format === "months") return abs.toFixed(1);
  return abs.toFixed(0);
}

function formatUnit(format: ImpactPillProps["format"]): string {
  if (format === "cash") return "";
  if (format === "months") return " mo";
  return " pts";
}

function ImpactPill({ label, value, format, invert = false }: ImpactPillProps) {
  const positive = invert ? value < 0 : value > 0;
  const color = value === 0 ? "#E0E0E0" : positive ? "#1D71BA" : "#B25690";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const prefix = format === "cash" ? "$" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-[#123a50] border border-[#1e1e1e] min-w-[90px]"
    >
      <span className="text-xs text-[#E0E0E0] uppercase tracking-wider">
        {label}
      </span>
      <span
        className="text-xl font-bold font-mono"
        style={{ color }}
      >
        {sign}{prefix}{formatRaw(value, format)}{formatUnit(format)}
      </span>
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConsequenceAlertProps {
  consequence: ConsequenceResult;
  onContinue: () => void;
  companyName: string;
  companyEmoji: string;
  scenarioId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConsequenceAlert({
  consequence,
  onContinue,
  companyName,
  companyEmoji,
  scenarioId,
}: ConsequenceAlertProps) {
  const { option_chosen, game_over, ending_type, ending_details } = consequence;
  const impact = option_chosen.financial_impact;

  const isGameOver = game_over && ending_type !== null;
  const endingCfg = ending_type ? ENDING_LABEL[ending_type] : null;

  const headerCfg = isGameOver
    ? { text: "Game Over.", color: "#B25690" }
    : (OUTCOME_HEADER[option_chosen.outcome_label] ?? { text: "Decision Made.", color: "#CCCCCC" });

  // Chat state
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  async function handleSend() {
    if (!question.trim() || chatLoading) return;
    const q = question.trim();
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setChatLoading(true);
    try {
      const context = messages.map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.text}`).join("\n");
      const fullContext = context
        ? `${option_chosen.consequence_story}\n\nPrevious conversation:\n${context}\n\nNew question: ${q}`
        : option_chosen.consequence_story;
      const res = await getFollowup(
        scenarioId,
        option_chosen.concept_explained,
        fullContext,
        q
      );
      setMessages((prev) => [...prev, { role: "ai", text: res.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Couldn't get an answer right now. Try again!" }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={
        isGameOver
          ? {
              opacity: 1,
              backgroundColor: ["#000000", "#1a0000", "#000000"],
            }
          : { opacity: 1, backgroundColor: "#000000cc" }
      }
      exit={{ opacity: 0 }}
      transition={
        isGameOver
          ? { opacity: { duration: 0.4 }, backgroundColor: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
          : { duration: 0.3 }
      }
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.05 }}
        className="w-full max-w-xl bg-[#1a5070] border border-[#2a6080] rounded-2xl overflow-hidden"
      >
        {/* Color bar */}
        <motion.div
          className="h-1"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          style={{ backgroundColor: headerCfg.color }}
        />

        <div className="p-6 space-y-5">
          {/* ── Dramatic header ── */}
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={
                isGameOver
                  ? { opacity: [1, 0.5, 1], y: 0 }
                  : { opacity: 1, y: 0 }
              }
              transition={
                isGameOver
                  ? { opacity: { duration: 1.4, repeat: Infinity }, y: { duration: 0.3 } }
                  : { duration: 0.35 }
              }
              className="text-3xl font-bold tracking-tight"
              style={{ color: headerCfg.color }}
            >
              {headerCfg.text}
            </motion.h1>

            {endingCfg && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block text-xs font-bold px-2 py-0.5 rounded"
                style={{ color: endingCfg.color, backgroundColor: `${endingCfg.color}18` }}
              >
                {endingCfg.text}
              </motion.span>
            )}
          </div>

          {/* ── Consequence story ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-base text-white leading-relaxed"
          >
            {option_chosen.consequence_story}
          </motion.p>

          {/* ── Financial impact ── */}
          <div className="flex flex-wrap gap-3 justify-center">
            {impact.cash_change !== 0 && (
              <ImpactPill label="Cash" value={impact.cash_change} format="cash" />
            )}
            {impact.runway_change !== 0 && (
              <ImpactPill label="Runway" value={impact.runway_change} format="months" />
            )}
            {impact.health_score_change !== 0 && (
              <ImpactPill label="Health" value={impact.health_score_change} format="pts" />
            )}
          </div>

          {/* ── Conditional content ── */}
          {isGameOver ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-3"
            >
              {/* Ending story / epitaph */}
              {ending_details && (
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    borderColor: `${endingCfg?.color ?? "#333333"}30`,
                    backgroundColor: `${endingCfg?.color ?? "#333333"}08`,
                  }}
                >
                  {ending_details.epitaph && (
                    <p className="text-sm font-medium text-white mb-2">
                      &ldquo;{ending_details.epitaph}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-[#CCCCCC] leading-relaxed">
                    {ending_details.story}
                  </p>
                </div>
              )}

              {/* Company comparison */}
              <p className="text-xs text-[#E0E0E0] text-center">
                {companyEmoji} The real {companyName} team made similar choices.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="border-l-2 border-[#1D71BA] bg-[#EDC40008] rounded-r-xl pl-4 pr-4 py-3"
            >
              <p className="text-xs text-[#E0E0E0] uppercase tracking-wider font-semibold mb-1">
                What this means
              </p>
              <p className="text-sm text-[#F0F0F0] leading-relaxed">
                {option_chosen.plain_english_explanation}
              </p>
            </motion.div>
          )}

          {/* ── AI Tutor Chat ── */}
          {!isGameOver && (
            <div className="space-y-2">
              {!chatOpen && messages.length === 0 && (
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full text-center text-xs py-2 rounded-lg transition-colors"
                  style={{ color: "#EDC400", background: "#EDC40008" }}
                >
                  ✦ Ask the AI tutor about this decision
                </button>
              )}

              {(chatOpen || messages.length > 0) && (
                <div className="border border-[#2a6080] rounded-xl overflow-hidden" style={{ background: "#0a0a0a" }}>
                  {/* Chat header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e5570]">
                    <span className="text-[10px] text-[#E0E0E0] uppercase tracking-widest font-semibold">✦ AI Tutor</span>
                    <button
                      onClick={() => { setChatOpen(false); setMessages([]); }}
                      className="text-[10px] text-[#CCCCCC] hover:text-[#CCCCCC]"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Messages */}
                  {messages.length > 0 && (
                    <div className="max-h-40 overflow-y-auto px-3 py-2 space-y-2">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className="text-xs px-3 py-1.5 rounded-lg max-w-[85%] leading-relaxed"
                            style={{
                              background: msg.role === "user" ? "#EDC40020" : "#1a5070",
                              color: msg.role === "user" ? "#1D71BA" : "#F0F0F0",
                              border: `1px solid ${msg.role === "user" ? "#EDC40030" : "#1e5570"}`,
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-xs px-3 py-1.5 rounded-lg text-[#E0E0E0]"
                            style={{ background: "#1a5070", border: "1px solid #1e5570" }}
                          >
                            Thinking...
                          </motion.div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-2 px-3 py-2 border-t border-[#1e5570]">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder={messages.length === 0 ? "Why did this happen?" : "Ask a follow-up..."}
                      className="flex-1 text-xs bg-transparent text-white placeholder-[#CCCCCC] focus:outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={chatLoading || !question.trim()}
                      className="text-xs px-2 py-1 rounded font-semibold transition-colors disabled:opacity-30"
                      style={{ color: "#EDC400" }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CTA button ── */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onContinue}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-colors duration-150"
            style={
              isGameOver
                ? { backgroundColor: endingCfg?.color ?? "#B25690", color: "#000000" }
                : { backgroundColor: "#ffffff", color: "#000000" }
            }
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGameOver ? "See Your Autopsy Report →" : "Continue →"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
