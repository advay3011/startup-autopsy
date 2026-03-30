"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { glossary } from "@/data/companies";

interface ConceptIntroProps {
  company: string;
  emoji: string;
  concept: string;
  conceptDescription: string;
  conceptAnalogy: string;
  openingStory: string;
  conceptsTaught: string[];
  difficulty: string;
  onStart: () => void;
  onBack: () => void;
  onNewGame?: () => void;
  hasSavedGame?: boolean;
}

// ─── Concept flowcharts (visual explanation per concept) ──────────────────────

const CONCEPT_FLOWS: Record<string, { title: string; steps: { label: string; detail: string; color: string; icon: string }[] }> = {
  "Burn Rate & Runway": {
    title: "How Burn Rate Works",
    steps: [
      { label: "Cash In Bank", detail: "Total money you have right now", color: "#EDC400", icon: "💰" },
      { label: "Monthly Burn", detail: "Money spent every month (salaries, rent, marketing)", color: "#B25690", icon: "🔥" },
      { label: "Runway", detail: "Cash ÷ Burn = months until you're broke", color: "#EDC400", icon: "⏳" },
      { label: "Zero", detail: "When runway hits 0, the company dies", color: "#B25690", icon: "💀" },
    ],
  },
  "Market Timing": {
    title: "Why Timing Matters",
    steps: [
      { label: "Great Product", detail: "You built something people could love", color: "#EDC400", icon: "✨" },
      { label: "Wrong Moment", detail: "But the market isn't ready (or just changed)", color: "#EDC400", icon: "📅" },
      { label: "No Customers", detail: "Nobody buys because the timing is off", color: "#B25690", icon: "👻" },
      { label: "Cash Runs Out", detail: "You can't wait forever — money disappears", color: "#B25690", icon: "💀" },
    ],
  },
  "Unit Economics": {
    title: "The Math Per Customer",
    steps: [
      { label: "Cost to Acquire", detail: "How much you spend to get ONE customer (CAC)", color: "#B25690", icon: "💸" },
      { label: "Revenue Per User", detail: "How much that customer pays you", color: "#EDC400", icon: "💵" },
      { label: "Profit or Loss?", detail: "If cost > revenue, every new customer loses money", color: "#EDC400", icon: "📊" },
      { label: "Scale = Death", detail: "More customers × negative margin = faster death", color: "#B25690", icon: "📉" },
    ],
  },
  "Market Validation": {
    title: "Does Anyone Actually Need This?",
    steps: [
      { label: "The Idea", detail: "You think you've found a problem worth solving", color: "#EDC400", icon: "💡" },
      { label: "Build It", detail: "Spend millions making the product", color: "#EDC400", icon: "🔨" },
      { label: "Launch It", detail: "Put it in front of real customers", color: "#EDC400", icon: "🚀" },
      { label: "Nobody Cares", detail: "Turns out the problem wasn't real", color: "#B25690", icon: "🦗" },
    ],
  },
  "Valuation & Overspending": {
    title: "When Hype Meets Reality",
    steps: [
      { label: "Raise Big", detail: "Investors give you billions based on potential", color: "#EDC400", icon: "🎉" },
      { label: "Spend Big", detail: "You act like you're already worth that much", color: "#EDC400", icon: "🏢" },
      { label: "No Profit", detail: "Revenue never catches up to spending", color: "#B25690", icon: "📉" },
      { label: "Collapse", detail: "Reality hits — valuation crashes overnight", color: "#B25690", icon: "💥" },
    ],
  },
  "Fundraising Gone Wrong": {
    title: "Too Much Money, Too Fast",
    steps: [
      { label: "Raise at $47B", detail: "Take money at an insane valuation", color: "#EDC400", icon: "🚀" },
      { label: "Impossible Bar", detail: "Now you MUST grow into that number", color: "#EDC400", icon: "📏" },
      { label: "Overspend", detail: "Burn cash trying to justify the valuation", color: "#B25690", icon: "🔥" },
      { label: "IPO Fails", detail: "Public markets see through the hype", color: "#B25690", icon: "📉" },
    ],
  },
  "Hypergrowth Without Foundation": {
    title: "Growing on a Broken Foundation",
    steps: [
      { label: "Grow 10x", detail: "Hire fast, sell fast, move fast", color: "#EDC400", icon: "📈" },
      { label: "Skip Rules", detail: "Cut corners on compliance and quality", color: "#EDC400", icon: "⚠️" },
      { label: "Regulators Notice", detail: "Fines, lawsuits, investigations", color: "#B25690", icon: "👮" },
      { label: "CEO Fired", detail: "The foundation crumbles under the weight", color: "#B25690", icon: "💀" },
    ],
  },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  beginner: { label: "BEGINNER", color: "#EDC400" },
  intermediate: { label: "INTERMEDIATE", color: "#EDC400" },
  expert: { label: "EXPERT", color: "#B25690" },
};

