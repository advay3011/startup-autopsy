"""
Pydantic models for the StartupAutopsy game API.

Every model maps directly to a shape in the scenario JSON structure or to
a request/response contract for the API routes defined in CLAUDE.md.
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field, model_validator


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------


class DifficultyLevel(str, Enum):
    """Difficulty level for a scenario.

    Determines how obvious the consequences are and how much margin the player
    has to save the company.

    - beginner:     Quibi, Juicero — obvious right/wrong, immediate consequences.
    - intermediate: WeWork — real tradeoffs, no clearly correct answer.
    - expert:       Zenefits — consequences are delayed and non-obvious.
    """

    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"


class OutcomeLabel(str, Enum):
    """Visual label displayed on each decision option card.

    Used by the frontend to colour-code options before the player picks.
    """

    RISKY = "RISKY"
    SMART = "SMART"
    CONSERVATIVE = "CONSERVATIVE"
    BOLD = "BOLD"


class EndingType(str, Enum):
    """The three possible game endings.

    - bankrupt:   cash <= 0 or health_score <= 10.
    - saved:      all 8 decisions complete, health_score >= 60 and runway >= 3.
    - struggling: all 8 decisions complete but health_score < 60.
    """

    BANKRUPT = "bankrupt"
    SAVED = "saved"
    STRUGGLING = "struggling"


class MasteryLevel(str, Enum):
    """How well the player understood a concept by the end of the game."""

    MASTERED = "mastered"
    LEARNING = "learning"
    MISSED = "missed"


# ---------------------------------------------------------------------------
# Financial building blocks
# ---------------------------------------------------------------------------


class HealthBreakdown(BaseModel):
    """The five weighted components that make up the overall health score.

    Each component is a 0–100 float.  The weighted average of all five
    produces the top-level health_score:
        burn_rate_health   × 0.25
        revenue_growth     × 0.25
        unit_economics     × 0.20
        cash_flow          × 0.20
        investor_confidence× 0.10
    """

    burn_rate_health: float = Field(
        ge=0, le=100,
        description="How healthy the burn rate is relative to cash on hand. "
        "Lower burn-to-cash ratio = higher score.",
    )
    revenue_growth: float = Field(
        ge=0, le=100,
        description="Month-over-month revenue growth rate, normalised to 0–100.",
    )
    unit_economics: float = Field(
        ge=0, le=100,
        description="Revenue per customer vs cost per customer. "
        "Positive unit economics = higher score.",
    )
    cash_flow: float = Field(
        ge=0, le=100,
        description="Direction and magnitude of monthly cash change. "
        "Positive cash flow = higher score.",
    )
    investor_confidence: float = Field(
        ge=0, le=100,
        description="Proxy for investor sentiment, derived from decision quality.",
    )


class GameState(BaseModel):
    """Live financial state of the company, recalculated after every decision.

    This is the central data structure that the frontend dashboard reads to
    render every animated number.  All six monetary fields are in raw dollars
    (not millions) so the frontend can format them however it needs.
    """

    cash: float = Field(
        description="Current cash on hand in dollars. Game over when this hits 0."
    )
    monthly_burn: float = Field(
        gt=0,
        description="Gross cash spent every month before revenue offsets. "
        "Always a positive number representing an outflow.",
    )
    monthly_revenue: float = Field(
        ge=0,
        description="Cash coming in from customers every month.",
    )
    runway_months: float = Field(
        ge=0,
        description="Months of cash remaining. Calculated as cash / net_burn. "
        "Displayed as the countdown clock on the dashboard.",
    )
    health_score: float = Field(
        ge=0, le=100,
        description="Overall company health 0–100. Weighted average of health_breakdown.",
    )
    health_breakdown: HealthBreakdown = Field(
        description="The five sub-scores that feed into health_score."
    )
    subscribers: int = Field(
        ge=0,
        description="Current subscriber or customer count. "
        "Relevant for unit economics calculations.",
    )
    decisions_made: int = Field(
        ge=0,
        le=8,
        description="How many of the 8 decisions the player has completed.",
    )
    is_game_over: bool = Field(
        default=False,
        description="True when cash <= 0 or health_score <= 10.",
    )
    game_over_reason: str | None = Field(
        default=None,
        description="Human-readable reason why the game ended early, if applicable.",
    )


class FinancialImpact(BaseModel):
    """The delta applied to GameState when a player chooses a decision option.

    All fields are deltas (positive or negative), not absolute values.
    financial_calculator.py is the only place these are applied to GameState.
    """

    cash_change: float = Field(
        description="One-time cash change in dollars. Negative = spending. "
        "Example: -300_000_000 for a $300M marketing spend."
    )
    monthly_burn_change: float = Field(
        description="Permanent change to monthly_burn going forward. "
        "Example: -10_000_000 means burn drops by $10M/month from this point."
    )
    monthly_revenue_change: float = Field(
        description="Permanent change to monthly_revenue going forward. "
        "Example: +2_500_000 means $2.5M more revenue every month."
    )
    subscriber_change: int = Field(
        description="Change to subscriber count. Can be negative if customers churn."
    )
    health_score_change: float = Field(
        description="Delta applied to health_score. Usually negative for bad choices. "
        "The engine re-derives health_score from health_breakdown after applying this."
    )
    runway_change: float = Field(
        description="Approximate months added or removed from runway. "
        "Informational — the authoritative runway is recalculated from cash / burn."
    )


# ---------------------------------------------------------------------------
# Scenario structure — mirrors the scenario JSON exactly
# ---------------------------------------------------------------------------


class DecisionOption(BaseModel):
    """One of four choices available to the player for a given decision.

    The four options for any decision must collectively cover a range from
    bold/risky to conservative/safe.  Exactly one option per decision must
    have is_what_real_company_did=True.
    """

    id: str = Field(
        description='Single-letter option identifier: "a", "b", "c", or "d".'
    )
    text: str = Field(
        description="Full decision text shown to the player before they choose."
    )
    short_label: str = Field(
        description='Compact label for the option card button. Example: "Go big".'
    )
    outcome_label: OutcomeLabel = Field(
        description="Visual badge on the option card: RISKY, SMART, CONSERVATIVE, or BOLD."
    )
    consequence_story: str = Field(
        description="Dramatic 2-4 sentence narrative shown after the player chooses. "
        "Present tense. Emotional, not analytical."
    )
    plain_english_explanation: str = Field(
        description="Plain English breakdown of the financial consequence. "
        "Uses the actual numbers from financial_impact. No jargon without definition."
    )
    concept_explained: str = Field(
        description="Names the specific financial concept this option illustrates "
        "and explains it in one or two plain sentences."
    )
    financial_impact: FinancialImpact = Field(
        description="The numeric deltas applied to GameState when this option is chosen."
    )
    is_what_real_company_did: bool = Field(
        description="True if this is what the real company actually chose. "
        "Exactly one option per decision must be True."
    )
    real_company_note: str | None = Field(
        default=None,
        description="Short factual note about the real company's choice. "
        "Non-null when is_what_real_company_did is True.",
    )


class Decision(BaseModel):
    """A single decision node — one of 8 in a scenario.

    Each decision teaches exactly one financial concept through the contrast
    between its four options.  The decisions build progressively: early ones
    establish the concept, later ones force harder tradeoffs.
    """

    id: str = Field(description='Decision identifier. Example: "d1".')
    decision_number: int = Field(
        ge=1, le=8, description="Position in the scenario (1–8)."
    )
    situation: str = Field(
        description="One or two sentences that set the scene. "
        "Puts the player in the moment — what just happened?"
    )
    context: str = Field(
        description="One sentence explaining the tension: what are you weighing up?"
    )
    concept_being_taught: str = Field(
        description="Snake_case name of the financial concept this decision teaches. "
        "Example: burn_rate, customer_acquisition_cost, runway."
    )
    hover_preview: bool = Field(
        default=True,
        description="If True, the frontend shows a brief financial preview on hover "
        "before the player commits.",
    )
    options: list[DecisionOption] = Field(
        description="The four choices available to the player. Must contain exactly 4."
    )
    real_company_choice: str = Field(
        description='ID of the option the real company chose. Example: "a".'
    )
    learning_moment: str = Field(
        description="Two-sentence plain English summary of the core concept. "
        "Shown after the player sees the real company comparison."
    )

    @model_validator(mode="after")
    def validate_options(self) -> "Decision":
        """Enforce exactly 4 options and exactly one real-company choice."""
        if len(self.options) != 4:
            raise ValueError(
                f"Decision {self.id} must have exactly 4 options, "
                f"got {len(self.options)}."
            )
        real_choices = [o for o in self.options if o.is_what_real_company_did]
        if len(real_choices) != 1:
            raise ValueError(
                f"Decision {self.id} must have exactly 1 option with "
                f"is_what_real_company_did=True, got {len(real_choices)}."
            )
        real_ids = {o.id for o in real_choices}
        if self.real_company_choice not in real_ids:
            raise ValueError(
                f"Decision {self.id}: real_company_choice '{self.real_company_choice}' "
                f"must match the option with is_what_real_company_did=True."
            )
        return self


class Ending(BaseModel):
    """Story content for one of the three possible game endings.

    Endings are resolved in game_engine.py after decision 8 or when
    cash <= 0 / health_score <= 10 during play.
    """

    trigger_condition: str = Field(
        description="Human-readable description of the condition that triggers this ending. "
        "Authoritative logic lives in game_engine.py."
    )
    story: str = Field(
        description="2-4 sentence narrative describing what happens to the company. "
        "Should feel earned — bankruptcy is a tragedy, saved is a triumph."
    )
    epitaph: str | None = Field(
        default=None,
        description="Short punchy line shown on the bankrupt ending screen only. "
        "Example: 'Quibi burned through $1.75 billion in 6 months. You followed the same path.'",
    )
    lesson: str = Field(
        description="One or two sentences summarising the core financial lesson "
        "this ending reinforces."
    )


class Endings(BaseModel):
    """Container for all three possible endings of a scenario."""

    bankrupt: Ending = Field(
        description="Triggered when cash <= 0 or health_score <= 10. "
        "The worst outcome — company runs out of money."
    )
    saved: Ending = Field(
        description="Triggered when all 8 decisions are complete with "
        "health_score >= 60 AND runway_months >= 3."
    )
    struggling: Ending = Field(
        description="Triggered when all 8 decisions are complete but health_score < 60. "
        "Alive, but barely."
    )


class InitialFinancials(BaseModel):
    """Starting financial state of the company at the beginning of a scenario.

    These are the real historical numbers for the company at the moment the
    story begins.  They seed the first GameState before any decisions are made.
    """

    cash: float = Field(
        gt=0, description="Cash on hand at scenario start in dollars."
    )
    monthly_burn: float = Field(
        gt=0, description="Monthly gross spend at scenario start in dollars."
    )
    monthly_revenue: float = Field(
        ge=0, description="Monthly revenue at scenario start in dollars."
    )
    subscribers: int = Field(
        ge=0, description="Customer or subscriber count at scenario start."
    )
    runway_months: float = Field(
        ge=0,
        description="Months of cash remaining at scenario start. "
        "Should equal cash / monthly_burn within ~1 month.",
    )
    health_score: float = Field(
        ge=0, le=100,
        description="Overall health score at scenario start.",
    )
    health_breakdown: HealthBreakdown = Field(
        description="Sub-scores that compose health_score at scenario start."
    )


class Scenario(BaseModel):
    """A complete scenario as loaded from a JSON file in backend/scenarios/.

    One scenario = one company + one financial concept + 8 decisions.
    The scenario_loader.py utility validates these on startup.
    """

    id: str = Field(
        description='Unique scenario identifier. Example: "quibi_burn_rate".'
    )
    company: str = Field(description='Real company name. Example: "Quibi".')
    concept: str = Field(
        description='Human-readable concept name. Example: "Burn Rate & Runway".'
    )
    concept_description: str = Field(
        description="One sentence describing the concept. "
        "Shown as the subtitle on the company selector card."
    )
    concept_analogy: str = Field(
        description="Plain English analogy for the concept. "
        "Must be understandable by a 16-year-old with no finance background."
    )
    industry: str = Field(
        description='Company industry. Example: "Media/Entertainment".'
    )
    emoji: str = Field(description="Single emoji representing the company.")
    tagline: str = Field(
        description="Short punchy line that captures the company's downfall. "
        "Example: 'Burned $1.75B in 6 months'."
    )
    difficulty: DifficultyLevel = Field(
        description="How hard this scenario is to win."
    )
    opening_story: str = Field(
        description="2-4 sentence scene-setter that puts the player in the CEO's chair "
        "at the moment the story begins. Dramatic, present tense."
    )
    initial_financials: InitialFinancials = Field(
        description="Real historical starting numbers for this company."
    )
    decisions: list[Decision] = Field(
        description="The 8 sequential decisions the player must navigate. "
        "Must contain exactly 8 items."
    )
    endings: Endings = Field(
        description="Story content for all three possible outcomes."
    )
    real_outcome: str = Field(
        description="What actually happened to the real company. "
        "Shown at the end of every playthrough regardless of ending."
    )
    concepts_taught: list[str] = Field(
        description="All financial concepts introduced across the 8 decisions."
    )
    what_you_learned_summary: str = Field(
        description="2-3 sentence summary of the main financial lesson. "
        "Shown on the AutopsyReport end screen."
    )

    @model_validator(mode="after")
    def validate_decisions(self) -> "Scenario":
        """Enforce exactly 8 decisions."""
        if len(self.decisions) != 8:
            raise ValueError(
                f"Scenario {self.id} must have exactly 8 decisions, "
                f"got {len(self.decisions)}."
            )
        return self


class ScenarioSummary(BaseModel):
    """Lightweight scenario metadata returned by GET /api/scenarios.

    Does not include the full decision tree — just enough for the home screen
    company selector cards.
    """

    id: str = Field(description="Scenario identifier.")
    company: str = Field(description="Company name.")
    concept: str = Field(description="Concept name.")
    concept_description: str = Field(description="One-sentence concept description.")
    industry: str = Field(description="Company industry.")
    emoji: str = Field(description="Company emoji.")
    tagline: str = Field(description="Company downfall tagline.")
    difficulty: DifficultyLevel = Field(description="Scenario difficulty.")
    initial_cash: float = Field(
        description="Starting cash in dollars — shown on the selector card."
    )
    initial_health_score: float = Field(
        description="Starting health score — shown on the selector card."
    )


# ---------------------------------------------------------------------------
# Request / response models for API routes
# ---------------------------------------------------------------------------


class DecisionRequest(BaseModel):
    """Request body for POST /api/decision.

    The frontend sends the current game state along with the player's choice
    so the backend can calculate the consequence without maintaining server-side
    session state.
    """

    scenario_id: str = Field(description="ID of the scenario being played.")
    decision_number: int = Field(
        ge=1, le=8, description="Which decision (1–8) the player is answering."
    )
    option_id: str = Field(
        pattern=r"^[a-d]$",
        description='The option the player chose: "a", "b", "c", or "d".',
    )
    current_state: GameState = Field(
        description="The game state immediately before this decision is applied."
    )


class ConsequenceResult(BaseModel):
    """Response from POST /api/decision.

    Contains everything the frontend needs to render the consequence screen,
    update the dashboard, show the real company comparison, and either advance
    to the next decision or resolve the ending.
    """

    option_chosen: DecisionOption = Field(
        description="Full details of the option the player picked."
    )
    new_state: GameState = Field(
        description="Updated game state after applying financial_impact."
    )
    real_company_choice: str = Field(
        description="ID of the option the real company chose."
    )
    real_company_option: DecisionOption = Field(
        description="Full details of what the real company did. "
        "Always shown after the player sees their consequence."
    )
    chose_what_real_company_did: bool = Field(
        description="True if the player picked the same option as the real company. "
        "Triggers the penalty in score calculation."
    )
    learning_moment: str = Field(
        description="The core lesson for this decision, shown after the comparison."
    )
    game_over: bool = Field(
        description="True if this decision triggered an early ending."
    )
    ending_type: EndingType | None = Field(
        default=None,
        description="Which ending was triggered, if game_over is True or this was "
        "decision 8.",
    )
    ending_details: Ending | None = Field(
        default=None,
        description="Full ending story content, populated when ending_type is set.",
    )
    next_decision: Decision | None = Field(
        default=None,
        description="The next decision to present. None when the game is over.",
    )

    @model_validator(mode="after")
    def validate_consistency(self) -> "ConsequenceResult":
        """Verify chose_what_real_company_did matches the actual option IDs chosen."""
        actually_copied = self.option_chosen.id == self.real_company_option.id
        if self.chose_what_real_company_did != actually_copied:
            raise ValueError(
                f"chose_what_real_company_did is {self.chose_what_real_company_did} "
                f"but option_chosen.id='{self.option_chosen.id}' and "
                f"real_company_option.id='{self.real_company_option.id}' — "
                f"these must be consistent."
            )
        return self


class DecisionHistoryEntry(BaseModel):
    """One entry in the player's decision history, used for score calculation.

    Recorded by the frontend after each ConsequenceResult and sent in bulk
    to POST /api/score at the end of the game.
    """

    decision_number: int = Field(ge=1, le=8)
    option_id: str = Field(description="The option the player chose.")
    concept: str = Field(description="Concept this decision taught.")
    chose_what_real_company_did: bool
    is_smart_choice: bool = Field(
        description="True if the player picked the option with outcome_label == SMART "
        "for this decision. Set by the game engine at decision time.",
    )
    health_score_change: float = Field(
        description="The health_score_change from the chosen option's financial_impact."
    )


class ScoreRequest(BaseModel):
    """Request body for POST /api/score."""

    scenario_id: str
    final_state: GameState
    ending_type: EndingType
    decisions_history: list[DecisionHistoryEntry] = Field(
        description="Full history of all decisions made during the playthrough."
    )


class ConceptMastery(BaseModel):
    """Per-concept learning summary included in ScoreResult.

    Tracks how well the player understood each financial concept they
    encountered across the 8 decisions.
    """

    concept: str = Field(description="Snake_case concept name.")
    decisions_faced: int = Field(
        description="How many decisions taught this concept."
    )
    smart_choices: int = Field(
        description="How many times the player picked the best option for this concept."
    )
    real_company_copies: int = Field(
        description="How many times the player copied the real company's bad choice."
    )
    mastery_level: MasteryLevel = Field(
        description="Overall mastery: mastered / learning / missed."
    )


class ScoreResult(BaseModel):
    """Response from POST /api/score.

    Contains the full breakdown shown on the AutopsyReport end screen.
    """

    total_score: int = Field(
        description="Final score. Max 1000 base + bonuses - penalties."
    )
    base_score: int = Field(
        description="health_score × 10, capped at 1000."
    )
    smart_choice_bonus: int = Field(
        description="+50 for each decision where the player picked the smartest option."
    )
    saved_bonus: int = Field(
        description="+100 if the player saved the company."
    )
    real_company_penalty: int = Field(
        description="-30 for each decision where the player copied the real company's "
        "bad choice. Stored as a negative integer."
    )
    concept_mastery: list[ConceptMastery] = Field(
        description="Per-concept learning breakdown."
    )
    ending_type: EndingType
    final_state: GameState
    verdict: str = Field(
        description="Short motivational verdict label. "
        "Example: 'Financial Genius', 'Quick Learner', 'Needs More Practice'."
    )
    real_outcome: str = Field(
        description="What actually happened to the real company — always shown."
    )


class ProgressEvent(BaseModel):
    """Snapshot of game progress at any point during a playthrough.

    Used by the frontend to update the progress bar and track which financial
    concepts the player has encountered so far.
    """

    scenario_id: str
    decision_number: int = Field(
        ge=1, le=8, description="The decision the player just completed."
    )
    total_decisions: int = Field(
        default=8, description="Always 8 — kept explicit for frontend convenience."
    )
    concepts_seen: list[str] = Field(
        description="All concept names encountered so far in this playthrough."
    )
    current_state: GameState = Field(
        description="Game state after this decision was applied."
    )


class ExplanationResponse(BaseModel):
    """Response from GET /api/explanation/{scenario_id}/{decision_id}/{option_id}.

    Returned when the frontend requests an AI-generated plain English
    explanation from Amazon Nova Lite via Bedrock.  The explanation is
    supplementary to the static plain_english_explanation already in the JSON.
    """

    scenario_id: str
    decision_id: str
    option_id: str
    concept: str = Field(description="The concept this explanation covers.")
    explanation: str = Field(
        description="AI-generated plain English explanation from Nova Lite. "
        "Tailored to the specific choice the player made."
    )
