"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EndingType } from "@/lib/types";

interface ShareCardProps {
  company: string;
  concept: string;
  score: number;
  endingType: EndingType;
}

const ENDING_VERB: Record<EndingType, string> = {
  [EndingType.BANKRUPT]:   "bankrupted",
  [EndingType.SAVED]:      "saved",
  [EndingType.STRUGGLING]: "barely survived with",
};

export default function ShareCard({
  company,
  concept,
  score,
  endingType,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I ${ENDING_VERB[endingType]} ${company} and scored ${score}/1000 on StartupAutopsy — a financial literacy simulation built for Hackonomics 2026. Can you do better? (${concept})`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently fail
    }
  }

  return (
    <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-5">
      <p className="text-xs text-[#E0E0E0] uppercase tracking-wider mb-3">
        Share your result
      </p>

      {/* Copyable text preview */}
      <div className="bg-[#0d0d0d] border border-[#1e5570] rounded-lg px-4 py-3 mb-4">
        <p className="text-sm text-[#CCCCCC] leading-relaxed">
          <span className="text-white font-bold">
            I scored {score}/1000 on StartupAutopsy.
          </span>{" "}
          {company} · {endingType}
        </p>
      </div>

      {/* Copy button */}
      <motion.button
        onClick={() => void handleCopy()}
        whileTap={{ scale: 0.97 }}
        className="w-full py-2.5 rounded-lg border border-[#2a2a2a] text-sm font-medium transition-colors duration-150"
        style={{
          backgroundColor: copied ? "#EDC40018" : "transparent",
          borderColor: copied ? "#E0E0E040" : "#2a2a2a",
          color: copied ? "#1D71BA" : "#CCCCCC",
        }}
      >
        {copied ? "✓ Copied to clipboard" : "Copy to clipboard"}
      </motion.button>
    </div>
  );
}
