"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const COMPANIES = [
  { emoji: "📺", name: "Quibi", raised: "$1.75B", died: "6 months", year: "2020" },
  { emoji: "🥤", name: "Juicero", raised: "$120M", died: "16 months", year: "2017" },
  { emoji: "🏠", name: "WeWork", raised: "$12B", died: "IPO collapse", year: "2019" },
  { emoji: "💻", name: "Zenefits", raised: "$584M", died: "CEO fired", year: "2016" },
];

const FEATURES = [
  {
    icon: "🎮",
    title: "Play as the CEO",
    desc: "Step into the shoes of real founders. Make the same decisions they faced — with real financial data.",
  },
  {
    icon: "📊",
    title: "Live Dashboard",
    desc: "Watch your cash, burn rate, and runway update in real time. Every decision has consequences.",
  },
  {
    icon: "🤖",
    title: "AI Tutor",
    desc: "Ask questions mid-game. Amazon Nova Lite explains every financial concept in plain English.",
  },
  {
    icon: "🧠",
    title: "Learn by Failing",
    desc: "Every wrong move teaches a lesson. Every right move shows you why the real company didn't make it.",
  },
];

const CONCEPTS = [
  "Burn Rate", "Runway", "Unit Economics", "CAC", "LTV",
  "Market Timing", "Valuation", "Cash Management",
];

