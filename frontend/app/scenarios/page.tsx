"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { companies } from "@/data/companies";

const AVAILABLE_IDS = new Set([
  "quibi_burn_rate",
  "quibi_market_timing",
  "juicero_unit_economics",
  "juicero_market_validation",
]);

const NAV_ITEMS = [
  { label: "All Scenarios", filter: null },
  { label: "Burn Rate", filter: "Burn Rate" },
  { label: "Unit Economics", filter: "Unit Economics" },
  { label: "Market Timing", filter: "Market Timing" },
  { label: "Market Validation", filter: "Market Validation" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#71B379",
  intermediate: "#EDC400",
  expert: "#B25690",
};

export default function HomePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allScenarios = companies.flatMap((c) =>
    c.scenarios.map((s) => ({ ...s, companyDescription: c.description }))
  );

  const filtered = activeFilter
    ? allScenarios.filter((s) => s.concept.includes(activeFilter))
    : allScenarios;

  const featured = allScenarios.find((s) => s.id === "quibi_burn_rate")!;

  function handlePlay(id: string) {
    if (AVAILABLE_IDS.has(id)) router.push(`/play/${id}`);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #144058 0%, #1a5070 50%, #144058 100%)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="fixed top-0 left-0 h-screen w-[220px] flex flex-col border-r z-30"
        style={{ background: "#1a5070", borderColor: "#2a6080" }}
      >
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "#2a6080" }}>
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">StartupAutopsy</h1>
              <p className="text-[10px]" style={{ color: "#EDC400" }}>Financial Simulation</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: "#EDC400" }}>
            Scenarios
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = activeFilter === item.filter;
            return (
              <button
                key={item.label}
                onClick={() => setActiveFilter(item.filter)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: isActive ? "#B2569020" : "transparent",
                  color: isActive ? "#EDC400" : "#E0E0E0",
                  borderLeft: isActive ? "2px solid #B25690" : "2px solid transparent",
                }}
              >
                {item.label}
              </button>
            );
          })}

          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: "#2a6080" }}>
              Coming Soon
            </p>
            {["🏠 WeWork", "💻 Zenefits"].map((label) => (
              <div
                key={label}
                className="px-3 py-2 rounded-lg text-sm opacity-40 cursor-not-allowed"
                style={{ color: "#2a6080" }}
              >
                {label}
              </div>
            ))}
          </div>
        </nav>

        <div className="px-5 py-4 border-t" style={{ borderColor: "#2a6080" }}>
          <div
            className="text-center text-[10px] font-semibold uppercase tracking-widest py-2 rounded-lg"
            style={{ background: "#71B37920", color: "#71B379" }}
          >
            Hackonomics 2026
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ml-[220px] flex-1 px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">StartupAutopsy</h1>
          <p className="text-sm mt-1" style={{ color: "#E0E0E0" }}>
            Step into the CEO chair. Make the decisions. Learn why they failed.
          </p>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => handlePlay(featured.id)}
          className="relative overflow-hidden rounded-2xl cursor-pointer group mb-10"
          style={{
            background: "linear-gradient(135deg, #1a5070 0%, #2a6080 50%, #1a5070 100%)",
            border: "1px solid #2a6080",
            minHeight: 280,
          }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: "radial-gradient(ellipse at 70% 50%, #B2569020 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 p-10 flex flex-col justify-between h-full" style={{ minHeight: 280 }}>
            <div>
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                style={{ background: "#EDC40030", color: "#EDC400" }}
              >
                ★ Featured
              </span>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">{featured.emoji}</span>
                <h2 className="text-5xl font-bold text-white tracking-tight">{featured.company}</h2>
              </div>
              <p className="text-lg mb-1" style={{ color: "#EDC400" }}>
                {featured.tagline}
              </p>
              <p className="text-sm max-w-lg" style={{ color: "#E0E0E0" }}>
                {featured.conceptDescription}
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded"
                  style={{ background: "#71B37920", color: "#71B379" }}
                >
                  BEGINNER
                </span>
                <span className="text-xs" style={{ color: "#CCCCCC" }}>
                  8 decisions · 4 choices each
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-shadow"
                style={{
                  background: "linear-gradient(135deg, #B25690, #8a3d6d)",
                  boxShadow: "0 0 20px #B2569040",
                }}
              >
                Play Now →
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Available Scenarios</h3>
          <span className="text-xs" style={{ color: "#CCCCCC" }}>
            {filtered.length} scenario{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((scenario, i) => {
            const available = AVAILABLE_IDS.has(scenario.id);
            const isHovered = hoveredId === scenario.id;

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                onHoverStart={() => setHoveredId(scenario.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => handlePlay(scenario.id)}
                className="relative rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  background: "#1a5070",
                  border: `1px solid ${isHovered && available ? "#B2569060" : "#2a6080"}`,
                  cursor: available ? "pointer" : "not-allowed",
                  opacity: available ? 1 : 0.45,
                  transform: isHovered && available ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: isHovered && available
                    ? "0 8px 30px #B2569020, 0 0 60px #B2569010"
                    : "none",
                }}
              >
                {isHovered && available && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 50% 0%, #B2569012 0%, transparent 70%)",
                    }}
                  />
                )}

                {!available && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2a6080" }}>
                      🔒 Coming Soon
                    </span>
                  </div>
                )}

                <div className="relative z-10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{scenario.emoji}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        color: DIFFICULTY_COLORS[scenario.difficulty],
                        background: `${DIFFICULTY_COLORS[scenario.difficulty]}15`,
                      }}
                    >
                      {scenario.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{scenario.company}</h4>
                  <span
                    className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-3"
                    style={{ background: "#B2569030", color: "#EDC400" }}
                  >
                    {scenario.concept}
                  </span>

                  <p className="text-xs leading-relaxed mb-4" style={{ color: "#E0E0E0" }}>
                    {scenario.conceptDescription}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#2a6080" }}>
                    <span className="text-[10px]" style={{ color: "#CCCCCC" }}>
                      8 decisions
                    </span>
                    {available && (
                      <span className="text-xs font-medium" style={{ color: "#EDC400" }}>
                        Play →
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t text-center" style={{ borderColor: "#2a608030" }}>
          <p className="text-xs" style={{ color: "#2a6080" }}>
            StartupAutopsy · Hackonomics 2026 · IE/Operations Research
          </p>
        </div>
      </main>
    </div>
  );
}
