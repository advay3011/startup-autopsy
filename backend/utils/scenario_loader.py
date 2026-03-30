"""
Scenario loader for the StartupAutopsy backend.

Loads, validates, and caches all scenario JSON files at startup.  All other
modules must access scenarios through the functions in this module — never by
reading JSON files directly.

Public API
----------
load_all_scenarios(scenarios_dir) -> dict[str, Scenario]
get_scenario(scenario_id) -> Scenario
get_all_scenario_summaries() -> list[ScenarioSummary]
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from pydantic import ValidationError

from models import Scenario, ScenarioSummary

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level cache — populated once by load_all_scenarios()
# ---------------------------------------------------------------------------

_scenarios: dict[str, Scenario] = {}

# Default location: backend/scenarios/ relative to this file
_DEFAULT_SCENARIOS_DIR = Path(__file__).parent.parent / "scenarios"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def load_all_scenarios(
    scenarios_dir: Path | None = None,
) -> dict[str, Scenario]:
    """Load, validate, and cache all scenario JSON files in scenarios_dir.

    Called once at application startup (from main.py lifespan).  Re-calling
    this function replaces the cache, which is useful in tests.

    Args:
        scenarios_dir: Directory containing scenario JSON files.
                       Defaults to backend/scenarios/.

    Returns:
        Mapping of scenario_id -> Scenario for all successfully loaded files.
        Files that fail Pydantic validation are logged as errors and skipped
        so that a single broken scenario never takes down the whole server.

    Raises:
        FileNotFoundError: If scenarios_dir does not exist.
    """
    global _scenarios

    directory = scenarios_dir or _DEFAULT_SCENARIOS_DIR
    if not directory.exists():
        raise FileNotFoundError(
            f"Scenarios directory not found: {directory}. "
            "Create it and add at least one scenario JSON file."
        )

    loaded: dict[str, Scenario] = {}
    json_files = sorted(directory.glob("*.json"))

    if not json_files:
        logger.warning("No scenario JSON files found in %s", directory)

    for path in json_files:
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            scenario = Scenario.model_validate(raw)
        except json.JSONDecodeError as exc:
            logger.error("JSON parse error in %s: %s", path.name, exc)
            continue
        except ValidationError as exc:
            logger.error("Schema validation failed for %s:\n%s", path.name, exc)
            continue

        if scenario.id in loaded:
            logger.error(
                "Duplicate scenario id '%s' found in %s — skipping.",
                scenario.id,
                path.name,
            )
            continue

        loaded[scenario.id] = scenario
        logger.info("Loaded scenario '%s' (%s)", scenario.id, path.name)

    _scenarios = loaded
    logger.info("Scenario cache: %d scenario(s) loaded.", len(_scenarios))
    return _scenarios


def get_scenario(scenario_id: str) -> Scenario:
    """Return a cached Scenario by ID.

    Args:
        scenario_id: The scenario's unique identifier (e.g. "quibi_burn_rate").

    Returns:
        The cached Scenario object.

    Raises:
        KeyError: If no scenario with that ID is in the cache.  Callers should
                  convert this to a 404 HTTP response.
    """
    if scenario_id not in _scenarios:
        raise KeyError(
            f"Scenario '{scenario_id}' not found. "
            f"Available: {sorted(_scenarios.keys())}"
        )
    return _scenarios[scenario_id]


def get_all_scenario_summaries() -> list[ScenarioSummary]:
    """Return lightweight summary cards for all loaded scenarios.

    Used by GET /api/scenarios to populate the home screen company selector
    without sending full decision trees to the client.

    Returns:
        List of ScenarioSummary objects, sorted by scenario ID for
        deterministic ordering.
    """
    return [
        ScenarioSummary(
            id=s.id,
            company=s.company,
            concept=s.concept,
            concept_description=s.concept_description,
            industry=s.industry,
            emoji=s.emoji,
            tagline=s.tagline,
            difficulty=s.difficulty,
            initial_cash=s.initial_financials.cash,
            initial_health_score=s.initial_financials.health_score,
        )
        for s in sorted(_scenarios.values(), key=lambda s: s.id)
    ]
