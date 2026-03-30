"""
Financial calculator for the StartupAutopsy game engine.

All game math lives here and nowhere else. No financial logic may be inlined
in game_engine.py, consequence_engine.py, or any API route handler.

Public API
----------
calculate_burn_rate(monthly_expenses, monthly_revenue) -> float
calculate_runway(cash, monthly_burn, monthly_revenue) -> float
calculate_health_score(game_state) -> float
apply_financial_impact(game_state, financial_impact) -> GameState
check_game_over(game_state) -> tuple[bool, EndingType | None]
calculate_score(score_request, real_outcome) -> ScoreResult
"""

from __future__ import annotations

import logging
from collections import defaultdict

from models import (
    ConceptMastery,
    DecisionHistoryEntry,
    EndingType,
    FinancialImpact,
    GameState,
    HealthBreakdown,
    MasteryLevel,
    ScoreRequest,
    ScoreResult,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Runway
INFINITE_RUNWAY_SENTINEL: float = 999.0
"""Stored in GameState.runway_months when net burn <= 0 (cash-flow positive).
Never use float('inf') — JSON serialisation will raise ValueError."""

# Game-over thresholds
GAME_OVER_CASH_THRESHOLD: float = 0.0
GAME_OVER_HEALTH_THRESHOLD: float = 10.0

# Saved-ending thresholds
SAVED_HEALTH_THRESHOLD: float = 60.0
SAVED_RUNWAY_THRESHOLD: float = 3.0  # months

# Health score weights — must sum to exactly 1.0
HEALTH_WEIGHTS: dict[str, float] = {
    "burn_rate_health": 0.25,
    "revenue_growth": 0.25,
    "unit_economics": 0.20,
    "cash_flow": 0.20,
    "investor_confidence": 0.10,
}

# Minimum gross monthly burn — protects the GameState.monthly_burn gt=0 constraint.
# If a FinancialImpact would push burn to zero or below, it is clamped to this floor.
# This should never fire in production — if it does, the scenario data is wrong.
MIN_MONTHLY_BURN: float = 1.0

# Score
SCORE_BASE_MULTIPLIER: int = 10
SCORE_MAX_BASE: int = 1000
SCORE_SMART_CHOICE_BONUS: int = 50
SCORE_SAVED_BONUS: int = 100
SCORE_REAL_COMPANY_PENALTY: int = -30  # stored as negative

# Mastery thresholds (ratio = smart_choices / decisions_faced)
MASTERY_MASTERED_RATIO: float = 0.67
MASTERY_LEARNING_RATIO: float = 0.34

# Verdict thresholds
VERDICT_GENIUS_THRESHOLD: int = 900
VERDICT_LEARNER_THRESHOLD: int = 600


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _clamp(value: float, lo: float, hi: float) -> float:
    """Return value clamped to the closed interval [lo, hi]."""
    return max(lo, min(hi, value))


def _apply_health_delta(breakdown: HealthBreakdown, delta: float) -> HealthBreakdown:
    """Return a new HealthBreakdown with every component shifted by delta.

    Using a flat shift guarantees the weighted health score changes by exactly
    delta (subject only to boundary clamping), because:
        Σ (component_i + delta) × weight_i
        = Σ component_i × weight_i  +  delta × Σ weight_i
        = health_score_prev + delta × 1.0

    Each component is clamped to [0, 100] after shifting.
    """
    return HealthBreakdown(
        burn_rate_health=_clamp(breakdown.burn_rate_health + delta, 0.0, 100.0),
        revenue_growth=_clamp(breakdown.revenue_growth + delta, 0.0, 100.0),
        unit_economics=_clamp(breakdown.unit_economics + delta, 0.0, 100.0),
        cash_flow=_clamp(breakdown.cash_flow + delta, 0.0, 100.0),
        investor_confidence=_clamp(breakdown.investor_confidence + delta, 0.0, 100.0),
    )


def _build_game_over_reason(state: GameState) -> str:
    """Return a human-readable reason string for why the game ended."""
    if state.cash <= GAME_OVER_CASH_THRESHOLD:
        return "The company ran out of cash."
    if state.health_score <= GAME_OVER_HEALTH_THRESHOLD:
        return "Company health collapsed — investors pulled out."
    return "Game over."


def _build_concept_mastery(
    history: list[DecisionHistoryEntry],
) -> list[ConceptMastery]:
    """Compute per-concept learning summaries from the full decision history.

    Groups entries by concept, then classifies mastery level:
    - MASTERED: smart_ratio >= 0.67 AND zero real-company copies
    - LEARNING:  smart_ratio >= 0.34 (or >= 0.67 but copied real company at least once)
    - MISSED:    smart_ratio <  0.34
    """
    grouped: dict[str, list[DecisionHistoryEntry]] = defaultdict(list)
    for entry in history:
        grouped[entry.concept].append(entry)

    result: list[ConceptMastery] = []
    for concept, entries in grouped.items():
        decisions_faced = len(entries)
        smart_choices = sum(1 for e in entries if e.is_smart_choice)
        real_company_copies = sum(1 for e in entries if e.chose_what_real_company_did)

        ratio = smart_choices / decisions_faced

        if ratio >= MASTERY_MASTERED_RATIO and real_company_copies == 0:
            mastery_level = MasteryLevel.MASTERED
        elif ratio >= MASTERY_LEARNING_RATIO:
            mastery_level = MasteryLevel.LEARNING
        else:
            mastery_level = MasteryLevel.MISSED

        result.append(
            ConceptMastery(
                concept=concept,
                decisions_faced=decisions_faced,
                smart_choices=smart_choices,
                real_company_copies=real_company_copies,
                mastery_level=mastery_level,
            )
        )

    return result


def _determine_verdict(total_score: int) -> str:
    """Return a short motivational verdict label based on the final score."""
    if total_score >= VERDICT_GENIUS_THRESHOLD:
        return "Financial Genius"
    if total_score >= VERDICT_LEARNER_THRESHOLD:
        return "Quick Learner"
    return "Needs More Practice"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def calculate_burn_rate(monthly_expenses: float, monthly_revenue: float) -> float:
    """Return the net monthly cash burn.

    A positive result means the company is spending more than it earns (normal
    for early-stage startups).  Zero means break-even.  Negative means the
    company is cash-flow positive — runway is effectively infinite.

    Args:
        monthly_expenses: Gross monthly spend in dollars (always positive).
        monthly_revenue:  Monthly revenue in dollars (zero or positive).

    Returns:
        Net burn in dollars per month.  Not clamped — callers need the true
        signed value to detect cash-flow positivity.
    """
    return monthly_expenses - monthly_revenue


def calculate_runway(
    cash: float,
    monthly_burn: float,
    monthly_revenue: float,
) -> float:
    """Return months of cash remaining based on net burn.

    Uses net burn (gross burn minus revenue) rather than gross burn so that
    runway improves as the company earns more money — which is the correct
    player-facing behaviour.

    Args:
        cash:            Current cash on hand in dollars.
        monthly_burn:    Gross monthly spend (must be > 0 per schema constraint).
        monthly_revenue: Monthly revenue (>= 0).

    Returns:
        Months of runway remaining.  Returns INFINITE_RUNWAY_SENTINEL (999.0)
        when net burn <= 0 (company is cash-flow positive).  Returns 0.0 when
        cash is already at or below zero.
    """
    net_burn = calculate_burn_rate(monthly_burn, monthly_revenue)
    if net_burn <= 0.0:
        return INFINITE_RUNWAY_SENTINEL
    if cash <= 0.0:
        return 0.0
    return max(0.0, cash / net_burn)


def calculate_health_score(game_state: GameState) -> float:
    """Return the overall health score (0–100) from the game state's breakdown.

    Computes the weighted average of all five HealthBreakdown components using
    the weights defined in HEALTH_WEIGHTS.  The result is clamped to [0, 100]
    as a safety net even though each component is individually constrained.

    Args:
        game_state: Current game state containing the health breakdown.

    Returns:
        Weighted health score in [0, 100].
    """
    b = game_state.health_breakdown
    score = (
        b.burn_rate_health * HEALTH_WEIGHTS["burn_rate_health"]
        + b.revenue_growth * HEALTH_WEIGHTS["revenue_growth"]
        + b.unit_economics * HEALTH_WEIGHTS["unit_economics"]
        + b.cash_flow * HEALTH_WEIGHTS["cash_flow"]
        + b.investor_confidence * HEALTH_WEIGHTS["investor_confidence"]
    )
    return _clamp(score, 0.0, 100.0)


def apply_financial_impact(
    game_state: GameState,
    financial_impact: FinancialImpact,
) -> GameState:
    """Apply a decision's financial impact and return a new GameState.

    This is the single authoritative place where FinancialImpact deltas are
    applied to GameState.  It must never be called from anywhere except
    game_engine.py or consequence_engine.py.

    The function also increments decisions_made and checks for game-over
    conditions.  The caller (game engine) must NOT separately increment
    decisions_made.

    Args:
        game_state:       State before the decision.
        financial_impact: Deltas from the chosen DecisionOption.

    Returns:
        New GameState reflecting all applied changes, with is_game_over and
        game_over_reason set if a terminal condition was reached.
    """
    # Step 1 — Apply raw deltas
    new_cash = game_state.cash + financial_impact.cash_change
    new_monthly_burn = game_state.monthly_burn + financial_impact.monthly_burn_change
    new_monthly_revenue = (
        game_state.monthly_revenue + financial_impact.monthly_revenue_change
    )
    new_subscribers = game_state.subscribers + financial_impact.subscriber_change

    # Step 2 — Clamp to valid ranges
    if new_monthly_burn < MIN_MONTHLY_BURN:
        logger.warning(
            "monthly_burn_change would push gross burn to %.2f — clamping to %.2f. "
            "Check scenario data for decision with impact %s.",
            new_monthly_burn,
            MIN_MONTHLY_BURN,
            financial_impact,
        )
        new_monthly_burn = MIN_MONTHLY_BURN
    new_monthly_revenue = max(0.0, new_monthly_revenue)
    new_subscribers = max(0, new_subscribers)

    # Step 3 — Update health breakdown (flat shift across all components)
    new_breakdown = _apply_health_delta(
        game_state.health_breakdown, financial_impact.health_score_change
    )

    # Step 4 — Derive health score from updated breakdown
    # Build a temporary stub to reuse calculate_health_score without a full GameState
    _stub = game_state.model_copy(
        update={"health_breakdown": new_breakdown, "health_score": 0.0}
    )
    new_health_score = calculate_health_score(_stub)

    # Step 5 — Recalculate runway from updated cash and burn
    new_runway = calculate_runway(new_cash, new_monthly_burn, new_monthly_revenue)

    # Step 6 — Increment decisions_made (single authoritative increment point)
    new_decisions_made = game_state.decisions_made + 1

    # Step 7 — Build candidate state (game_over determined in step 8)
    candidate = GameState(
        cash=new_cash,
        monthly_burn=new_monthly_burn,
        monthly_revenue=new_monthly_revenue,
        runway_months=new_runway,
        health_score=new_health_score,
        health_breakdown=new_breakdown,
        subscribers=new_subscribers,
        decisions_made=new_decisions_made,
        is_game_over=False,
        game_over_reason=None,
    )

    # Step 8 — Check terminal conditions and annotate final state
    is_over, _ = check_game_over(candidate)
    if is_over:
        return candidate.model_copy(
            update={
                "is_game_over": True,
                "game_over_reason": _build_game_over_reason(candidate),
            }
        )
    return candidate


def check_game_over(
    game_state: GameState,
) -> tuple[bool, EndingType | None]:
    """Determine whether the game has ended and which ending applies.

    Bankruptcy takes priority over completion — a player who reaches decision 8
    but simultaneously exhausts cash or collapses health gets BANKRUPT, not SAVED.

    Args:
        game_state: Current game state to evaluate.

    Returns:
        (True, EndingType) when a terminal condition is met.
        (False, None) during normal mid-game play.
    """
    # Priority 1 — Bankruptcy conditions (can trigger at any decision)
    if game_state.cash <= GAME_OVER_CASH_THRESHOLD:
        return (True, EndingType.BANKRUPT)
    if game_state.health_score <= GAME_OVER_HEALTH_THRESHOLD:
        return (True, EndingType.BANKRUPT)

    # Priority 2 — All 8 decisions completed
    if game_state.decisions_made >= 8:
        if (
            game_state.health_score >= SAVED_HEALTH_THRESHOLD
            and game_state.runway_months >= SAVED_RUNWAY_THRESHOLD
        ):
            return (True, EndingType.SAVED)
        return (True, EndingType.STRUGGLING)

    # Still in play
    return (False, None)


def calculate_score(
    score_request: ScoreRequest,
    real_outcome: str,
) -> ScoreResult:
    """Compute the final score and learning summary for a completed playthrough.

    Called once at the end of the game when POST /api/score is received.
    All scoring logic (base score, bonuses, penalties, mastery, verdict) is
    centralised here.

    Args:
        score_request: Contains final_state, ending_type, and the full
                       decision history for this playthrough.
        real_outcome:  What actually happened to the real company.  Comes from
                       Scenario.real_outcome — the engine passes it through.

    Returns:
        ScoreResult with a full breakdown suitable for the AutopsyReport screen.
    """
    final_state = score_request.final_state
    history = score_request.decisions_history
    ending_type = score_request.ending_type

    # Base score: health_score × 10, capped at 1000
    base_score = min(int(final_state.health_score * SCORE_BASE_MULTIPLIER), SCORE_MAX_BASE)

    # Smart choice bonus: +50 per decision where player chose the SMART option
    smart_choice_bonus = sum(
        SCORE_SMART_CHOICE_BONUS for entry in history if entry.is_smart_choice
    )

    # Saved bonus: +100 for saving the company
    saved_bonus = SCORE_SAVED_BONUS if ending_type == EndingType.SAVED else 0

    # Real company penalty: -30 per decision where player copied the failing company
    real_company_penalty = sum(
        SCORE_REAL_COMPANY_PENALTY
        for entry in history
        if entry.chose_what_real_company_did
    )

    total_score = base_score + smart_choice_bonus + saved_bonus + real_company_penalty

    return ScoreResult(
        total_score=total_score,
        base_score=base_score,
        smart_choice_bonus=smart_choice_bonus,
        saved_bonus=saved_bonus,
        real_company_penalty=real_company_penalty,
        concept_mastery=_build_concept_mastery(history),
        ending_type=ending_type,
        final_state=final_state,
        verdict=_determine_verdict(total_score),
        real_outcome=real_outcome,
    )
