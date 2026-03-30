"""
Explanation engine — AI-generated plain English explanations via Amazon Bedrock.

All calls to Amazon Nova Lite (or any other Bedrock model) must go through this
module.  No Bedrock calls may be made from any other file.

Public API
----------
get_explanation(scenario_id, decision_id, option_id) -> ExplanationResponse
"""

from __future__ import annotations

import json
import logging
import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from models import ExplanationResponse
from utils.scenario_loader import get_scenario

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Bedrock client — initialised lazily to avoid startup failure when AWS
# credentials are not configured (e.g. during local development without Bedrock)
# ---------------------------------------------------------------------------

_bedrock_client = None


def _get_bedrock_client():
    """Return (or create) the Bedrock Runtime client."""
    global _bedrock_client
    if _bedrock_client is None:
        region = os.getenv("AWS_REGION", "us-east-1")
        _bedrock_client = boto3.client("bedrock-runtime", region_name=region)
    return _bedrock_client


# ---------------------------------------------------------------------------
# Prompt template
# ---------------------------------------------------------------------------

_EXPLANATION_PROMPT = """You are a financial literacy tutor for the StartupAutopsy game.

A player just chose an option in a startup simulation. Explain the financial concept
in plain English — as if talking to a smart 16-year-old who has never taken a finance class.

Context:
- Company: {company}
- Concept being taught: {concept}
- Decision: {situation}
- Player chose: {option_text}
- Financial consequence: {plain_english_explanation}

Write a 2-3 sentence explanation that:
1. Names the financial concept in the first sentence.
2. Explains WHY this choice matters using the actual numbers.
3. Connects it to a real-world analogy a teenager would understand.

Do not use jargon without immediately defining it. Keep it under 80 words."""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def get_explanation(
    scenario_id: str,
    decision_id: str,
    option_id: str,
) -> ExplanationResponse:
    """Generate an AI plain English explanation for a specific decision option.

    Looks up the scenario, decision, and option from the cache, builds a prompt,
    calls Amazon Nova Lite via Bedrock, and returns the structured response.

    Falls back to the static plain_english_explanation from the scenario JSON
    if the Bedrock call fails (network error, throttling, missing credentials).
    This ensures the game always has something to show the player.

    Args:
        scenario_id:  ID of the scenario (e.g. "quibi_burn_rate").
        decision_id:  ID of the decision (e.g. "d1").
        option_id:    ID of the chosen option ("a", "b", "c", or "d").

    Returns:
        ExplanationResponse with an AI-generated (or static fallback) explanation.

    Raises:
        KeyError:   If scenario_id is not in the cache.
        ValueError: If decision_id or option_id are not found in the scenario.
    """
    scenario = get_scenario(scenario_id)

    decision = next(
        (d for d in scenario.decisions if d.id == decision_id),
        None,
    )
    if decision is None:
        raise ValueError(
            f"Decision '{decision_id}' not found in scenario '{scenario_id}'."
        )

    option = next(
        (o for o in decision.options if o.id == option_id),
        None,
    )
    if option is None:
        raise ValueError(
            f"Option '{option_id}' not found in decision '{decision_id}' "
            f"of scenario '{scenario_id}'."
        )

    explanation = _call_bedrock(
        company=scenario.company,
        concept=decision.concept_being_taught,
        situation=decision.situation,
        option_text=option.text,
        plain_english_explanation=option.plain_english_explanation,
        fallback=option.plain_english_explanation,
    )

    return ExplanationResponse(
        scenario_id=scenario_id,
        decision_id=decision_id,
        option_id=option_id,
        concept=decision.concept_being_taught,
        explanation=explanation,
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _call_bedrock(
    company: str,
    concept: str,
    situation: str,
    option_text: str,
    plain_english_explanation: str,
    fallback: str,
) -> str:
    """Call Amazon Nova Lite via Bedrock Converse API and return the response text.

    Returns fallback text if any error occurs so the game is never blocked.
    """
    model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
    prompt = _EXPLANATION_PROMPT.format(
        company=company,
        concept=concept,
        situation=situation,
        option_text=option_text,
        plain_english_explanation=plain_english_explanation,
    )

    try:
        client = _get_bedrock_client()
        response = client.converse(
            modelId=model_id,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 200, "temperature": 0.4},
        )
        return response["output"]["message"]["content"][0]["text"].strip()

    except (BotoCoreError, ClientError) as exc:
        logger.warning(
            "Bedrock call failed for %s/%s/%s — using static fallback. Error: %s",
            concept,
            situation[:40],
            option_text[:40],
            exc,
        )
        return fallback
    except (KeyError, IndexError) as exc:
        logger.warning(
            "Unexpected Bedrock response shape — using static fallback. Error: %s", exc
        )
        return fallback


# ---------------------------------------------------------------------------
# Feature 2: Personalized AI Autopsy Report
# ---------------------------------------------------------------------------

_AUTOPSY_PROMPT = """You are a brutally honest startup board member reviewing a CEO's performance.

A player just finished a financial simulation where they ran {company} — a real company that {real_outcome}.

Their results:
- Final health score: {health_score}/100
- Ending: {ending_type}
- Decisions made: {num_decisions}
- Smart choices: {smart_choices} out of {num_decisions}
- Times they copied the real company's mistakes: {real_copies}
- Final cash: ${final_cash}
- Final runway: {runway} months
- Concepts covered: {concepts}

Decision history:
{decision_summary}

Write a 4-5 sentence personalized "CEO Performance Review" that:
1. Opens with a dramatic one-line verdict (like "You would have been fired by month 3.")
2. Calls out their SPECIFIC best and worst decisions by number
3. Identifies the ONE financial concept they struggled with most
4. Ends with one actionable lesson they should remember

Be direct, witty, and specific. Reference actual numbers. No generic advice.
Keep it under 120 words."""


