// Canonical TypeScript interfaces — mirrors backend/models/schemas.py exactly.
// All other files should import from here.

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum EndingType {
  BANKRUPT = "bankrupt",
  SAVED = "saved",
  STRUGGLING = "struggling",
}

export enum OutcomeLabel {
  SMART = "SMART",
  RISKY = "RISKY",
  CONSERVATIVE = "CONSERVATIVE",
  BOLD = "BOLD",
  RIGHT_CALL = "RIGHT_CALL",
}

export type MasteryLevel = "mastered" | "learning" | "missed";

// ─── Financial models ─────────────────────────────────────────────────────────

export interface HealthBreakdown {
  burn_rate_health: number;
  revenue_growth: number;
  unit_economics: number;
  cash_flow: number;
  investor_confidence: number;
}

export interface FinancialImpact {
  cash_change: number;
  monthly_burn_change: number;
  monthly_revenue_change: number;
  subscriber_change: number;
  health_score_change: number;
  runway_change: number;
}

// ─── Game state ───────────────────────────────────────────────────────────────

export interface GameState {
  cash: number;
  monthly_burn: number;
  monthly_revenue: number;
  runway_months: number;
  health_score: number;
  health_breakdown: HealthBreakdown;
  subscribers: number;
  decisions_made: number;
  is_game_over: boolean;
  game_over_reason: string | null;
}

// ─── Decision models ──────────────────────────────────────────────────────────

export interface DecisionOption {
  id: string;
  text: string;
  short_label: string;
  outcome_label: OutcomeLabel;
  consequence_story: string;
  plain_english_explanation: string;
  concept_explained: string;
  financial_impact: FinancialImpact;
  is_what_real_company_did: boolean;
  real_company_note: string | null;
}

export interface Decision {
  id: string;
  decision_number: number;
  situation: string;
  context: string;
  concept_being_taught: string;
  hover_preview: boolean;
  options: [DecisionOption, DecisionOption, DecisionOption, DecisionOption];
  real_company_choice: string;
  learning_moment: string;
}

// ─── Scenario models ──────────────────────────────────────────────────────────

export interface InitialFinancials {
  cash: number;
  monthly_burn: number;
  monthly_revenue: number;
  subscribers: number;
  runway_months: number;
  health_score: number;
  health_breakdown: HealthBreakdown;
}

export interface Ending {
  trigger_condition: string;
  story: string;
  epitaph?: string;
  lesson: string;
}

export interface Endings {
  bankrupt: Ending;
  saved: Ending;
  struggling: Ending;
}

export interface Scenario {
  id: string;
  company: string;
  concept: string;
  concept_description: string;
  concept_analogy: string;
  industry: string;
  emoji: string;
  tagline: string;
  difficulty: string;
  opening_story: string;
  initial_financials: InitialFinancials;
  decisions: Decision[];
  endings: Endings;
  real_outcome: string;
  concepts_taught: string[];
  what_you_learned_summary: string;
}

export interface ScenarioSummary {
  id: string;
  company: string;
  concept: string;
  concept_description: string;
  industry: string;
  emoji: string;
  tagline: string;
  difficulty: string;
  concepts_taught: string[];
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface DecisionRequest {
  scenarioId: string;
  decisionNumber: number;
  optionId: string;
  currentGameState: GameState;
}

export interface ConsequenceResult {
  option_chosen: DecisionOption;
  new_state: GameState;
  real_company_choice: string;
  real_company_option: DecisionOption;
  chose_what_real_company_did: boolean;
  learning_moment: string;
  game_over: boolean;
  ending_type: EndingType | null;
  ending_details: Ending | null;
  next_decision: Decision | null;
}

export interface ExplanationResponse {
  scenario_id: string;
  decision_id: string;
  option_id: string;
  concept: string;
  explanation: string;
}

export interface ConceptMastery {
  concept: string;
  decisions_faced: number;
  smart_choices: number;
  real_company_copies: number;
  mastery_level: MasteryLevel;
}

export interface ScoreResult {
  total_score: number;
  base_score: number;
  smart_choice_bonus: number;
  saved_bonus: number;
  real_company_penalty: number;
  verdict: string;
  concept_mastery: ConceptMastery[];
  ending_type: EndingType;
  final_state: GameState;
  real_outcome: string;
}

// ─── Frontend session state ───────────────────────────────────────────────────

export interface DecisionHistoryEntry {
  decision_number: number;
  option_id: string;
  concept: string;
  chose_what_real_company_did: boolean;
  is_smart_choice: boolean;
  health_score_change: number;
}

export type GamePhase =
  | "loading"
  | "intro"
  | "playing"
  | "consequence"
  | "explanation"
  | "game_over";

export interface GameSession {
  scenario: Scenario;
  gameState: GameState;
  currentDecision: Decision | null;
  decisionHistory: DecisionHistoryEntry[];
  phase: GamePhase;
  lastConsequence: ConsequenceResult | null;
  cashHistory: number[];
  healthHistory: number[];
  runwayHistory: number[];
}
