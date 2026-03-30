"""
Consequence engine for the StartupAutopsy simulation.

Responsible for deriving everything the frontend needs after a decision:
  - Building DecisionHistoryEntry records for score tracking.
  - Determining whether the chosen option was the "smart" play.

game_engine.py orchestrates the full decision flow; this module provides
the consequence-specific helpers it calls.

No financial arithmetic may live here — it all lives in financial_calculator.py.
"""

from __future__ import annotations

from models import (
    Decision,
    DecisionHistoryEntry,
    DecisionOption,
    OutcomeLabel,
)


def build_history_entry(
    decision: Decision,
    option_chosen: DecisionOption,
    real_company_option: DecisionOption,
) -> DecisionHistoryEntry:
    """Build a DecisionHistoryEntry from the outcome of one decision.

    The entry is designed to be accumulated by the frontend and sent in bulk
    to POST /api/score at the end of the game.

    Args:
        decision:            The Decision that was just answered.
        option_chosen:       The DecisionOption the player selected.
        real_company_option: The DecisionOption the real company chose.

    Returns:
        A DecisionHistoryEntry ready to append to the player's history list.
    """
    return DecisionHistoryEntry(
        decision_number=decision.decision_number,
        option_id=option_chosen.id,
        concept=decision.concept_being_taught,
        chose_what_real_company_did=(option_chosen.id == real_company_option.id),
        is_smart_choice=(option_chosen.outcome_label == OutcomeLabel.SMART),
        health_score_change=option_chosen.financial_impact.health_score_change,
    )
