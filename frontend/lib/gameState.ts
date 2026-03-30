"use client";

import { useReducer } from "react";
import type {
  ConsequenceResult,
  DecisionHistoryEntry,
  EndingType,
  GamePhase,
  GameState,
  HealthBreakdown,
  Scenario,
} from "./types";

// ─── State ────────────────────────────────────────────────────────────────────

export interface GameSession {
  scenario: Scenario | null;
  currentDecisionIndex: number;
  gameState: GameState;
  decisionHistory: DecisionHistoryEntry[];
  phase: GamePhase;
  lastConsequence: ConsequenceResult | null;
  endingType: EndingType | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type GameAction =
  | { type: "LOAD_SCENARIO"; scenario: Scenario; initialState: GameState }
  | { type: "START_GAME" }
  | { type: "RESTORE_GAME"; scenario: Scenario; gameState: GameState; decisionIndex: number; history: DecisionHistoryEntry[] }
  | { type: "SUBMIT_DECISION" }
  | { type: "DECISION_RESULT"; consequence: ConsequenceResult }
  | { type: "SHOW_CONSEQUENCE" }
  | { type: "CONTINUE_AFTER_CONSEQUENCE" }
  | { type: "GAME_OVER"; endingType: EndingType }
  | { type: "RESET" }
  | { type: "SET_ERROR"; message: string };

// ─── Initial state ────────────────────────────────────────────────────────────

const EMPTY_HEALTH_BREAKDOWN: HealthBreakdown = {
  burn_rate_health: 0,
  revenue_growth: 0,
  unit_economics: 0,
  cash_flow: 0,
  investor_confidence: 0,
};

const EMPTY_GAME_STATE: GameState = {
  cash: 0,
  monthly_burn: 0,
  monthly_revenue: 0,
  runway_months: 0,
  health_score: 0,
  health_breakdown: EMPTY_HEALTH_BREAKDOWN,
  subscribers: 0,
  decisions_made: 0,
  is_game_over: false,
  game_over_reason: null,
};

export const initialState: GameSession = {
  scenario: null,
  currentDecisionIndex: 0,
  gameState: EMPTY_GAME_STATE,
  decisionHistory: [],
  phase: "loading",
  lastConsequence: null,
  endingType: null,
  isLoading: false,
  error: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function gameReducer(
  state: GameSession,
  action: GameAction
): GameSession {
  switch (action.type) {
    case "LOAD_SCENARIO":
      return {
        ...initialState,
        scenario: action.scenario,
        gameState: action.initialState,
        phase: "intro",
        isLoading: false,
      };

    case "SUBMIT_DECISION":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "START_GAME":
      return {
        ...state,
        phase: "playing",
      };

    case "RESTORE_GAME":
      return {
        ...initialState,
        scenario: action.scenario,
        gameState: action.gameState,
        currentDecisionIndex: action.decisionIndex,
        decisionHistory: action.history,
        phase: "playing",
        isLoading: false,
      };

    case "DECISION_RESULT": {
      const { consequence } = action;
      const entry: DecisionHistoryEntry = buildHistoryEntry(
        state,
        consequence
      );
      return {
        ...state,
        isLoading: false,
        lastConsequence: consequence,
        gameState: consequence.new_state,
        decisionHistory: [...state.decisionHistory, entry],
        phase: "consequence",
      };
    }

    case "SHOW_CONSEQUENCE":
      return {
        ...state,
        phase: "consequence",
      };

    case "CONTINUE_AFTER_CONSEQUENCE": {
      if (!state.lastConsequence) return state;

      if (state.lastConsequence.game_over) {
        return {
          ...state,
          phase: "game_over",
          endingType: state.lastConsequence.ending_type,
        };
      }

      return {
        ...state,
        phase: "playing",
        currentDecisionIndex: state.currentDecisionIndex + 1,
        lastConsequence: null,
      };
    }

    case "GAME_OVER":
      return {
        ...state,
        phase: "game_over",
        endingType: action.endingType,
        isLoading: false,
      };

    case "RESET":
      return { ...initialState };

    case "SET_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.message,
      };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState(): [GameSession, React.Dispatch<GameAction>] {
  return useReducer(gameReducer, initialState);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildHistoryEntry(
  state: GameSession,
  consequence: ConsequenceResult
): DecisionHistoryEntry {
  const decision = state.scenario?.decisions[state.currentDecisionIndex];
  return {
    decision_number: decision?.decision_number ?? state.currentDecisionIndex + 1,
    option_id: consequence.option_chosen.id,
    concept: decision?.concept_being_taught ?? "",
    chose_what_real_company_did: consequence.chose_what_real_company_did,
    is_smart_choice: consequence.option_chosen.outcome_label === "SMART",
    health_score_change:
      consequence.option_chosen.financial_impact.health_score_change,
  };
}
