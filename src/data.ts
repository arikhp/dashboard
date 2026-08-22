export type Period = "ytd" | "q2" | "july";

export type PlRow = {
  line: string;
  actual: number;
  budget: number;
  forecast: number;
  isPercent?: boolean;
  expense?: boolean;
};

export type PeriodPack = {
  label: string;
  range: string;
  revenue: number;
  revenueBudget: number;
  grossMargin: number;
  grossMarginBudget: number;
  ebitda: number;
  ebitdaBudget: number;
  cash: number;
  arr: number;
  nrr: number;
  headline: string;
  detail: string;
  pl: PlRow[];
  bridge: { categories: string[]; values: number[] };
  months: string[];
  actualRev: number[];
  budgetRev: number[];
  forecastRev: number[];
};

export const PACKS: Record<Period, PeriodPack> = {
  ytd: {
    label: "YTD",
    range: "Jan–Jul 2026",
    revenue: 26.42,
    revenueBudget: 25.1,
    grossMargin: 79.4,
    grossMarginBudget: 78.0,
    ebitda: 4.07,
    ebitdaBudget: 2.28,
    cash: 18.4,
    arr: 48.2,
    nrr: 118,
    headline: "EBITDA is $1.79M ahead of plan",
    detail:
      "The beat is two-thirds revenue (Enterprise overperformance) and one-third opex under-run from delayed engineering and G&A hiring. S&M is the only function over plan after Q2 conference spend.",
    pl: [
      { line: "Revenue", actual: 26.42, budget: 25.1, forecast: 26.2 },
      { line: "COGS", actual: 5.44, budget: 5.52, forecast: 5.5, expense: true },
      { line: "Gross profit", actual: 20.98, budget: 19.58, forecast: 20.7 },
      { line: "Gross margin", actual: 79.4, budget: 78.0, forecast: 79.0, isPercent: true },
      { line: "Sales & marketing", actual: 8.92, budget: 8.65, forecast: 8.85, expense: true },
      { line: "R&D", actual: 5.61, budget: 6.1, forecast: 5.8, expense: true },
      { line: "G&A", actual: 2.38, budget: 2.55, forecast: 2.42, expense: true },
      { line: "Total opex", actual: 16.91, budget: 17.3, forecast: 17.07, expense: true },
      { line: "EBITDA", actual: 4.07, budget: 2.28, forecast: 3.63 },
      { line: "EBITDA margin", actual: 15.4, budget: 9.1, forecast: 13.9, isPercent: true },
    ],
    bridge: {
      categories: ["Budget EBITDA", "Revenue", "COGS / mix", "S&M", "R&D", "G&A", "Actual EBITDA"],
      values: [2.28, 1.32, 0.08, -0.27, 0.49, 0.17, 4.07],
    },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    actualRev: [3.35, 3.48, 3.62, 3.76, 3.92, 4.08, 4.21],
    budgetRev: [3.3, 3.38, 3.48, 3.55, 3.65, 3.78, 3.96],
    forecastRev: [3.35, 3.48, 3.62, 3.76, 3.9, 4.04, 4.15],
  },
  q2: {
    label: "Q2",
    range: "Apr–Jun 2026",
    revenue: 11.76,
    revenueBudget: 10.98,
    grossMargin: 79.8,
    grossMarginBudget: 78.0,
    ebitda: 1.87,
    ebitdaBudget: 1.12,
    cash: 17.6,
    arr: 46.9,
    nrr: 117,
    headline: "Q2 closed $0.75M above EBITDA plan",
    detail:
      "Enterprise expansions in May and June added $0.78M of revenue versus budget. Conference and partner-event spend pushed S&M $0.40M over plan, but R&D hiring slipped a quarter and more than offset it.",
    pl: [
      { line: "Revenue", actual: 11.76, budget: 10.98, forecast: 11.6 },
      { line: "COGS", actual: 2.38, budget: 2.42, forecast: 2.4, expense: true },
      { line: "Gross profit", actual: 9.38, budget: 8.56, forecast: 9.2 },
      { line: "Gross margin", actual: 79.8, budget: 78.0, forecast: 79.3, isPercent: true },
      { line: "Sales & marketing", actual: 4.12, budget: 3.72, forecast: 4.0, expense: true },
      { line: "R&D", actual: 2.38, budget: 2.62, forecast: 2.5, expense: true },
      { line: "G&A", actual: 1.01, budget: 1.1, forecast: 1.04, expense: true },
      { line: "Total opex", actual: 7.51, budget: 7.44, forecast: 7.54, expense: true },
      { line: "EBITDA", actual: 1.87, budget: 1.12, forecast: 1.66 },
      { line: "EBITDA margin", actual: 15.9, budget: 10.2, forecast: 14.3, isPercent: true },
    ],
    bridge: {
      categories: ["Budget EBITDA", "Revenue", "COGS / mix", "S&M", "R&D", "G&A", "Actual EBITDA"],
      values: [1.12, 0.78, 0.04, -0.4, 0.24, 0.09, 1.87],
    },
    months: ["Apr", "May", "Jun"],
    actualRev: [3.76, 3.92, 4.08],
    budgetRev: [3.55, 3.65, 3.78],
    forecastRev: [3.76, 3.9, 4.04],
  },
  july: {
    label: "July",
    range: "Jul 2026 flash",
    revenue: 4.21,
    revenueBudget: 3.96,
    grossMargin: 80.0,
    grossMarginBudget: 78.0,
    ebitda: 0.92,
    ebitdaBudget: 0.62,
    cash: 18.4,
    arr: 48.2,
    nrr: 118,
    headline: "July flash is $0.30M ahead of EBITDA plan",
    detail:
      "A $250k Enterprise expansion closed in the last week of July. Gross margin held at 80% on a richer mix. Hiring remains six heads behind plan, so opex is still light entering August.",
    pl: [
      { line: "Revenue", actual: 4.21, budget: 3.96, forecast: 4.15 },
      { line: "COGS", actual: 0.84, budget: 0.87, forecast: 0.85, expense: true },
      { line: "Gross profit", actual: 3.37, budget: 3.09, forecast: 3.3 },
      { line: "Gross margin", actual: 80.0, budget: 78.0, forecast: 79.5, isPercent: true },
      { line: "Sales & marketing", actual: 1.31, budget: 1.24, forecast: 1.28, expense: true },
      { line: "R&D", actual: 0.8, budget: 0.87, forecast: 0.83, expense: true },
      { line: "G&A", actual: 0.34, budget: 0.36, forecast: 0.35, expense: true },
      { line: "Total opex", actual: 2.45, budget: 2.47, forecast: 2.46, expense: true },
      { line: "EBITDA", actual: 0.92, budget: 0.62, forecast: 0.84 },
      { line: "EBITDA margin", actual: 21.9, budget: 15.7, forecast: 20.2, isPercent: true },
    ],
    bridge: {
      categories: ["Budget EBITDA", "Revenue", "COGS / mix", "S&M", "R&D", "G&A", "Actual EBITDA"],
      values: [0.62, 0.25, 0.03, -0.07, 0.07, 0.02, 0.92],
    },
    months: ["Apr", "May", "Jun", "Jul"],
    actualRev: [3.76, 3.92, 4.08, 4.21],
    budgetRev: [3.55, 3.65, 3.78, 3.96],
    forecastRev: [3.76, 3.9, 4.04, 4.15],
  },
};

