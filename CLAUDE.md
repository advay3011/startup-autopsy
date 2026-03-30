# StartupAutopsy — Interactive Financial Literacy Simulation

## Project Overview
StartupAutopsy is an interactive financial literacy game where players become the CEO of a
real failed startup. Players make the same financial decisions the real founders made, watch
consequences play out live on a dashboard, and either save the company or watch it go bankrupt.
Every decision teaches one financial concept in plain English. Built for Hackonomics 2026.

## Hackathon Context
- **Hackathon:** Hackonomics 2026 (Devpost)
- **Theme:** Financial literacy and economics for the community
- **Deadline:** March 30, 2026
- **Judging Criteria (in order of importance):**
  1. Relevancy — addresses financial literacy / economics
  2. Technical Execution — high proficiency, scalability, efficiency
  3. Presentation — visually appealing, intuitive UI
  4. Impact — meaningful real-world applications
  5. Innovation — unique, creative, pushes boundaries

## Winning Strategy
- The simulation must feel alive — numbers animate in real time
- Every financial term must be explained in plain English the moment it appears
- Demo must be instantly playable without any setup
- The "save the company" moment must feel genuinely rewarding
- Judges must be able to play one full scenario in under 5 minutes
- The IE/operations research angle must be clearly communicated
- UI must look premium — dark theme, professional, not a student project

## The Unique Value Proposition
Every other Hackonomics submission explains financial literacy. StartupAutopsy makes players
LIVE through the consequences of bad financial decisions — with someone else's money. You
learn burn rate not by reading a definition but by watching your runway hit zero because you
spent too much on marketing.

## The IE/Operations Research Connection
- Simulation Modeling — the game engine is a financial simulation system
- Decision Analysis — every fork is a decision node with probabilistic outcomes
- Systems Thinking — startup finances modeled as an interconnected system
- Statistical Pattern Recognition — "73% of startups at this burn rate fail within 3 months"
This must be communicated clearly in the UI and Devpost submission.

## Companies & Scenarios
Each company has 2 concept paths. Each path has 8 decisions with 4 choices each.
All companies are real — real financial data, real mistakes, real consequences.

### 📺 Quibi (Media/Entertainment)
- **Path A — Burn Rate & Runway**
  Decisions about spending speed vs cash preservation
  Key lesson: You can raise $1.75B and still die in 6 months if you burn too fast
- **Path B — Market Timing**
  Decisions about pivoting when COVID destroys the commuter market
  Key lesson: Launching the right product at the wrong time is just as fatal as a bad product
- **Real financials:** $1.75B raised, $150M/month burn, dead in 6 months
- **Real outcome:** Shut down October 2020, returned remaining cash to investors

### 🥤 Juicero (Hardware/Consumer Product)
- **Path A — Unit Economics**
  Decisions about pricing, cost, and margins
  Key lesson: If you lose money on every unit sold, no amount of funding saves you
- **Path B — Market Validation**
  Decisions about whether anyone actually needs this product
  Key lesson: Raising $120M doesn't mean your product solves a real problem
- **Real financials:** $120M raised, $400 juicer, $30 juice packets
- **Real outcome:** Bloomberg showed packets squeezable by hand, shut down 2017

### 🏠 WeWork (Real Estate/Tech)
- **Path A — Valuation & Overspending**
  Decisions about growth vs profitability
  Key lesson: A $47B valuation means nothing if you lose $1.37B every year
- **Path B — Fundraising Gone Wrong**
  Decisions about how much to raise and at what valuation
  Key lesson: Taking too much money at too high a valuation creates impossible expectations
- **Real financials:** $47B peak valuation, $1.37B annual losses, IPO collapse
- **Real outcome:** Adam Neumann fired, valuation crashed, nearly bankrupt

### 💻 Zenefits (B2B SaaS)
- **Path A — Hypergrowth Without Foundation**
  Decisions about growth speed vs compliance and sustainability
  Key lesson: Growing 10x year over year means nothing if the foundation is broken
- **Path B — Unit Economics**
  Decisions about CAC, LTV, and sustainable customer acquisition
  Key lesson: Acquiring customers cheaper than cost by cutting corners destroys everything
- **Real financials:** $0 to $500M valuation in 2 years, CEO fired, $7M regulatory fine
- **Real outcome:** Parker Conrad fired 2016, company restructured, fraction of peak value

