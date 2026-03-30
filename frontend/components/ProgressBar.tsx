"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  company: string;
  concept: string;
  emoji: string;
}

export default function ProgressBar({
  current,
  total,
  company,
  concept,
  emoji,
}: ProgressBarProps) {
  const pct = (current / total) * 100;

  return (
    <div className="bg-[#1a5070] border-b border-[#2a6080] px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Company info */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{emoji}</span>
          <div className="min-w-0">
            <p className="text-xs text-[#CCCCCC] truncate">
              {company} — {concept}
            </p>
          </div>
        </div>

        {/* Progress track */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#1e5570] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-[#CCCCCC] shrink-0">
            {current}/{total}
          </span>
        </div>

        {/* Step indicators */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i < current
                  ? "bg-white"
                  : i === current
                  ? "bg-[#CCCCCC]"
                  : "bg-[#2a6080]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
