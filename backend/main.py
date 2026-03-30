"""
StartupAutopsy FastAPI application.

Routes
------
GET  /api/scenarios                              -> list[ScenarioSummary]
GET  /api/scenario/{scenario_id}                -> Scenario
POST /api/decision                               -> ConsequenceResult
GET  /api/explanation/{scenario_id}/{decision_id}/{option_id} -> ExplanationResponse
POST /api/score                                  -> ScoreResult
GET  /health                                     -> {"status": "ok"}
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine.explanation_engine import get_explanation
from engine.game_engine import build_initial_state_from_scenario, process_decision
from models import (
    ConsequenceResult,
    DecisionRequest,
    ExplanationResponse,
    GameState,
    Scenario,
    ScenarioSummary,
    ScoreRequest,
    ScoreResult,
)
from utils.financial_calculator import calculate_score
from utils.scenario_loader import get_all_scenario_summaries, get_scenario, load_all_scenarios

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — load scenarios once on startup
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all_scenarios()
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="StartupAutopsy API",
    description="Financial literacy simulation game engine — Hackonomics 2026",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
def health_check():
    """Basic health check — used by Docker / load balancers."""
    return {"status": "ok"}


@app.get("/api/scenarios", response_model=list[ScenarioSummary])
def list_scenarios():
    """Return lightweight summary cards for all available scenarios.

    Used by the home screen to populate the company selector.
    """
    return get_all_scenario_summaries()


@app.get("/api/scenario/{scenario_id}", response_model=Scenario)
def get_scenario_detail(scenario_id: str):
    """Return the full scenario JSON including all 8 decisions.

    Called when the player selects a scenario and the game screen loads.
    """
    try:
        return get_scenario(scenario_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")


@app.get("/api/scenario/{scenario_id}/initial-state", response_model=GameState)
def get_initial_state(scenario_id: str):
    """Return the starting GameState for a scenario.

    Called immediately after a player selects a scenario, before any decisions
    are made, to seed the dashboard.
    """
    try:
        return build_initial_state_from_scenario(scenario_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")


@app.post("/api/decision", response_model=ConsequenceResult)
def submit_decision(request: DecisionRequest):
    """Process a player's decision and return the full consequence payload.

    The frontend sends the current game state so this endpoint is stateless.
    """
    try:
        return process_decision(request)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.get(
    "/api/explanation/{scenario_id}/{decision_id}/{option_id}",
    response_model=ExplanationResponse,
)
def get_ai_explanation(scenario_id: str, decision_id: str, option_id: str):
    """Return an AI-generated plain English explanation from Amazon Nova Lite.

    Falls back to the static explanation in the scenario JSON if Bedrock
    is unavailable.
    """
    try:
        return get_explanation(scenario_id, decision_id, option_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.post("/api/score", response_model=ScoreResult)
def calculate_final_score(request: ScoreRequest):
    """Compute the final score and learning summary for a completed playthrough.

    Called once at the end of the game when the AutopsyReport screen loads.
    """
    try:
        scenario = get_scenario(request.scenario_id)
    except KeyError:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{request.scenario_id}' not found."
        )

    return calculate_score(request, scenario.real_outcome)


# ---------------------------------------------------------------------------
# AI-powered routes
# ---------------------------------------------------------------------------


class AutopsyReportRequest(BaseModel):
    scenario_id: str
    health_score: float
    ending_type: str
    final_cash: float
    runway: float
    decisions_history: list[dict]
    concepts: list[str]


class AutopsyReportResponse(BaseModel):
    report: str


@app.post("/api/ai/autopsy-report", response_model=AutopsyReportResponse)
def ai_autopsy_report(request: AutopsyReportRequest):
    """Generate a personalized AI autopsy report for the end screen."""
    from engine.explanation_engine import generate_autopsy_report

    try:
        scenario = get_scenario(request.scenario_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{request.scenario_id}' not found.")

    report = generate_autopsy_report(
        company=scenario.company,
        real_outcome=scenario.real_outcome,
        health_score=request.health_score,
        ending_type=request.ending_type,
        final_cash=request.final_cash,
        runway=request.runway,
        decision_history=request.decisions_history,
        concepts=request.concepts,
    )
    return AutopsyReportResponse(report=report)


class HintRequest(BaseModel):
    scenario_id: str
    health_score: float
    cash: float
    runway: float
    burn: float
    next_concept: str


class HintResponse(BaseModel):
    hint: str


@app.post("/api/ai/hint", response_model=HintResponse)
def ai_hint(request: HintRequest):
    """Generate a contextual hint when the player is struggling."""
    from engine.explanation_engine import generate_hint

    try:
        scenario = get_scenario(request.scenario_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{request.scenario_id}' not found.")

    hint = generate_hint(
        company=scenario.company,
        health_score=request.health_score,
        cash=request.cash,
        runway=request.runway,
        burn=request.burn,
        next_concept=request.next_concept,
    )
    return HintResponse(hint=hint)


class FollowupRequest(BaseModel):
    scenario_id: str
    concept: str
    consequence: str
    question: str


class FollowupResponse(BaseModel):
    answer: str


@app.post("/api/ai/followup", response_model=FollowupResponse)
def ai_followup(request: FollowupRequest):
    """Answer a player's follow-up question about a decision."""
    from engine.explanation_engine import generate_followup

    try:
        scenario = get_scenario(request.scenario_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{request.scenario_id}' not found.")

    answer = generate_followup(
        company=scenario.company,
        concept=request.concept,
        consequence=request.consequence,
        question=request.question,
    )
    return FollowupResponse(answer=answer)
