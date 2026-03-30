"""
Game engine for the StartupAutopsy simulation.

Orchestrates a single POST /api/decision call:
  1. Load the scenario and locate the requested decision + option.
  2. Delegate all financial math to financial_calculator.py.
  3. Build and return a ConsequenceResult.

No financial arithmetic may live here — it all lives in financial_calculator.py.
"""

from __future__ import annotations

import logging

from engine.consequence_engine import build_history_entry
from models import (
    ConsequenceResult,
    DecisionRequest,
    EndingType,
)
from utils.financial_calculator import apply_financial_impact, check_game_over
from utils.scenario_loader import get_scenario

logger = logging.getLogger(__name__)


def process_decision(request: DecisionRequest) -> ConsequenceResult:
    """Apply a player's decision and return the full consequence payload.

    This is the single entry point called by POST /api/decision.

    Args:
        request: Contains scenario_id, decision_number, option_id, and the
                 current GameState immediately before this decision.

    Returns:
        ConsequenceResult with the updated GameState, narrative content,
        real-company comparison, and ending details if the game is now over.

    Raises:
        KeyError:  If scenario_id is not in the cache.
        ValueError: If decision_number or option_id are not found in the
                    scenario (indicates a bug in the frontend request).
    """
    scenario = get_scenario(request.scenario_id)

    # --- Locate the decision ---
    decision = next(
        (d for d in scenario.decisions if d.decision_number == request.decision_number),
        None,
    )
    if decision is None:
        raise ValueError(
            f"Decision number {request.decision_number} not found in "
            f"scenario '{request.scenario_id}'."
        )

    # --- Locate the chosen option ---
    option_chosen = next(
        (o for o in decision.options if o.id == request.option_id),
        None,
    )
    if option_chosen is None:
        raise ValueError(
            f"Option '{request.option_id}' not found in decision "
            f"{request.decision_number} of scenario '{request.scenario_id}'."
        )

    # --- Locate the real company option ---
    real_company_option = next(
        o for o in decision.options if o.is_what_real_company_did
    )

    # --- Apply financial impact (single authoritative call) ---
    new_state = apply_financial_impact(request.current_state, option_chosen.financial_impact)

    # --- Determine game-over / ending ---
    is_over, ending_type = check_game_over(new_state)
    ending_details = None
    if is_over and ending_type is not None:
        ending_details = _resolve_ending(ending_type, scenario.endings)

    return ConsequenceResult(
        option_chosen=option_chosen,
        new_state=new_state,
        real_company_choice=decision.real_company_choice,
        real_company_option=real_company_option,
        chose_what_real_company_did=(option_chosen.id == real_company_option.id),
        learning_moment=decision.learning_moment,
        game_over=is_over,
        ending_type=ending_type,
        ending_details=ending_details,
        next_decision=_next_decision(scenario.decisions, request.decision_number)
        if not is_over
        else None,
    )


def build_initial_state_from_scenario(scenario_id: str):
    """Return the starting GameState for a scenario.

    Called when the frontend loads a new game to seed the first GameState
    without requiring a dummy decision submission.

    Args:
        scenario_id: The scenario to start.

    Returns:
        GameState populated from Scenario.initial_financials.
    """
    from models import GameState

    scenario = get_scenario(scenario_id)
    f = scenario.initial_financials
    return GameState(
        cash=f.cash,
        monthly_burn=f.monthly_burn,
        monthly_revenue=f.monthly_revenue,
        runway_months=f.runway_months,
        health_score=f.health_score,
        health_breakdown=f.health_breakdown,
        subscribers=f.subscribers,
        decisions_made=0,
        is_game_over=False,
        game_over_reason=None,
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _resolve_ending(ending_type: EndingType, endings):
    """Return the Ending story object that matches ending_type."""
    if ending_type == EndingType.BANKRUPT:
        return endings.bankrupt
    if ending_type == EndingType.SAVED:
        return endings.saved
    return endings.struggling


def _next_decision(decisions, current_number: int):
    """Return the decision that follows current_number, or None if last."""
    return next(
        (d for d in decisions if d.decision_number == current_number + 1),
        None,
    )
