---
name: code-review
description: Review Python and TypeScript code quality for StartupAutopsy — checks style, type safety, security, and project conventions
---

# StartupAutopsy Code Review Skill

Perform a thorough code review of the file(s) in scope. Check against the project's coding standards defined in CLAUDE.md.

## Review Checklist

### Python Files
- [ ] PEP 8 compliance (naming, spacing, line length)
- [ ] Type hints on every function parameter and return value
- [ ] Docstrings on all functions and classes
- [ ] No financial calculations outside `financial_calculator.py`
- [ ] No AI/Bedrock calls outside `explanation_engine.py`
- [ ] No bare `except:` clauses — always catch specific exceptions
- [ ] No hardcoded values that belong in config or scenario JSON
- [ ] Pydantic models used for all API inputs/outputs (no raw dicts at boundaries)

### TypeScript Files
- [ ] Strict mode compliance — zero `any` types
- [ ] Interfaces used instead of `type` aliases for object shapes
- [ ] No inline financial calculations — all math goes through API or lib utilities
- [ ] Components are small and single-purpose
- [ ] Every number that changes on the dashboard uses Framer Motion animation
- [ ] Financial terms highlighted in orange on first appearance with TermTooltip onClick
- [ ] No hardcoded financial data — all data fetched from API

### Both
- [ ] No console.log / print statements left in production paths
- [ ] No TODO comments left unaddressed
- [ ] No unused imports or variables
- [ ] Functions do one thing only

## Output Format

Report findings grouped by severity:

**BLOCKER** — Must fix before this file ships
**WARNING** — Should fix, degrades quality
**SUGGESTION** — Nice to have

For each finding, include:
- File path and line number
- What the issue is
- What it should be instead

End with: `VERDICT: APPROVED` or `VERDICT: NEEDS CHANGES (N blockers, M warnings)`
