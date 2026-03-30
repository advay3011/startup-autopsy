"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { glossary } from "@/data/companies";

interface TermTooltipProps {
  children: React.ReactNode;
  term?: string;
}

/**
 * Highlights a financial term in amber and shows a plain-English tooltip on hover/click.
 * The `term` prop specifies the glossary key (lowercase). Falls back to inner text if omitted.
 */
export default function TermTooltip({ children, term }: TermTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const key = term?.toLowerCase();
  const definition = key ? glossary[key] : undefined;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!definition) {
    return <span>{children}</span>;
  }

  return (
    <span ref={ref} className="relative inline-block">
      <span
        className="text-[#E0E0E0] cursor-pointer underline decoration-dotted underline-offset-2 hover:text-[#fbbf24] transition-colors"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 bottom-full mb-2 w-64 bg-[#1e5570] border border-[#333333] rounded-lg p-3 shadow-xl"
          >
            <p className="text-xs font-semibold text-[#E0E0E0] mb-1 uppercase tracking-wider">
              {key}
            </p>
            <p className="text-xs text-[#F0F0F0] leading-relaxed">{definition}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
