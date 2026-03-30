---
name: balance-check
description: Check if a StartupAutopsy scenario is too easy or too hard — verify difficulty calibration and that learning outcomes are achievable
---

# Balance Check Skill

Simulate playthroughs of the target scenario to verify it is beatable, challenging, and teaches its concept effectively.

## Step 1 — Simulate the "Perfect Player" Path

Walk through all 8 decisions choosing the option with the best `health_score_change` and most favorable `financial_impact` each time.

Calculate the final state:
- Starting health score + sum of all best `health_score_change` values
- Starting cash + sum of all best `cash_change` values
- Starting runway + sum of all best `runway_change` values

**Pass condition:** Final health ≥ 60 AND final runway ≥ 3 months
**Fail:** If even the perfect player can't save the company, the scenario is too hard.

## Step 2 — Simulate the "Real Company" Path

Walk through all 8 decisions always choosing `is_what_real_company_did: true`.

Calculate the final state using the same method.

**Pass condition:** Final health ≤ 40 OR cash ≤ 0 (company should be in serious trouble or bankrupt)
**Fail:** If following the real company's choices still produces a healthy company, the lesson is lost.

## Step 3 — Simulate the "Average Player" Path

Walk through all 8 decisions choosing the second-best option by `health_score_change`.

**Pass condition:** Final health between 35–65 (struggling but not dead — teachable moment)

## Step 4 — Difficulty Check

For the declared `difficulty` level:
- **beginner** — Perfect player wins by ≥ 15 health points above threshold. Bad choices have immediate, obvious consequences.
- **intermediate** — Perfect player wins by 5–15 health points. Some choices have delayed consequences.
- **expert** — Perfect player barely wins (health 60–70). Most choices have non-obvious tradeoffs.

## Step 5 — Concept Clarity Check

For each decision, verify:
- [ ] A player who has never heard the `concept_being_taught` would understand the lesson from `plain_english_explanation`
- [ ] The financial numbers in `plain_english_explanation` match the `financial_impact` values
- [ ] The "wrong" choice (real company choice) has a noticeably worse outcome that illustrates the concept

## Output Format

```
SCENARIO: [id] | DIFFICULTY: [declared] | CONCEPT: [concept]

PERFECT PLAYER:  health=[X] runway=[Y]m cash=$[Z]  → [WINS/FAILS]
REAL COMPANY:    health=[X] runway=[Y]m cash=$[Z]  → [BANKRUPT/STRUGGLING/SAVED]
AVERAGE PLAYER:  health=[X] runway=[Y]m cash=$[Z]  → [outcome]

DIFFICULTY CALIBRATION: [CORRECT / TOO EASY / TOO HARD]
CONCEPT CLARITY: [CLEAR / UNCLEAR — list issues]

VERDICT: BALANCED / NEEDS REBALANCING
Recommendations: [numbered list of specific adjustments]
```