## Architecture
```
startup-autopsy/
├── CLAUDE.md
├── README.md
├── backend/
│   ├── main.py                        # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env
│   ├── engine/
│   │   ├── game_engine.py             # Core simulation engine
│   │   ├── consequence_engine.py      # Calculates financial consequences
│   │   └── explanation_engine.py      # AI plain English explanations
│   ├── models/                        # API response models
│   ├── scenarios/
│   │   ├── quibi_burn_rate.json
│   │   ├── quibi_market_timing.json
│   │   ├── juicero_unit_economics.json
│   │   ├── juicero_market_validation.json
│   │   ├── wework_valuation.json
│   │   ├── wework_fundraising.json
│   │   ├── zenefits_hypergrowth.json
│   │   └── zenefits_unit_economics.json
│   └── utils/
│       ├── scenario_loader.py         # Loads and validates scenario JSON
│       └── financial_calculator.py    # Burn rate, runway, score calculations
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Home — concept/company selector
│   │   └── play/
│   │       └── [scenarioId]/
│   │           └── page.tsx           # Game screen
│   ├── components/
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx          # Live financial metrics panel
│   │   ├── StoryPanel.tsx             # Scenario narrative + decisions
│   │   ├── DecisionCard.tsx           # Individual decision option
│   │   ├── ConsequenceAlert.tsx       # Full screen consequence moment
│   │   ├── TermTooltip.tsx            # Plain English term explanations
│   │   └── ProgressBar.tsx            # Decision progress indicator
│   ├── Charts/
│   │   ├── RunwayChart.tsx            # Cash over time line chart
│   │   ├── HealthRadar.tsx            # Financial health radar chart
│   │   └── VsRealChart.tsx            # Your path vs real company
│   └── EndScreen/
│       ├── AutopsyReport.tsx          # Final autopsy report card
│       ├── ConceptSummary.tsx         # What you learned
│       └── ShareCard.tsx              # Shareable score card
│   ├── lib/
│   │   └── state-management/
│   └── data/
│       └── companies.ts               # Company metadata for home screen
└── .claude/
    ├── settings.json                  # Hooks
    ├── agents/
    │   ├── researcher.md              # Research real financial data (Haiku)
    │   ├── scenario-builder.md        # Build scenario JSON files (Sonnet)
    │   └── frontend.md               # Build UI components (Sonnet)
    ├── skills/
    │   ├── code-review/SKILL.md
    │   ├── scenario-review/SKILL.md
    │   ├── balance-check/SKILL.md
    │   └── submission-check/SKILL.md
    └── plugins/
        └── startup-autopsy-plugin/
            └── manifest.json
```