export default function ConceptIntro({
  company,
  emoji,
  concept,
  conceptDescription,
  conceptAnalogy,
  openingStory,
  conceptsTaught,
  difficulty,
  onStart,
  onBack,
  onNewGame,
  hasSavedGame,
}: ConceptIntroProps) {
  const flow = CONCEPT_FLOWS[concept];
  const diff = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.beginner;
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #144058 0%, #1a5070 50%, #144058 100%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="text-xs mb-6 transition-colors"
          style={{ color: "#CCCCCC" }}
        >
          ← Back to scenarios
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-3 block">{emoji}</span>
          <h1 className="text-3xl font-bold text-white mb-1">{company}</h1>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-sm font-semibold" style={{ color: "#EDC400" }}>{concept}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ color: diff.color, background: `${diff.color}15` }}>
              {diff.label}
            </span>
          </div>
          <p className="text-sm" style={{ color: "#E0E0E0" }}>{conceptDescription}</p>
        </div>

        {/* Concept Analogy Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl p-5 mb-6"
          style={{ background: "#1a5070", border: "1px solid #2a6080" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#EDC400" }}>
            Think of it this way
          </p>
          <p className="text-sm text-[#F0F0F0] leading-relaxed">{conceptAnalogy}</p>
        </motion.div>

        {/* Flowchart */}
        {flow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl p-5 mb-6"
            style={{ background: "#1a5070", border: "1px solid #2a6080" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#EDC400" }}>
              {flow.title}
            </p>
            <div className="space-y-0">
              {flow.steps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex items-start gap-3 py-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                        {step.icon}
                      </div>
                      {i < flow.steps.length - 1 && (
                        <div className="w-0.5 h-6 mt-1" style={{ background: "#2a6080" }} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <p className="text-xs" style={{ color: "#E0E0E0" }}>{step.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* What you'll learn */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-5 mb-6"
          style={{ background: "#1a5070", border: "1px solid #2a6080" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#EDC400" }}>
            Concepts you'll learn — tap to preview
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {conceptsTaught.map((c) => {
              const key = c.replace(/_/g, " ");
              const isOpen = expandedConcept === key;
              return (
                <button
                  key={c}
                  onClick={() => setExpandedConcept(isOpen ? null : key)}
                  className="text-xs px-2.5 py-1 rounded-lg font-mono transition-all duration-200"
                  style={{
                    background: isOpen ? "#EDC40025" : "#EDC40015",
                    color: isOpen ? "#ffffff" : "#EDC400",
                    border: isOpen ? "1px solid #EDC400" : "1px solid #2a6080",
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {expandedConcept && glossary[expandedConcept] && (
              <motion.div
                key={expandedConcept}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg p-3 mt-1" style={{ background: "#144058", border: "1px solid #2a6080" }}>
                  <p className="text-xs font-semibold text-white mb-1 capitalize">{expandedConcept}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#EDC400" }}>
                    {glossary[expandedConcept]}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Opening story */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl p-5 mb-8"
          style={{ background: "#EDC40008", border: "1px solid #EDC40020" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#EDC400" }}>
            Your briefing
          </p>
          <p className="text-sm text-white leading-relaxed italic">
            &ldquo;{openingStory}&rdquo;
          </p>
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="px-10 py-3.5 rounded-xl text-sm font-bold text-white transition-shadow"
            style={{
              background: "linear-gradient(135deg, #B25690, #8a3d6d)",
              boxShadow: "0 0 25px #B2569040",
            }}
          >
            {hasSavedGame ? "Resume Game →" : "Start Playing →"}
          </motion.button>
          {hasSavedGame && onNewGame && (
            <button
              onClick={onNewGame}
              className="block mx-auto text-xs font-semibold px-6 py-2 rounded-lg transition-colors"
              style={{ color: "#E0E0E0", border: "1px solid #2a6080" }}
            >
              Start New Game
            </button>
          )}
          {hasSavedGame && (
            <p className="text-[10px]" style={{ color: "#EDC400" }}>
              You have a saved game in progress
            </p>
          )}
          <p className="text-[10px]" style={{ color: "#2a6080" }}>
            8 decisions · 4 choices each · real financial data
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
