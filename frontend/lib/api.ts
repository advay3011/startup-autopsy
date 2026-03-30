import type {
  ConsequenceResult,
  DecisionHistoryEntry,
  DecisionRequest,
  EndingType,
  ExplanationResponse,
  GameState,
  Scenario,
  ScenarioSummary,
  ScoreResult,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, (body as { detail?: string }).detail ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export async function getScenarios(): Promise<ScenarioSummary[]> {
  return request<ScenarioSummary[]>("/api/scenarios");
}

export async function getScenario(id: string): Promise<Scenario> {
  return request<Scenario>(`/api/scenario/${encodeURIComponent(id)}`);
}

export async function submitDecision(
  req: DecisionRequest
): Promise<ConsequenceResult> {
  return request<ConsequenceResult>("/api/decision", {
    method: "POST",
    body: JSON.stringify({
      scenario_id: req.scenarioId,
      decision_number: req.decisionNumber,
      option_id: req.optionId,
      current_state: req.currentGameState,
    }),
  });
}

export async function calculateScore(
  scenarioId: string,
  gameState: GameState,
  endingType: EndingType,
  decisionsHistory: DecisionHistoryEntry[]
): Promise<ScoreResult> {
  return request<ScoreResult>("/api/score", {
    method: "POST",
    body: JSON.stringify({
      scenario_id: scenarioId,
      final_state: gameState,
      ending_type: endingType,
      decisions_history: decisionsHistory,
    }),
  });
}

export async function getInitialState(scenarioId: string): Promise<GameState> {
  return request<GameState>(
    `/api/scenario/${encodeURIComponent(scenarioId)}/initial-state`
  );
}

export async function getExplanation(
  scenarioId: string,
  decisionId: string,
  optionId: string
): Promise<ExplanationResponse> {
  return request<ExplanationResponse>(
    `/api/explanation/${encodeURIComponent(scenarioId)}/${encodeURIComponent(decisionId)}/${encodeURIComponent(optionId)}`
  );
}

export async function healthCheck(): Promise<boolean> {
  try {
    await request<unknown>("/health");
    return true;
  } catch {
    return false;
  }
}

export { ApiError };


// ─── AI Features ──────────────────────────────────────────────────────────────

export async function getAutopsyReport(
  scenarioId: string,
  healthScore: number,
  endingType: string,
  finalCash: number,
  runway: number,
  decisionsHistory: DecisionHistoryEntry[],
  concepts: string[]
): Promise<{ report: string }> {
  return request<{ report: string }>("/api/ai/autopsy-report", {
    method: "POST",
    body: JSON.stringify({
      scenario_id: scenarioId,
      health_score: healthScore,
      ending_type: endingType,
      final_cash: finalCash,
      runway,
      decisions_history: decisionsHistory,
      concepts,
    }),
  });
}

export async function getHint(
  scenarioId: string,
  healthScore: number,
  cash: number,
  runway: number,
  burn: number,
  nextConcept: string
): Promise<{ hint: string }> {
  return request<{ hint: string }>("/api/ai/hint", {
    method: "POST",
    body: JSON.stringify({
      scenario_id: scenarioId,
      health_score: healthScore,
      cash,
      runway,
      burn,
      next_concept: nextConcept,
    }),
  });
}

export async function getFollowup(
  scenarioId: string,
  concept: string,
  consequence: string,
  question: string
): Promise<{ answer: string }> {
  return request<{ answer: string }>("/api/ai/followup", {
    method: "POST",
    body: JSON.stringify({
      scenario_id: scenarioId,
      concept,
      consequence,
      question,
    }),
  });
}