## Scenario JSON Structure
Every scenario file follows this exact format:
```json
{
  "id": "quibi_burn_rate",
  "company": "Quibi",
  "concept": "Burn Rate & Runway",
  "concept_description": "How fast are you spending money and when will you run out?",
  "concept_analogy": "Think of your cash as a bucket with a hole in it. The bigger the hole, the faster it empties. Runway is how long until the bucket is empty.",
  "industry": "Media/Entertainment",
  "emoji": "📺",
  "tagline": "Burned $1.75B in 6 months",
  "difficulty": "beginner",
  "opening_story": "It's January 2020. You just raised $1.75 billion from Hollywood legends and top investors. Everyone believes in you. Your app launches in 3 months. What could go wrong?",
  "initial_financials": {
    "cash": 1750000000,
    "monthly_burn": 150000000,
    "monthly_revenue": 0,
    "subscribers": 0,
    "runway_months": 11,
    "health_score": 72,
    "health_breakdown": {
      "burn_rate_health": 60,
      "revenue_growth": 20,
      "unit_economics": 50,
      "cash_flow": 65,
      "investor_confidence": 85
    }
  },
  "decisions": [
    {
      "id": "d1",
      "decision_number": 1,
      "situation": "Your CMO just walked into your office with a marketing plan...",
      "context": "You need subscribers fast. But marketing costs money — money you need to last.",
      "concept_being_taught": "burn_rate",
      "hover_preview": true,
      "options": [
        {
          "id": "a",
          "text": "Approve the full $300M marketing budget",
          "short_label": "Go big",
          "outcome_label": "RISKY",
          "consequence_story": "You went all in. Billboards everywhere. Super Bowl ads. The whole world knows about Quibi. But at what cost?",
          "plain_english_explanation": "You spent $300M to get 500,000 subscribers. That means you paid $600 for each subscriber. But each subscriber only pays $5/month. It would take 10 years to make that money back — and you only have 11 months of cash left.",
          "concept_explained": "This is called Customer Acquisition Cost (CAC). You spent $600 to get a customer worth $5/month. That math never works.",
          "financial_impact": {
            "cash_change": -300000000,
            "monthly_burn_change": 0,
            "monthly_revenue_change": 2500000,
            "subscriber_change": 500000,
            "health_score_change": -12,
            "runway_change": -2
          },
          "is_what_real_company_did": true,
          "real_company_note": "Quibi spent $63M on marketing in Q1 2020 alone"
        },
        {
          "id": "b",
          "text": "Approve $100M — enough to launch but preserve cash",
          "short_label": "Be smart",
          "outcome_label": "SMART",
          "consequence_story": "Conservative but wise. You get the word out without lighting money on fire.",
          "plain_english_explanation": "You spent $100M to get 200,000 subscribers. That's $500 per subscriber — still expensive, but you saved $200M in cash. That's 1 extra month of runway.",
          "concept_explained": "Preserving cash extends your runway — the time you have to figure things out before you run out of money.",
          "financial_impact": {
            "cash_change": -100000000,
            "monthly_burn_change": 0,
            "monthly_revenue_change": 1000000,
            "subscriber_change": 200000,
            "health_score_change": -3,
            "runway_change": 1
          },
          "is_what_real_company_did": false,
          "real_company_note": "The real Quibi chose the aggressive path instead"
        },
        {
          "id": "c",
          "text": "Spend only $30M — organic growth first",
          "short_label": "Stay lean",
          "outcome_label": "CONSERVATIVE",
          "consequence_story": "You barely made a ripple. Nobody knows Quibi exists.",
          "plain_english_explanation": "You saved cash but nobody downloaded the app. Revenue is almost zero. Investors are asking questions. Sometimes being too conservative is just as dangerous as being too aggressive.",
          "concept_explained": "Runway means nothing if you never build the business. You need to spend enough to grow — the trick is finding the right balance.",
          "financial_impact": {
            "cash_change": -30000000,
            "monthly_burn_change": 0,
            "monthly_revenue_change": 200000,
            "subscriber_change": 40000,
            "health_score_change": -8,
            "runway_change": 2
          },
          "is_what_real_company_did": false,
          "real_company_note": null
        },
        {
          "id": "d",
          "text": "Delay launch 6 months and rethink everything",
          "short_label": "Hit pause",
          "outcome_label": "BOLD",
          "consequence_story": "You pump the brakes. Investors are confused. Your team is frustrated. But you have time to think.",
          "plain_english_explanation": "You saved $150M by delaying — but you're still burning money every month with no revenue. Delay only works if you use the time to fix something real.",
          "concept_explained": "Burn rate doesn't stop when you pause. You still pay salaries, rent, and servers every month whether you're launching or not.",
          "financial_impact": {
            "cash_change": -150000000,
            "monthly_burn_change": -10000000,
            "monthly_revenue_change": 0,
            "subscriber_change": 0,
            "health_score_change": -5,
            "runway_change": 0
          },
          "is_what_real_company_did": false,
          "real_company_note": null
        }
      ],
      "real_company_choice": "a",
      "learning_moment": "Burn rate is how fast your money disappears every month. The lower your burn rate relative to your cash, the longer your runway — the time you have to build something that works."
    }
  ],
  "endings": {
    "bankrupt": {
      "trigger_condition": "cash <= 0",
      "story": "You've run out of money. Employees are let go. The servers go dark. Quibi is dead.",
      "epitaph": "Quibi burned through $1.75 billion in 6 months. You followed the same path.",
      "lesson": "Burn rate killed Quibi before the product ever had a chance to find its audience."
    },
    "saved": {
      "trigger_condition": "health_score >= 60 AND runway_months >= 3 after decision 8",
      "story": "Against all odds, you made the decisions the real Quibi team couldn't. The company survives.",
      "lesson": "You extended runway, controlled burn rate, and gave the product time to find its market."
    },
    "struggling": {
      "trigger_condition": "alive but health_score < 60",
      "story": "You survived — barely. The company is on life support but still breathing.",
      "lesson": "You made some smart calls but the financial foundation was still shaky."
    }
  },
  "real_outcome": "Quibi shut down in October 2020, just 6 months after launch. It returned approximately $350M to investors — burning through $1.4B in the process.",
  "concepts_taught": ["burn_rate", "runway", "customer_acquisition_cost", "cash_management"],
  "what_you_learned_summary": "You learned that burn rate is the single most important number for an early stage startup. More money raised doesn't mean more time — it just means more to lose."
}
```