export const FY_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const FY_BUDGET = [3.3, 3.38, 3.48, 3.55, 3.65, 3.78, 3.96, 4.05, 4.18, 4.32, 4.48, 4.72];
export const FY_FORECAST = [3.35, 3.48, 3.62, 3.76, 3.92, 4.08, 4.21, 4.32, 4.45, 4.58, 4.72, 4.95];

export const SEGMENTS = [
  { name: "Enterprise", actual: 14.85, budget: 13.2, share: 56 },
  { name: "Mid-market", actual: 7.92, budget: 7.5, share: 30 },
  { name: "SMB", actual: 3.65, budget: 4.4, share: 14 },
];

export const HEADCOUNT = [
  { team: "Engineering", actual: 78, plan: 84, note: "Six open IC seats. Slippage is the main opex under-run." },
  { team: "Product", actual: 14, plan: 16, note: "Two PM roles still open after a failed Q1 search." },
  { team: "Sales", actual: 52, plan: 51, note: "One extra EMEA AE hired in June after a large logo close." },
  { team: "Customer success", actual: 22, plan: 24, note: "Two CSMs delayed; NRR held up on Enterprise anyway." },
  { team: "Marketing", actual: 12, plan: 11, note: "Demand-gen contractor converted after the Q2 conference circuit." },
  { team: "G&A", actual: 8, plan: 6, note: "Controller plus a rev-ops analyst landed earlier than planned." },
];

