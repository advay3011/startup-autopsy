---
name: scenario-review
description: Validate a StartupAutopsy scenario JSON file for completeness, decision quality, financial accuracy, and learning outcomes
---

# Scenario Review Skill

Validate the target scenario JSON file against the schema and quality standards defined in CLAUDE.md.

## Step 1 — Schema Completeness

Verify every required field is present and non-empty:

**Top-level required fields:**
- [ ] `id`, `company`, `concept`, `concept_description`, `concept_analogy`
- [ ] `industry`, `emoji`, `tagline`, `difficulty`
- [ ] `opening_story` — must be evocative, not dry
- [ ] `initial_financials` — all 5 fields + full `health_breakdown`
- [ ] `decisions` — exactly 8 decision objects
- [ ] `endings` — all 3: `bankrupt`, `saved`, `struggling`
- [ ] `real_outcome`, `concepts_taught`, `what_you_learned_summary`

**Per decision required fields:**
- [ ] `id`, `decision_number`, `situation`, `context`, `concept_being_taught`
- [ ] `options` — exactly 4 options per decision
- [ ] `real_company_choice`, `learning_moment`

**Per option required fields:**
- [ ] `id`, `text`, `short_label`, `outcome_label`
- [ ] `consequence_story`, `plain_english_explanation`, `concept_explained`
- [ ] `financial_impact` — all 6 fields present and numeric
- [ ] `is_what_real_company_did` — exactly one `true` per decision
- [ ] `real_company_note` — non-null on the option where `is_what_real_company_did: true`

## Step 2 — Financial Accuracy

- [ ] `initial_financials.runway_months` ≈ `cash / monthly_burn` (within 1 month)
- [ ] Real company financials match known historical data (verify against `real_outcome`)
- [ ] `financial_impact` values are plausible relative to initial state
- [ ] At least one option per decision has a negative `health_score_change` and at least one has a positive or neutral change
- [ ] `runway_change` values align directionally with `cash_change` values

## Step 3 — Decision Quality

- [ ] The "smart" option is not always the one that saves the most cash — nuance required
- [ ] The option with `is_what_real_company_did: true` should generally be the worst or second-worst choice
- [ ] Each option teaches something different — no two options should have essentially the same lesson
- [ ] `consequence_story` is dramatic and emotional, not a spreadsheet summary (min 2 sentences)
- [ ] `plain_english_explanation` uses no jargon without defining it
- [ ] `concept_explained` names the specific financial concept being taught

## Step 4 — Learning Outcome Integrity

- [ ] Each decision teaches exactly one primary concept (matches `concept_being_taught`)
- [ ] The 8 decisions build progressively — early decisions set up later ones
- [ ] `learning_moment` summarizes the core concept in plain English (max 2 sentences)
- [ ] `what_you_learned_summary` covers all `concepts_taught` entries

## Output Format

```
SCENARIO: [id]
SCHEMA: PASS / FAIL (list missing fields)
FINANCIALS: PASS / FAIL (list discrepancies)
DECISIONS: PASS / FAIL (list quality issues)
LEARNING: PASS / FAIL (list gaps)

VERDICT: READY TO SHIP / NEEDS REVISION
Issues: [numbered list of everything that must be fixed]
```