## Financial Term Glossary
Every term must be explained the moment it first appears on screen.
Plain English definitions (if a 16 year old can't understand it, rewrite it):

- **Burn Rate** — How much money you spend every month. Like a hole in a bucket.
- **Runway** — How many months until you run out of money. Time left on the clock.
- **Revenue** — Money coming IN from customers paying you.
- **Profit** — Revenue MINUS all your costs. What you actually keep.
- **Unit Economics** — Do you make or lose money on each individual customer?
- **CAC (Customer Acquisition Cost)** — How much you spend to get one customer.
- **LTV (Lifetime Value)** — How much a customer pays you over their entire time with you.
- **Valuation** — What investors think your whole company is worth.
- **IPO** — When a company sells shares to the public for the first time.
- **Equity** — Ownership percentage of the company.
- **Dilution** — When you raise money and your ownership percentage shrinks.

## Game Engine Logic

### Financial State (calculated after every decision)
- **Runway** = cash / monthly_burn (months remaining)
- **Burn** = monthly_expenses - monthly_revenue
- **Health Score** = weighted average (0-100):
  - Burn Rate Health 25% — lower burn relative to cash = better
  - Revenue Growth 25% — month over month revenue growth
  - Unit Economics 20% — revenue per customer vs cost per customer
  - Cash Flow 20% — monthly cash change direction
  - Investor Confidence 10% — based on quality of decisions made
- **Game Over** = cash <= 0 OR health_score <= 10
- **Saved** = complete all 8 decisions with health_score >= 60 AND runway >= 3

### Score Calculation (end of game)
- Base score: health_score × 10 (max 1000)
- Bonus: +50 for each decision that matched the "smart" choice
- Bonus: +100 for saving the company
- Penalty: -30 for each decision that matched what the real (failing) company did
- Concept mastery: tracked separately per concept

### Difficulty Levels
- **Beginner** — Quibi, Juicero (obvious consequences, clear right/wrong answers)
- **Intermediate** — WeWork (tradeoffs are harder, no clear right answer)
- **Expert** — Zenefits (consequences are delayed, harder to see cause and effect)

## API Routes
```
GET  /api/scenarios                           # List all scenarios with metadata
GET  /api/scenario/{id}                       # Get full scenario JSON
POST /api/decision                            # Submit decision, get consequence + new state
GET  /api/explanation/{scenario}/{decision}/{option}  # Get AI explanation (Nova Lite)
POST /api/score                               # Calculate final score
GET  /health                                  # Health check
```

## Tech Stack
### Backend
- **FastAPI** — REST API
- **Amazon Nova Lite via Bedrock** — AI plain English explanations
- **Pydantic** — data validation and schema enforcement
- **Python 3.13**

### Frontend
- **Next.js 14** App Router
- **TypeScript** strict mode
- **Tailwind CSS** — dark theme, professional aesthetic
- **Framer Motion** — smooth animations for dashboard number changes
- **Recharts** — runway chart, health radar, vs real company chart

## Design System
- **Background:** #0a0a0a (near black)
- **Cards:** #111111
- **Borders:** #222222
- **Primary accent:** #ef4444 (red — danger, bankruptcy)
- **Success accent:** #22c55e (green — smart decisions)
- **Warning accent:** #f59e0b (amber — risky decisions)
- **Text primary:** #ffffff
- **Text secondary:** #888888
- **Font:** Inter
- **Vibe:** Bloomberg Terminal meets a video game

## Commands
### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
### Backend (.env)
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
```

## Code Style
- Python: PEP 8, type hints everywhere, docstrings on all functions
- TypeScript: strict mode, no any types, interfaces over types
- All financial calculations in financial_calculator.py only — never inline
- All AI calls in explanation_engine.py only — never inline
- Keep components small and single purpose
- Animate every number change on the dashboard — numbers should never just jump
- Every financial term highlighted in orange on first appearance — clicking opens TermTooltip

## Claude Code Setup
### Skills to implement:
1. /code-review — Python + TypeScript quality check
2. /scenario-review — validates scenario JSON completeness, decision quality, financial accuracy
3. /balance-check — checks if scenario is too easy or too hard, verifies learning outcomes
4. /submission-check — checks entire project against Hackonomics judging criteria

### Sub Agents to implement:
1. researcher.md (Haiku) — researches real financial data for each company
2. scenario-builder.md (Sonnet) — writes scenario JSON files from research
3. frontend.md (Sonnet) — builds Next.js components

### Hooks:
1. PreToolUse on Write to .json in scenarios/ — warn before modifying scenario files
2. PostToolUse on Write to .py — run py_compile syntax check
3. PostToolUse on Write to .ts/.tsx — run tsc --noEmit type check

### MCP:
- GitHub MCP for auto-commits after major milestones

## Important Notes
- NEVER use financial jargon without immediately explaining it in plain English
- ALWAYS show the "real company choice" after player decides — comparison is the learning moment
- Dashboard numbers MUST animate smoothly — jarring jumps kill immersion
- The consequence story must be dramatic and emotional — this is storytelling not accounting
- Every ending must feel earned — bankruptcy should feel like failure, saving should feel like triumph
- The demo video must show one complete scenario from start to finish
- Judges will play Quibi Burn Rate first — it must be perfect