export const MONTH_NOTES: Record<string, string> = {
  Jan: "Clean start to the year. New logo cohort landed on plan; no one-time items.",
  Feb: "Mid-market slightly ahead. Cloud unit cost began to ease versus budget.",
  Mar: "Enterprise pipeline converted earlier than modeled. First signal of the H1 beat.",
  Apr: "Q2 opened with two expansion quotes. S&M still on plan before events.",
  May: "Conference month. S&M ran hot; two Enterprise expansions closed.",
  Jun: "Partner-event spend finished. R&D hiring slipped again; margin expanded.",
  Jul: "Late-month $250k Enterprise expansion. Flash margin 80% on mix.",
};

export const SEGMENT_NOTES: Record<string, string> = {
  Enterprise:
    "Fourteen logos, $14.85M recognized. Two multi-year expansions in May–July more than cover the SMB miss.",
  "Mid-market":
    "Steady attach on the analytics add-on. Slightly ahead of plan; not the swing factor.",
  SMB:
    "Two product-led cohorts slipped into H2. Discounting will not close the $0.75M hole — swap in late-stage Enterprise.",
};

export const BRIDGE_NOTES: Record<string, string> = {
  "Budget EBITDA": "Starting point of the walk. Everything else is a variance versus this number.",
  Revenue: "Volume and price. Almost entirely Enterprise expansions, not list-price changes.",
  "COGS / mix": "Cloud unit cost plus a richer Enterprise mix. Small, but it is structural.",
  "S&M": "Q2 conference and partner-event over-run. The only function that hurt EBITDA.",
  "R&D": "Vacant engineering seats. This is timing, not a productivity gain — plan to spend it in H2.",
  "G&A": "Controller hire slipped six weeks. Immaterial and already catching up.",
  "Actual EBITDA": "Landing point after all variances. Do not guide this run-rate into H2 without hiring.",
};

export const PL_NOTES: Record<string, string> = {
  Revenue: "Beat is mix, not volume of logos. Enterprise share is now 56%.",
  COGS: "Favorable on cloud committed-use discounts signed in March.",
  "Gross profit": "Dollar beat is revenue plus a little COGS. Quality of earnings is high.",
  "Gross margin": "140 bps of expansion. Hold this if Enterprise mix stays above 54%.",
  "Sales & marketing": "Over plan on events. Cap Q3 at $4.0M or the opex cushion disappears.",
  "R&D": "Under plan on vacant seats. This is deferred spend, not savings.",
  "G&A": "Small under-run. Already reversing in August.",
  "Total opex": "Net $0.39M under plan. Do not treat it as structural.",
  EBITDA: "The headline beat. Two-thirds revenue, one-third delayed hiring.",
  "EBITDA margin": "630 bps above plan YTD. H2 hiring will compress this toward 13–14%.",
};

export const OPEX_NOTES: Record<string, string> = {
  "S&M": "Actual $8.92M vs $8.65M budget. Events used the annual contingency in Q2.",
  "R&D": "Actual $5.61M vs $6.10M budget. Six engineering seats still open.",
  "G&A": "Actual $2.38M vs $2.55M budget. Catch-up hire already in flight.",
};

export const RECS = [
  {
    id: "guide",
    title: "Hold the $8.4M FY EBITDA guide",
    body: "The YTD beat funds slipped H2 engineering hires without cutting the raise.",
    jumpsTo: "headcount",
  },
  {
    id: "smb",
    title: "Rebuild the SMB second-half plan",
    body: "Run-rate finishes $1.1M below the $8.2M annual target. Backfill with two late-stage Enterprise deals.",
    jumpsTo: "segments",
  },
  {
    id: "sm",
    title: "Cap Q3 S&M at $4.0M",
    body: "Q2 event spend already used the annual contingency. Further over-run erases the hiring cushion.",
    jumpsTo: "opex",
  },
];

export function money(n: number, digits = 2): string {
  const abs = Math.abs(n).toFixed(digits);
  return n < 0 ? `-$${abs}M` : `$${abs}M`;
}

export function signedMoney(n: number): string {
  const abs = Math.abs(n).toFixed(2);
  if (n > 0) return `+$${abs}M`;
  if (n < 0) return `-$${abs}M`;
  return "$0.00M";
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function signedPct(n: number): string {
  const value = `${Math.abs(n).toFixed(1)}%`;
  if (n > 0) return `+${value}`;
  if (n < 0) return `-${value}`;
  return "0.0%";
}

export function variance(actual: number, budget: number, expense = false): number {
  return expense ? budget - actual : actual - budget;
}

export function variancePct(actual: number, budget: number, expense = false): number {
  if (budget === 0) return 0;
  return (variance(actual, budget, expense) / Math.abs(budget)) * 100;
}
