# StartupAutopsy 💀

**Learn financial literacy by destroying real companies.**

An interactive simulation game where you become the CEO of real failed startups, make the same financial decisions the founders faced, and watch the consequences play out on a live dashboard. Built for Hackonomics 2026.

## The Pitch

Every startup that failed had the warning signs early. Nobody understood them. StartupAutopsy teaches you to recognize those signs before it's too late — by putting you in the CEO chair of companies that didn't make it.

## How It Works

1. **Pick a Startup** — Choose from 4 real companies that failed spectacularly
2. **Make 8 Decisions** — Face the same choices the real founders faced, with real financial data
3. **Save or Bankrupt** — Watch your dashboard update live. Can you avoid the mistakes that killed the real company?

## Companies

| Company | Raised | What Happened | Concepts |
|---------|--------|---------------|----------|
| 📺 Quibi | $1.75B | Dead in 6 months | Burn Rate, Runway, CAC |
| 🥤 Juicero | $120M | Squeezed by hand | Unit Economics, Market Validation |
| 🏠 WeWork | $12B | IPO collapse | Valuation, Fundraising |
| 💻 Zenefits | $584M | CEO fired, $7M fine | Hypergrowth, Unit Economics |

## Features

- **Live Financial Dashboard** — Cash, burn rate, runway, and health score update in real time
- **AI Tutor** — Ask questions mid-game powered by Amazon Nova Lite via Bedrock
- **Concept Intro** — Visual flowcharts explain each financial concept before you play
- **Personalized AI Autopsy Report** — AI-generated CEO performance review at game end
- **Dynamic Hints** — AI advisor appears when you're struggling
- **Save & Resume** — Exit mid-game and pick up where you left off

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python 3.13, FastAPI, Pydantic v2 |
| AI | Amazon Nova Lite via AWS Bedrock |
| Deployment | Vercel (frontend), Railway (backend) |

## Getting Started

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

### Environment Variables

Create `backend/.env`:

```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
```

The AI features (tutor, hints, autopsy report) gracefully fall back to static content if Bedrock is unavailable.

## API Routes

```
GET  /api/scenarios                    — List all scenarios
GET  /api/scenario/{id}                — Get full scenario
GET  /api/scenario/{id}/initial-state  — Get starting game state
POST /api/decision                     — Submit decision, get consequence
GET  /api/explanation/{s}/{d}/{o}      — AI explanation
POST /api/score                        — Calculate final score
POST /api/ai/autopsy-report            — AI CEO performance review
POST /api/ai/hint                      — Dynamic difficulty hint
POST /api/ai/followup                  — Conversational follow-up
GET  /health                           — Health check
```

## IE / Operations Research Connection

- **Simulation Modeling** — Financial state machine with real data
- **Decision Analysis** — 8 decision nodes with probabilistic outcomes per scenario
- **Systems Thinking** — Startup finances modeled as interconnected systems
- **Statistical Pattern Recognition** — Real failure patterns across startups

## Team

Built for Hackonomics 2026 — Financial literacy and economics for the community.
