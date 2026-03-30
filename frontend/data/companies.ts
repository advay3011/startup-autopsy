export interface CompanyScenario {
  id: string;
  company: string;
  concept: string;
  conceptDescription: string;
  industry: string;
  emoji: string;
  tagline: string;
  difficulty: "beginner" | "intermediate" | "expert";
  difficultyColor: string;
  realOutcome: string;
}

export interface CompanyGroup {
  company: string;
  emoji: string;
  industry: string;
  description: string;
  scenarios: CompanyScenario[];
}

export const companies: CompanyGroup[] = [
  {
    company: "Quibi",
    emoji: "📺",
    industry: "Media / Entertainment",
    description:
      "Raised $1.75B from Hollywood legends. Dead in 6 months. Here's what went wrong.",
    scenarios: [
      {
        id: "quibi_burn_rate",
        company: "Quibi",
        concept: "Burn Rate & Runway",
        conceptDescription: "How fast are you spending money and when will you run out?",
        industry: "Media / Entertainment",
        emoji: "📺",
        tagline: "Burned $1.75B in 6 months",
        difficulty: "beginner",
        difficultyColor: "#1D71BA",
        realOutcome: "Shut down October 2020, returned ~$350M to investors",
      },
      {
        id: "quibi_market_timing",
        company: "Quibi",
        concept: "Market Timing",
        conceptDescription: "Launching the right product at the wrong time is just as fatal as a bad product",
        industry: "Media / Entertainment",
        emoji: "📺",
        tagline: "COVID killed the commute",
        difficulty: "beginner",
        difficultyColor: "#1D71BA",
        realOutcome: "Launched April 2020 into COVID lockdowns — the commuter app had no commuters",
      },
    ],
  },
  {
    company: "Juicero",
    emoji: "🥤",
    industry: "Hardware / Consumer",
    description:
      "Raised $120M to make a $400 juice machine. Bloomberg squeezed the bag by hand.",
    scenarios: [
      {
        id: "juicero_unit_economics",
        company: "Juicero",
        concept: "Unit Economics",
        conceptDescription: "Do you make or lose money on each individual sale?",
        industry: "Hardware / Consumer",
        emoji: "🥤",
        tagline: "$400 machine, $30 juice packets",
        difficulty: "beginner",
        difficultyColor: "#1D71BA",
        realOutcome: "Bloomberg showed packets squeezable by hand. Shut down September 2017.",
      },
      {
        id: "juicero_market_validation",
        company: "Juicero",
        concept: "Market Validation",
        conceptDescription: "Does your product solve a problem anyone actually has?",
        industry: "Hardware / Consumer",
        emoji: "🥤",
        tagline: "The $120M answer to a non-problem",
        difficulty: "beginner",
        difficultyColor: "#1D71BA",
        realOutcome: "Product proved unnecessary before mass market launch",
      },
    ],
  },
  {
    company: "WeWork",
    emoji: "🏠",
    industry: "Real Estate / Tech",
    description:
      "$47B valuation. $1.37B annual losses. Adam Neumann fired. The greatest IPO collapse in history.",
    scenarios: [
      {
        id: "wework_valuation",
        company: "WeWork",
        concept: "Valuation & Overspending",
        conceptDescription: "A $47B valuation means nothing if you lose $1.37B every year",
        industry: "Real Estate / Tech",
        emoji: "🏠",
        tagline: "$47B → $2.9B in 60 days",
        difficulty: "intermediate",
        difficultyColor: "#1D71BA",
        realOutcome: "IPO filed at $47B. Withdrawn. Neumann fired. SoftBank bailout at $8B.",
      },
      {
        id: "wework_fundraising",
        company: "WeWork",
        concept: "Fundraising Gone Wrong",
        conceptDescription: "Taking too much money at too high a valuation creates impossible expectations",
        industry: "Real Estate / Tech",
        emoji: "🏠",
        tagline: "$12B raised, nothing to show for it",
        difficulty: "intermediate",
        difficultyColor: "#1D71BA",
        realOutcome: "Governance disaster. SoftBank invested $10.65B and almost lost it all.",
      },
    ],
  },
  {
    company: "Zenefits",
    emoji: "💻",
    industry: "B2B SaaS",
    description:
      "$0 to $4.5B valuation in 2 years. CEO fired. $7M regulatory fine. 17% workforce cut.",
    scenarios: [
      {
        id: "zenefits_hypergrowth",
        company: "Zenefits",
        concept: "Hypergrowth Without Foundation",
        conceptDescription: "Growing 10x year over year means nothing if the foundation is broken",
        industry: "B2B SaaS",
        emoji: "💻",
        tagline: "Licensed to fail",
        difficulty: "expert",
        difficultyColor: "#B25690",
        realOutcome: "Parker Conrad fired 2016. $7M fine for selling insurance without licenses.",
      },
      {
        id: "zenefits_unit_economics",
        company: "Zenefits",
        concept: "Unit Economics",
        conceptDescription: "Acquiring customers by cutting corners destroys everything",
        industry: "B2B SaaS",
        emoji: "💻",
        tagline: "500 salespeople, no sustainable model",
        difficulty: "expert",
        difficultyColor: "#B25690",
        realOutcome: "Company restructured, valuation fell from $4.5B to $2B",
      },
    ],
  },
];

export const glossary: Record<string, string> = {
  "burn rate": "How much money you spend every month. Like a hole in a bucket — the bigger the hole, the faster it empties.",
  runway: "How many months until you run out of money. Time left on the clock.",
  revenue: "Money coming IN from customers paying you. Not to be confused with profit.",
  profit: "Revenue MINUS all your costs. What you actually keep after paying everyone.",
  "unit economics": "Do you make or lose money on each individual customer? If you lose money per customer, more customers = more losses.",
  cac: "Customer Acquisition Cost — how much you spend to get one new customer. If this is higher than what the customer pays you, you're losing money.",
  "customer acquisition cost": "How much you spend to get one new customer. If this is higher than what the customer pays you, you're losing money.",
  ltv: "Lifetime Value — total money a customer pays you over their entire time with you. LTV must be higher than CAC to survive.",
  valuation: "What investors think your whole company is worth. Based on future potential, not current profits.",
  ipo: "Initial Public Offering — when a company sells shares to the public for the first time. Turns private investors into cash.",
  equity: "Ownership percentage of the company. Founders start at 100% and give pieces away when raising money.",
  dilution: "When you raise money by selling new shares, your ownership percentage shrinks. More investors = less of the pie for you.",
  "net burn": "Your gross monthly expenses MINUS monthly revenue. What you actually lose per month after accounting for what comes in.",
  "gross margin": "Revenue minus direct costs of delivering the product. Shows if your core business model works.",
  "churn rate": "The percentage of customers who stop paying you each month. High churn means your bucket has holes — new customers pour in but old ones leak out.",
  "fixed costs": "Expenses that stay the same no matter how many customers you have — rent, salaries, servers. They burn cash even when revenue is zero.",
  "cash management": "The art of making your money last. Knowing when to spend, when to save, and how to stretch every dollar until revenue catches up.",
  "market timing": "Launching the right product at the wrong time. Even great ideas fail if the world isn't ready — or if something unexpected changes the market.",
  "market validation": "Proving that real people will actually pay for your product before you spend millions building it.",
  "hypergrowth": "Growing extremely fast — 10x or more per year. Sounds great, but it breaks things if your foundation can't handle the speed.",
  fundraising: "Raising money from investors by selling ownership in your company. More money means more runway, but also more pressure and less control.",
};