def generate_autopsy_report(
    company: str,
    real_outcome: str,
    health_score: float,
    ending_type: str,
    final_cash: float,
    runway: float,
    decision_history: list[dict],
    concepts: list[str],
) -> str:
    """Generate a personalized AI autopsy report for the end screen."""
    smart_choices = sum(1 for d in decision_history if d.get("is_smart_choice"))
    real_copies = sum(1 for d in decision_history if d.get("chose_what_real_company_did"))
    num_decisions = len(decision_history)

    decision_summary = "\n".join(
        f"  Decision {d['decision_number']}: chose option {d['option_id']} "
        f"({'smart' if d.get('is_smart_choice') else 'not smart'}, "
        f"{'copied real company' if d.get('chose_what_real_company_did') else 'different from real company'}, "
        f"health change: {d.get('health_score_change', 0):+.0f})"
        for d in decision_history
    )

    cash_display = f"{final_cash / 1_000_000:.0f}M" if final_cash >= 1_000_000 else f"{final_cash:.0f}"

    prompt = _AUTOPSY_PROMPT.format(
        company=company,
        real_outcome=real_outcome,
        health_score=f"{health_score:.0f}",
        ending_type=ending_type,
        num_decisions=num_decisions,
        smart_choices=smart_choices,
        real_copies=real_copies,
        final_cash=cash_display,
        runway=f"{runway:.1f}",
        concepts=", ".join(c.replace("_", " ") for c in concepts),
        decision_summary=decision_summary,
    )

    fallback = (
        f"You ran {company} with a final health score of {health_score:.0f}/100. "
        f"You made {smart_choices} smart choices out of {num_decisions} decisions. "
        f"{'You copied the real company mistakes ' + str(real_copies) + ' times.' if real_copies > 0 else 'You avoided the real company mistakes.'}"
    )

    return _call_bedrock_raw(prompt, fallback, max_tokens=250)


# ---------------------------------------------------------------------------
# Feature 4: Dynamic Difficulty Hints
# ---------------------------------------------------------------------------

_HINT_PROMPT = """You are a financial advisor whispering a hint to a struggling CEO.

Company: {company}
Current situation: health score is {health_score}/100, cash is ${cash}, runway is {runway} months, burn rate is ${burn}/month.
The next decision is about: {next_concept}

The CEO is struggling. Give them ONE short hint (1-2 sentences max) that:
- References their specific numbers
- Nudges them toward thinking about the right concept
- Does NOT give away the answer
- Sounds like a concerned advisor, not a textbook

Keep it under 40 words. Be specific with numbers."""


def generate_hint(
    company: str,
    health_score: float,
    cash: float,
    runway: float,
    burn: float,
    next_concept: str,
) -> str:
    """Generate a contextual hint when the player is struggling."""
    cash_display = f"{cash / 1_000_000:.0f}M" if cash >= 1_000_000 else f"{cash:.0f}"
    burn_display = f"{burn / 1_000_000:.0f}M" if burn >= 1_000_000 else f"{burn:.0f}"

    prompt = _HINT_PROMPT.format(
        company=company,
        health_score=f"{health_score:.0f}",
        cash=cash_display,
        runway=f"{runway:.1f}",
        burn=burn_display,
        next_concept=next_concept.replace("_", " "),
    )

    return _call_bedrock_raw(prompt, "", max_tokens=80)


# ---------------------------------------------------------------------------
# Feature 1: Conversational Follow-up
# ---------------------------------------------------------------------------

_FOLLOWUP_PROMPT = """You are a financial literacy tutor for the StartupAutopsy game.

Context:
- Company: {company}
- Concept just taught: {concept}
- What happened: {consequence}
- The player's question: "{question}"

Answer their specific question in 2-3 sentences. Use the actual numbers from the scenario.
Explain like you're talking to a smart 16-year-old. No jargon without defining it.
Keep it under 60 words."""


def generate_followup(
    company: str,
    concept: str,
    consequence: str,
    question: str,
) -> str:
    """Answer a player's follow-up question about a decision."""
    prompt = _FOLLOWUP_PROMPT.format(
        company=company,
        concept=concept.replace("_", " "),
        consequence=consequence,
        question=question,
    )

    return _call_bedrock_raw(prompt, "I couldn't generate an answer right now. Try again!", max_tokens=150)


# ---------------------------------------------------------------------------
# Shared Bedrock caller (no scenario lookup needed)
# ---------------------------------------------------------------------------


def _call_bedrock_raw(prompt: str, fallback: str, max_tokens: int = 200) -> str:
    """Call Bedrock with a raw prompt string. Returns fallback on any error."""
    model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    try:
        client = _get_bedrock_client()
        response = client.converse(
            modelId=model_id,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": max_tokens, "temperature": 0.5},
        )
        return response["output"]["message"]["content"][0]["text"].strip()

    except (BotoCoreError, ClientError) as exc:
        logger.warning("Bedrock call failed — using fallback. Error: %s", exc)
        return fallback
    except (KeyError, IndexError) as exc:
        logger.warning("Unexpected Bedrock response — using fallback. Error: %s", exc)
        return fallback
