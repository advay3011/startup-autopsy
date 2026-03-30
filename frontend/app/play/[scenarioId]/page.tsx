"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { calculateScore as apiCalculateScore, getInitialState, getScenario } from "@/lib/api";
import { useGameState } from "@/lib/gameState";
import type { ConsequenceResult, GameState, ScoreResult } from "@/lib/types";
import Dashboard from "@/components/Dashboard/Dashboard";
import StoryPanel from "@/components/Game/StoryPanel";
import ConsequenceAlert from "@/components/Game/ConsequenceAlert";
import RunwayChart from "@/Charts/RunwayChart";
import HealthRadar from "@/Charts/HealthRadar";
import VsRealChart from "@/Charts/VsRealChart";
import AutopsyReport from "@/EndScreen/AutopsyReport";
import ConceptIntro from "@/components/Game/ConceptIntro";
import { saveGame, loadGame, deleteSave } from "@/lib/saveGame";

// ─── Constants ────────────────────────────────────────────────────────────────

const QUIBI_REAL_HEALTH = [72, 60, 52, 45, 35, 22, 10, 5];

function healthColor(score: number): string {
  if (score >= 60) return "#71B379";
  if (score >= 30) return "#71B379";
  return "#B25690";
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function PanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[#1a5070] border border-[#2a6080] rounded-xl animate-pulse ${className ?? ""}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#144058] flex flex-col">
      <div className="border-b border-[#2a6080] px-4 py-2 h-10" />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[30%_45%_25%] gap-5">
          <PanelSkeleton className="h-96" />
          <PanelSkeleton className="h-[600px]" />
          <div className="space-y-4">
            <PanelSkeleton className="h-44" />
            <PanelSkeleton className="h-44" />
            <PanelSkeleton className="h-44" />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.scenarioId;
  const scenarioId = Array.isArray(rawId) ? rawId[0] : (rawId ?? "");

  const [session, dispatch] = useGameState();

  // Parallel chart/dashboard state — tracks full GameState history
  const [gameStateHistory, setGameStateHistory] = useState<GameState[]>([]);
  const [prevGameState, setPrevGameState] = useState<GameState | null>(null);

  // Score calculation for game over
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);

  // ── Load scenario ─────────────────────────────────────────────────────────

  const loadScenario = useCallback(async () => {
    if (!scenarioId) {
      dispatch({ type: "SET_ERROR", message: "Missing scenario ID." });
      return;
    }

    // Reset parallel state
    setGameStateHistory([]);
    setPrevGameState(null);
    setScoreResult(null);
    setScoringError(null);

    try {
      const [sc, st] = await Promise.all([
        getScenario(scenarioId),
        getInitialState(scenarioId),
      ]);
      dispatch({ type: "LOAD_SCENARIO", scenario: sc, initialState: st });
      setGameStateHistory([st]);
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        message: e instanceof Error ? e.message : "Could not load this scenario.",
      });
    }
  }, [scenarioId, dispatch]);

  useEffect(() => {
    void loadScenario();
  }, [loadScenario]);

  // ── Calculate score when game ends ────────────────────────────────────────

  useEffect(() => {
    if (
      session.phase !== "game_over" ||
      !session.endingType ||
      scoreResult !== null ||
      scoringError !== null
    ) {
      return;
    }

    void (async () => {
      try {
        const score = await apiCalculateScore(
          scenarioId,
          session.gameState,
          session.endingType!,
          session.decisionHistory
        );
        setScoreResult(score);
        deleteSave(scenarioId);
      } catch (e) {
        setScoringError(
          e instanceof Error ? e.message : "Could not calculate final score."
        );
      }
    })();
  }, [session.phase, session.endingType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Event handlers ────────────────────────────────────────────────────────

  function handleDecisionMade(_optionId: string, consequence: ConsequenceResult) {
    // Snapshot prev state for dashboard deltas, then advance
    setPrevGameState(session.gameState);
    setGameStateHistory((h) => [...h, consequence.new_state]);
    dispatch({ type: "DECISION_RESULT", consequence });
  }

  function handleConsequenceContinue() {
    dispatch({ type: "CONTINUE_AFTER_CONSEQUENCE" });
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (session.error) {
    return (
      <main className="min-h-screen bg-[#144058] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-[#B25690] text-center max-w-md">{session.error}</p>
        <Link
          href="/scenarios"
          className="text-xs text-[#E0E0E0] hover:text-white underline transition-colors"
        >
          ← Back to scenarios
        </Link>
      </main>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (session.phase === "loading" || !session.scenario) {
    return <LoadingSkeleton />;
  }

  // ── Game over ─────────────────────────────────────────────────────────────

  if (session.phase === "game_over" && session.endingType) {
    if (scoringError) {
      return (
        <main className="min-h-screen bg-[#144058] flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-sm text-[#B25690] text-center">{scoringError}</p>
          <Link href="/scenarios" className="text-xs text-[#E0E0E0] hover:text-white underline">
            ← Back to scenarios
          </Link>
        </main>
      );
    }

    if (!scoreResult) {
      return (
        <main className="min-h-screen bg-[#144058] flex items-center justify-center">
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-sm text-[#E0E0E0]"
          >
            Compiling your autopsy report…
          </motion.p>
        </main>
      );
    }

    return (
      <AutopsyReport
        scenario={session.scenario}
        gameState={scoreResult.final_state}
        endingType={session.endingType}
        scoreResult={scoreResult}
        decisionHistory={session.decisionHistory}
        onPlayAgain={() => void loadScenario()}
        onGoHome={() => router.push("/scenarios")}
      />
    );
  }

  // ── Intro screen ───────────────────────────────────────────────────────

  if (session.phase === "intro" && session.scenario) {
    const saved = loadGame(scenarioId);
    return (
      <ConceptIntro
        company={session.scenario.company}
        emoji={session.scenario.emoji}
        concept={session.scenario.concept}
        conceptDescription={session.scenario.concept_description}
        conceptAnalogy={session.scenario.concept_analogy}
        openingStory={session.scenario.opening_story}
        conceptsTaught={session.scenario.concepts_taught}
        difficulty={session.scenario.difficulty}
        onStart={() => {
          if (saved) {
            // Resume from save
            dispatch({
              type: "RESTORE_GAME",
              scenario: session.scenario!,
              gameState: saved.gameState,
              decisionIndex: saved.currentDecisionIndex,
              history: saved.decisionHistory,
            });
            setGameStateHistory([saved.gameState]);
          } else {
            dispatch({ type: "START_GAME" });
          }
        }}
        onBack={() => router.push("/scenarios")}
        hasSavedGame={!!saved}
        onNewGame={() => {
          deleteSave(scenarioId);
          dispatch({ type: "START_GAME" });
        }}
      />
    );
  }

  // ── Playing / consequence ─────────────────────────────────────────────────

  const scenario = session.scenario;
  const currentDecision = scenario.decisions[session.currentDecisionIndex];
  const isQuibi = scenario.company === "Quibi";
  const hc = healthColor(session.gameState.health_score);

  // Charts get historical data split: history (excluding current) + current
  const chartHistory = gameStateHistory.slice(0, -1);
  const showVsReal = isQuibi && gameStateHistory.length > 1;

  return (
    <main className="min-h-screen bg-[#144058] flex flex-col">
      {/* ── Top bar ── */}
      <header className="shrink-0 border-b border-[#2a6080] px-4 py-2 bg-[#144058]/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/scenarios"
              className="text-xs text-[#2a6080] hover:text-[#E0E0E0] transition-colors shrink-0"
            >
              ←
            </Link>
            <span className="text-sm font-bold truncate">
              {scenario.emoji} {scenario.company}
            </span>
            <span className="text-[#2a6080] hidden sm:block">·</span>
            <span className="text-xs text-[#CCCCCC] truncate hidden sm:block">
              {scenario.concept}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs font-mono text-[#2a6080] hidden sm:block">
              {session.gameState.decisions_made} / 8 decisions
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="text-sm font-bold font-mono tabular-nums"
                style={{ color: hc }}
              >
                {session.gameState.health_score.toFixed(0)}
              </span>
              <span className="text-xs text-[#2a6080]">health</span>
            </div>
            <button
              onClick={() => {
                saveGame({
                  scenarioId,
                  currentDecisionIndex: session.currentDecisionIndex,
                  gameState: session.gameState,
                  decisionHistory: session.decisionHistory,
                });
                router.push("/scenarios");
              }}
              className="text-xs px-3 py-1 rounded-lg transition-colors"
              style={{ background: "#EDC40015", color: "#71B379", border: "1px solid #EDC40030" }}
            >
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      {/* ── Three-column layout ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[30%_45%_25%] gap-5 items-start">

          {/* Left — Dashboard (below story on mobile) */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-16 w-full">
            <Dashboard
              state={session.gameState}
              prevState={prevGameState}
            />
          </div>

          {/* Center — StoryPanel */}
          <div className="order-1 lg:order-2 w-full">
            {currentDecision ? (
              <StoryPanel
                key={`${scenario.id}-${session.currentDecisionIndex}`}
                scenarioId={scenarioId}
                company={scenario.company}
                companyEmoji={scenario.emoji}
                decision={currentDecision}
                gameState={session.gameState}
                isLoading={session.isLoading}
                onDecisionMade={handleDecisionMade}
              />
            ) : (
              <div className="bg-[#1a5070] border border-[#2a6080] rounded-xl p-8 text-center">
                <p className="text-sm text-[#CCCCCC]">No more decisions.</p>
              </div>
            )}
          </div>

          {/* Right — Charts stack */}
          <div className="order-3 w-full space-y-4">
            <RunwayChart
              gameHistory={chartHistory}
              currentGameState={session.gameState}
            />
            <HealthRadar
              healthBreakdown={session.gameState.health_breakdown}
              previousBreakdown={prevGameState?.health_breakdown ?? null}
            />
            {showVsReal && (
              <VsRealChart
                gameHistory={gameStateHistory}
                realCompanyHistory={QUIBI_REAL_HEALTH}
              />
            )}
          </div>

        </div>
      </div>

      {/* ── ConsequenceAlert overlay ── */}
      <AnimatePresence>
        {session.phase === "consequence" && session.lastConsequence && (
          <ConsequenceAlert
            key="consequence-overlay"
            consequence={session.lastConsequence}
            onContinue={handleConsequenceContinue}
            companyName={scenario.company}
            companyEmoji={scenario.emoji}
            scenarioId={scenarioId}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