const TECH = [
  { label: "Next.js 14", detail: "App Router" },
  { label: "FastAPI", detail: "Python backend" },
  { label: "Amazon Nova Lite", detail: "AI explanations via Bedrock" },
  { label: "Framer Motion", detail: "Smooth animations" },
  { label: "Recharts", detail: "Financial charts" },
  { label: "TypeScript", detail: "Strict mode" },
];

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#144058" }}>

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ background: "#144058ee", borderBottom: "1px solid #2a6080" }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-white tracking-tight">StartupAutopsy</span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "#E0E0E0" }}>Hackonomics 2026</span>
            <Link
              href="/scenarios"
              className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
              style={{ background: "#B25690", color: "#144058" }}
            >
              Play Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: "#EDC400" }}>
              Financial Literacy Simulation
            </p>
            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              You have $1.75 billion.
              <br />
              <span style={{ color: "#EDC400" }}>Don&apos;t lose it all.</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-4" style={{ color: "#EDC400" }}>
              Step into the CEO chair of real failed startups. Make the same decisions they made.
              Watch your runway hit zero in real time.
            </p>
            <p className="text-sm max-w-xl mx-auto mb-10" style={{ color: "#E0E0E0" }}>
              Every decision teaches one financial concept. Every wrong move shows you
              exactly why it cost them the company.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              href="/scenarios"
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-shadow"
              style={{ background: "#B25690", boxShadow: "0 0 30px #E0E0E040" }}
            >
              Start Playing →
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: "#71B379", border: "1px solid #2a6080" }}
            >
              How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Companies strip ── */}
      <section className="py-12 px-6" style={{ borderTop: "1px solid #2a6080", borderBottom: "1px solid #2a6080" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] mb-8" style={{ color: "#E0E0E0" }}>
            Real companies. Real data. Real failures.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COMPANIES.map((c, i) => (
              <Section key={c.name} delay={i * 0.1}>
                <div className="text-center p-4 rounded-xl" style={{ background: "#1a5070", border: "1px solid #2a6080" }}>
                  <span className="text-3xl block mb-2">{c.emoji}</span>
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-xs mt-1" style={{ color: "#EDC400" }}>Raised {c.raised}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#E0E0E0" }}>{c.died} · {c.year}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-center text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#EDC400" }}>
              How It Works
            </p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Learn finance by destroying companies
            </h2>
          </Section>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Pick a Startup", desc: "Choose from 4 real companies that failed spectacularly. Each teaches different financial concepts.", color: "#71B379" },
              { step: "02", title: "Make 8 Decisions", desc: "Face the same choices the real founders faced. Approve budgets, hire teams, pivot strategies — with real numbers.", color: "#71B379" },
              { step: "03", title: "Save or Bankrupt", desc: "Watch your dashboard update live. Can you avoid the mistakes that killed the real company?", color: "#B25690" },
            ].map((item, i) => (
              <Section key={item.step} delay={i * 0.15}>
                <div className="p-6 rounded-xl h-full" style={{ background: "#1a5070", border: "1px solid #2a6080" }}>
                  <span className="text-3xl font-bold font-mono" style={{ color: item.color }}>{item.step}</span>
                  <h3 className="text-base font-bold text-white mt-3 mb-2">{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#E0E0E0" }}>{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6" style={{ background: "#1a5070" }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-center text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#EDC400" }}>
              Features
            </p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Not a quiz. A simulation.
            </h2>
          </Section>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <Section key={f.title} delay={i * 0.1}>
                <div className="flex gap-4 p-5 rounded-xl" style={{ background: "#144058", border: "1px solid #2a6080" }}>
                  <span className="text-2xl shrink-0">{f.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "#E0E0E0" }}>{f.desc}</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── Concepts taught ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Section>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#EDC400" }}>
              What You&apos;ll Learn
            </p>
            <h2 className="text-3xl font-bold text-white mb-8">
              Real financial concepts, zero jargon
            </h2>
            <p className="text-sm max-w-lg mx-auto mb-10" style={{ color: "#E0E0E0" }}>
              Every term is explained in plain English the moment it appears.
              If a 16-year-old can&apos;t understand it, we rewrite it.
            </p>
          </Section>

          <div className="flex flex-wrap justify-center gap-3">
            {CONCEPTS.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: "#1a5070", color: "#71B379", border: "1px solid #2a6080" }}
              >
                {c}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── IE / Operations Research ── */}
      <section className="py-20 px-6" style={{ background: "#1a5070" }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-center text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#B25690" }}>
              The IE Connection
            </p>
            <h2 className="text-3xl font-bold text-white text-center mb-10">
              Operations Research in Action
            </h2>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📊", title: "Simulation Modeling", desc: "Financial state machine with real data" },
              { icon: "🎯", title: "Decision Analysis", desc: "8 decision nodes with probabilistic outcomes" },
              { icon: "🧠", title: "Systems Thinking", desc: "Interconnected financial systems" },
              { icon: "📈", title: "Pattern Recognition", desc: "Statistical failure patterns across startups" },
            ].map((item, i) => (
              <Section key={item.title} delay={i * 0.1}>
                <div className="text-center p-5 rounded-xl" style={{ background: "#144058", border: "1px solid #2a6080" }}>
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <h3 className="text-xs font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-[10px]" style={{ color: "#E0E0E0" }}>{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Section>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#EDC400" }}>
              Built With
            </p>
            <h2 className="text-3xl font-bold text-white mb-10">Tech Stack</h2>
          </Section>

          <div className="flex flex-wrap justify-center gap-3">
            {TECH.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2.5 rounded-lg text-left"
                style={{ background: "#1a5070", border: "1px solid #2a6080" }}
              >
                <p className="text-xs font-bold text-white">{t.label}</p>
                <p className="text-[10px]" style={{ color: "#E0E0E0" }}>{t.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 text-center" style={{ borderTop: "1px solid #2a6080" }}>
        <Section>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to run a company into the ground?
          </h2>
          <p className="text-sm mb-8" style={{ color: "#E0E0E0" }}>
            Pick a startup. Make 8 decisions. Learn why they failed.
          </p>
          <Link
            href="/scenarios"
            className="inline-block px-10 py-4 rounded-xl text-base font-bold text-white transition-shadow"
            style={{ background: "#B25690", boxShadow: "0 0 40px #B2569050" }}
          >
            Start Playing →
          </Link>
        </Section>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 px-6 text-center" style={{ borderTop: "1px solid #2a6080" }}>
        <p className="text-[10px]" style={{ color: "#CCCCCC" }}>
          StartupAutopsy · Hackonomics 2026 · IE/Operations Research
        </p>
      </footer>
    </div>
  );
}
