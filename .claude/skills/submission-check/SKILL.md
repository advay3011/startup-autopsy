---
name: submission-check
description: Audit the entire StartupAutopsy project against Hackonomics 2026 judging criteria before submission
---

# Submission Check Skill

Perform a pre-submission audit of the entire project against the Hackonomics 2026 judging criteria (in priority order).

## Criterion 1 — Relevancy (Financial Literacy / Economics)

- [ ] Every decision explicitly teaches a named financial concept
- [ ] Financial terms are defined in plain English on first appearance (TermTooltip)
- [ ] The glossary covers all terms used across all scenarios
- [ ] The IE/Operations Research connection is visible in the UI (not just the Devpost description)
- [ ] At least one UI element references simulation modeling, decision analysis, or systems thinking

**Score: [X/5 elements present]**

## Criterion 2 — Technical Execution

- [ ] Backend: FastAPI running with all 6 API routes responding correctly
- [ ] Backend: All 8 scenario JSON files load without validation errors
- [ ] Backend: Financial calculations handled exclusively in `financial_calculator.py`
- [ ] Backend: AI explanations wired to Amazon Nova Lite via Bedrock
- [ ] Frontend: Next.js builds without TypeScript errors (`tsc --noEmit` passes)
- [ ] Frontend: Dashboard numbers animate on every state change (Framer Motion)
- [ ] Frontend: All 3 charts render (RunwayChart, HealthRadar, VsRealChart)
- [ ] End-to-end: Can complete a full Quibi Burn Rate playthrough without errors

**Score: [X/8 checks passing]**

## Criterion 3 — Presentation

- [ ] Dark theme matches design system (#0a0a0a background, #ef4444 accent)
- [ ] Font is Inter throughout
- [ ] No student-project aesthetics — spacing, hierarchy, and polish feel premium
- [ ] Layout is clean at 1280px desktop minimum
- [ ] ConsequenceAlert full-screen moment is dramatic and visually impactful
- [ ] AutopsyReport end screen feels like a real report card, not a score screen

**Score: [X/6 visual checks passing]**

## Criterion 4 — Impact

- [ ] A player who finishes Quibi Burn Rate can explain burn rate in their own words
- [ ] The "real company choice" reveal creates a genuine aha moment
- [ ] The bankruptcy ending feels like a real consequence, not a game over screen
- [ ] The saved ending feels genuinely rewarding
- [ ] ShareCard would make someone want to share their score

**Score: [X/5 impact checks passing]**

## Criterion 5 — Innovation

- [ ] The "play as a failed CEO" framing is unique on Devpost
- [ ] The VS Real Company chart is a unique differentiator
- [ ] The simulation is data-driven from real financial records, not made-up numbers
- [ ] The scoring system penalizes copying the real company's bad decisions

**Score: [X/4 innovation checks passing]**

## Demo Readiness

- [ ] Quibi Burn Rate scenario is completable in under 5 minutes
- [ ] No setup required beyond `npm run dev` + `uvicorn`
- [ ] All environment variables documented in README
- [ ] Demo video script covers one full scenario from landing page to AutopsyReport

**Score: [X/4 demo checks passing]**

## Output Format

```
SUBMISSION CHECK — StartupAutopsy

1. RELEVANCY:    [X/5]  [STRONG / ADEQUATE / WEAK]
2. TECHNICAL:    [X/8]  [STRONG / ADEQUATE / WEAK]
3. PRESENTATION: [X/6]  [STRONG / ADEQUATE / WEAK]
4. IMPACT:       [X/5]  [STRONG / ADEQUATE / WEAK]
5. INNOVATION:   [X/4]  [STRONG / ADEQUATE / WEAK]
   DEMO READY:   [X/4]  [YES / NOT YET]

OVERALL: SUBMIT / DO NOT SUBMIT YET

Blockers before submission:
[numbered list — only items that would cost points with judges]

Nice to have:
[numbered list — polish items if time allows]
```
