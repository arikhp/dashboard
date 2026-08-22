import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Logo, Wordmark } from "./Logo";
import {
  BRIDGE_NOTES,
  FY_BUDGET,
  FY_FORECAST,
  FY_MONTHS,
  HEADCOUNT,
  MONTH_NOTES,
  OPEX_NOTES,
  PACKS,
  PL_NOTES,
  RECS,
  SEGMENT_NOTES,
  SEGMENTS,
  money,
  pct,
  signedMoney,
  signedPct,
  variance,
  variancePct,
  type Period,
  type PlRow,
} from "./data";
import "./App.css";

const PERIODS: { id: Period; label: string }[] = [
  { id: "ytd", label: "YTD" },
  { id: "q2", label: "Q2 close" },
  { id: "july", label: "July flash" },
];

const PIE_COLORS = ["#c9a36a", "#7ea4c8", "#6fba8a"];

type SeriesKey = "Actual" | "Budget" | "Forecast";

type Focus =
  | { kind: "none" }
  | { kind: "kpi"; id: "revenue" | "margin" | "ebitda" | "cash" }
  | { kind: "month"; month: string }
  | { kind: "segment"; name: string }
  | { kind: "bridge"; name: string }
  | { kind: "pl"; line: string }
  | { kind: "opex"; name: string }
  | { kind: "headcount"; team: string }
  | { kind: "rec"; id: string };

function formatCell(row: PlRow, key: "actual" | "budget" | "forecast"): string {
  return row.isPercent ? pct(row[key]) : money(row[key]);
}

function toneClass(value: number, slack = 0.02): string {
  if (Math.abs(value) < slack) return "";
  return value > 0 ? "is-good" : "is-bad";
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((item) => (
        <div key={item.name} className="tooltip-row">
          <span style={{ color: item.color }}>{item.name}</span>
          <strong>{money(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function useCountUp(target: number, enabled: boolean, resetKey: string) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    const startAt = performance.now();
    const from = 0;
    const duration = 720;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, resetKey]);
  return value;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Intro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    setLeaving(true);
    window.setTimeout(onDone, 700);
  }, [onDone]);

  useEffect(() => {
    const hold = window.setTimeout(finish, 2200);
    return () => window.clearTimeout(hold);
  }, [finish]);

  return (
    <div className={leaving ? "intro is-out" : "intro"} onClick={finish} role="presentation">
      <div className="intro-inner">
        <Logo size={96} animate />
        <div className="intro-name">Aether</div>
        <div className="intro-unit">Systems</div>
        <div className="intro-tag">Financial planning & analysis</div>
        <button
          className="intro-skip"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            finish();
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [intro, setIntro] = useState(true);
  const [introKey, setIntroKey] = useState(0);
  const [period, setPeriod] = useState<Period>("ytd");
  const [compare, setCompare] = useState<Period | "off">("off");
  const [focus, setFocus] = useState<Focus>({ kind: "none" });
  const [series, setSeries] = useState<Record<SeriesKey, boolean>>({
    Actual: true,
    Budget: true,
    Forecast: true,
  });
  const [plMode, setPlMode] = useState<"dollars" | "variance">("dollars");
  const [vacantFilled, setVacantFilled] = useState(0);
  const [smCut, setSmCut] = useState(0);
  const [smbRecover, setSmbRecover] = useState(0);
  const [showScenario, setShowScenario] = useState(false);

  const pack = PACKS[period];
  const comparePack = compare === "off" || compare === period ? null : PACKS[compare];
  const ready = !intro;

  useEffect(() => {
    document.body.style.overflow = intro ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [intro]);

  const hireCost = vacantFilled * 0.11;
  const smClawback = 0.27 * (smCut / 100);
  const smbLift = smbRecover;
  const scenarioRevenue = pack.revenue + smbLift;
  const scenarioEbitda = pack.ebitda - hireCost + smClawback + smbLift * 0.794;
  const scenarioDirty = vacantFilled > 0 || smCut > 0 || smbRecover > 0;

  const displayRevenue = scenarioDirty ? scenarioRevenue : pack.revenue;
  const displayEbitda = scenarioDirty ? scenarioEbitda : pack.ebitda;
  const displayMargin =
    scenarioDirty
      ? ((pack.revenue * (pack.grossMargin / 100) + smbLift * 0.794) / displayRevenue) * 100
      : pack.grossMargin;

  const revVar = variancePct(displayRevenue, pack.revenueBudget);
  const ebitdaVar = displayEbitda - pack.ebitdaBudget;
  const gmVarBps = Math.round((displayMargin - pack.grossMarginBudget) * 100);

  const countedRevenue = useCountUp(displayRevenue, ready, `${period}-${displayRevenue.toFixed(2)}`);
  const countedEbitda = useCountUp(displayEbitda, ready, `${period}-${displayEbitda.toFixed(2)}`);
  const countedMargin = useCountUp(displayMargin, ready, `${period}-${displayMargin.toFixed(2)}`);
  const countedCash = useCountUp(pack.cash, ready, `${period}-${pack.cash}`);

  const revenueSeries = useMemo(
    () =>
      pack.months.map((month, i) => ({
        month,
        Actual: pack.actualRev[i],
        Budget: pack.budgetRev[i],
        Forecast: pack.forecastRev[i],
      })),
    [pack],
  );

  const bridgeSeries = useMemo(
    () =>
      pack.bridge.categories.map((name, i) => ({
        name,
        value: pack.bridge.values[i],
      })),
    [pack],
  );

  const opexSeries = [
    { name: "S&M", Actual: 8.92, Budget: 8.65 },
    { name: "R&D", Actual: 5.61, Budget: 6.1 },
    { name: "G&A", Actual: 2.38, Budget: 2.55 },
  ];

  const fySeries = FY_MONTHS.map((month, i) => ({
    month,
    Budget: FY_BUDGET[i],
    Forecast: FY_FORECAST[i],
  }));

  const opexUsed = 16.91;
  const opexBudget = 17.3;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocus({ kind: "none" });
      if (event.key === "1") setPeriod("ytd");
      if (event.key === "2") setPeriod("q2");
      if (event.key === "3") setPeriod("july");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const replayIntro = () => {
    setIntro(true);
    setIntroKey((key) => key + 1);
  };

  const toggleSeries = (key: SeriesKey) => {
    setSeries((current) => {
      const next = { ...current, [key]: !current[key] };
      if (!next.Actual && !next.Budget && !next.Forecast) return current;
      return next;
    });
  };

  const resetScenario = () => {
    setVacantFilled(0);
    setSmCut(0);
    setSmbRecover(0);
  };

  const inspector = renderInspector(focus, pack, {
    vacantFilled,
    smCut,
    smbRecover,
    scenarioRevenue,
    scenarioEbitda,
    scenarioDirty,
  });

  return (
    <>
      {intro ? <Intro key={introKey} onDone={() => setIntro(false)} /> : null}

      <div className={ready ? "shell is-in" : "shell"}>
        <header className="topbar">
          <button className="brand" type="button" onClick={replayIntro} title="Replay intro">
            <Logo size={28} />
            <Wordmark compact />
          </button>
          <div className="topbar-controls">
            {PERIODS.map((item) => (
              <button
                key={item.id}
                className={period === item.id ? "pill is-active" : "pill"}
                onClick={() => setPeriod(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
            <button
              className={showScenario ? "pill is-active" : "pill"}
              type="button"
              onClick={() => setShowScenario((open) => !open)}
            >
              What-if
            </button>
          </div>
        </header>

        <div className="workspace">
          <main className="page">
            <header className="hero">
              <div className="eyebrow">
                Mid-year board pack
                <span className="dot" />
                FY2026
              </div>
              <h1>Financial review</h1>
              <p className="lede">
                Actuals versus the FY2026 plan and the May reforecast. Click any
                KPI, chart, or row to inspect it. Keys 1 / 2 / 3 switch period.
                Escape clears the inspector.
              </p>
              <div className="period-row">
                <span className="compare-label">Compare against</span>
                <button
                  className={compare === "off" ? "pill is-active" : "pill"}
                  type="button"
                  onClick={() => setCompare("off")}
                >
                  Off
                </button>
                {PERIODS.filter((item) => item.id !== period).map((item) => (
                  <button
                    key={item.id}
                    className={compare === item.id ? "pill is-active" : "pill"}
                    type="button"
                    onClick={() => setCompare(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="source">
                Source: Aether Systems finance close · {pack.range} · USD millions ·
                unaudited management view
              </p>
            </header>

            {showScenario ? (
              <section className="panel scenario">
                <div className="panel-head">
                  <h2>What-if overlay</h2>
                  <p>Adjust H2 actions. KPIs update live. Tables stay on reported actuals.</p>
                </div>
                <div className="sliders">
                  <label>
                    <span>Fill vacant seats · {vacantFilled} of 6</span>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      step={1}
                      value={vacantFilled}
                      onChange={(event) => setVacantFilled(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>Claw back Q2 S&M overspend · {smCut}%</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={smCut}
                      onChange={(event) => setSmCut(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>Recover slipped SMB · {money(smbRecover)}</span>
                    <input
                      type="range"
                      min={0}
                      max={0.75}
                      step={0.05}
                      value={smbRecover}
                      onChange={(event) => setSmbRecover(Number(event.target.value))}
                    />
                  </label>
                </div>
                <div className="scenario-foot">
                  <span>
                    Scenario EBITDA {money(scenarioEbitda)} · {signedMoney(scenarioEbitda - pack.ebitda)} vs reported
                  </span>
                  <button className="pill" type="button" onClick={resetScenario}>
                    Reset
                  </button>
                </div>
              </section>
            ) : null}

            <section className="callout">
              <h2>{pack.headline}</h2>
              <p>{pack.detail}</p>
            </section>

            <section className="kpi-grid">
              <button
                className={focus.kind === "kpi" && focus.id === "revenue" ? "kpi is-selected" : "kpi"}
                type="button"
                onClick={() => {
                  setFocus({ kind: "kpi", id: "revenue" });
                  scrollToId("revenue");
                }}
              >
                <div className="kpi-value is-good">{money(countedRevenue, 1)}</div>
                <div className="kpi-label">Revenue · {signedPct(revVar)} vs plan</div>
                {comparePack ? (
                  <div className="kpi-compare">
                    vs {comparePack.label} {signedMoney(pack.revenue - comparePack.revenue)}
                  </div>
                ) : null}
              </button>
              <button
                className={focus.kind === "kpi" && focus.id === "margin" ? "kpi is-selected" : "kpi"}
                type="button"
                onClick={() => {
                  setFocus({ kind: "kpi", id: "margin" });
                  scrollToId("pl");
                }}
              >
                <div className="kpi-value is-good">{pct(countedMargin)}</div>
                <div className="kpi-label">Gross margin · +{gmVarBps} bps vs plan</div>
                {comparePack ? (
                  <div className="kpi-compare">
                    vs {comparePack.label} {signedPct(pack.grossMargin - comparePack.grossMargin)}
                  </div>
                ) : null}
              </button>
              <button
                className={focus.kind === "kpi" && focus.id === "ebitda" ? "kpi is-selected" : "kpi"}
                type="button"
                onClick={() => {
                  setFocus({ kind: "kpi", id: "ebitda" });
                  scrollToId("bridge");
                }}
              >
                <div className="kpi-value is-good">{money(countedEbitda)}</div>
                <div className="kpi-label">EBITDA · {signedMoney(ebitdaVar)} vs plan</div>
                {comparePack ? (
                  <div className="kpi-compare">
                    vs {comparePack.label} {signedMoney(pack.ebitda - comparePack.ebitda)}
                  </div>
                ) : null}
              </button>
              <button
                className={focus.kind === "kpi" && focus.id === "cash" ? "kpi is-selected" : "kpi"}
                type="button"
                onClick={() => setFocus({ kind: "kpi", id: "cash" })}
              >
                <div className="kpi-value">{money(countedCash, 1)}</div>
                <div className="kpi-label">Cash · FCF positive</div>
                {comparePack ? (
                  <div className="kpi-compare">
                    vs {comparePack.label} {signedMoney(pack.cash - comparePack.cash)}
                  </div>
                ) : null}
              </button>
            </section>

            <section className="panel" id="revenue">
              <div className="panel-head">
                <h2>Monthly revenue versus plan</h2>
                <p>
                  Revenue ($M) by month · click a point to inspect · {pack.range}
                </p>
              </div>
              <div className="series-toggles">
                {(["Actual", "Budget", "Forecast"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={series[key] ? `series-pill is-on is-${key.toLowerCase()}` : "series-pill"}
                    onClick={() => toggleSeries(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <div className="chart tall">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueSeries}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                    onClick={(state) => {
                      const month = state?.activeLabel;
                      if (typeof month === "string") setFocus({ kind: "month", month });
                    }}
                  >
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) => `$${value}M`}
                      domain={["auto", "auto"]}
                      width={52}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    {series.Actual ? (
                      <Line type="monotone" dataKey="Actual" stroke="var(--chart-actual)" strokeWidth={2.2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    ) : null}
                    {series.Budget ? (
                      <Line type="monotone" dataKey="Budget" stroke="var(--chart-budget)" strokeWidth={1.6} strokeDasharray="4 4" dot={false} />
                    ) : null}
                    {series.Forecast ? (
                      <Line type="monotone" dataKey="Forecast" stroke="var(--chart-forecast)" strokeWidth={1.8} dot={false} />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <div className="split">
              <section className="panel" id="bridge">
                <div className="panel-head">
                  <h2>EBITDA bridge versus budget</h2>
                  <p>Click a bar for the variance note · {pack.range}</p>
                </div>
                <div className="chart tall">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bridgeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                      <CartesianGrid stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={56} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `$${value}M`} width={52} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="value"
                        name="EBITDA contribution"
                        radius={[3, 3, 0, 0]}
                        onClick={(entry) => {
                          const name = (entry as { name?: string }).name;
                          if (name) setFocus({ kind: "bridge", name });
                        }}
                      >
                        {bridgeSeries.map((entry) => (
                          <Cell
                            key={entry.name}
                            cursor="pointer"
                            fill={
                              focus.kind === "bridge" && focus.name === entry.name
                                ? "var(--text)"
                                : entry.name.includes("EBITDA")
                                  ? "var(--accent)"
                                  : entry.value >= 0
                                    ? "var(--good)"
                                    : "var(--bad)"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="panel" id="segments">
                <div className="panel-head">
                  <h2>YTD revenue mix</h2>
                  <p>Click a slice or row to isolate a segment</p>
                </div>
                <div className="chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SEGMENTS}
                        dataKey="actual"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={2}
                        onClick={(_, index) => setFocus({ kind: "segment", name: SEGMENTS[index].name })}
                      >
                        {SEGMENTS.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            cursor="pointer"
                            fill={PIE_COLORS[index]}
                            opacity={
                              focus.kind === "segment" && focus.name !== entry.name ? 0.35 : 1
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="legend-buttons">
                  {SEGMENTS.map((segment, index) => (
                    <button
                      key={segment.name}
                      type="button"
                      className={focus.kind === "segment" && focus.name === segment.name ? "legend-btn is-on" : "legend-btn"}
                      onClick={() => setFocus({ kind: "segment", name: segment.name })}
                    >
                      <span className="swatch" style={{ background: PIE_COLORS[index] }} />
                      {segment.name}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <section className="panel" id="pl">
              <div className="panel-head row">
                <div>
                  <h2>P&L versus plan</h2>
                  <p>Click a row for the line note · green is favorable to EBITDA</p>
                </div>
                <div className="period-row">
                  <button
                    className={plMode === "dollars" ? "pill is-active" : "pill"}
                    type="button"
                    onClick={() => setPlMode("dollars")}
                  >
                    Dollars
                  </button>
                  <button
                    className={plMode === "variance" ? "pill is-active" : "pill"}
                    type="button"
                    onClick={() => setPlMode("variance")}
                  >
                    Variance
                  </button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Line</th>
                      <th className="num">Actual</th>
                      <th className="num">Budget</th>
                      {plMode === "dollars" ? <th className="num">Forecast</th> : null}
                      <th className="num">vs plan</th>
                      <th className="num">vs plan %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pack.pl.map((row) => {
                      const vsPlan = variance(row.actual, row.budget, row.expense);
                      const vsPlanPct = variancePct(row.actual, row.budget, row.expense);
                      const tone = toneClass(vsPlan);
                      const selected = focus.kind === "pl" && focus.line === row.line;
                      return (
                        <tr
                          key={row.line}
                          className={selected ? "is-selected" : ""}
                          onClick={() => setFocus({ kind: "pl", line: row.line })}
                        >
                          <td>{row.line}</td>
                          <td className="num">{formatCell(row, "actual")}</td>
                          <td className="num">{formatCell(row, "budget")}</td>
                          {plMode === "dollars" ? <td className="num">{formatCell(row, "forecast")}</td> : null}
                          <td className={`num ${tone}`}>
                            {row.isPercent
                              ? `${vsPlan >= 0 ? "+" : ""}${vsPlan.toFixed(1)} pts`
                              : signedMoney(vsPlan)}
                          </td>
                          <td className={`num ${tone}`}>{signedPct(vsPlanPct)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="split">
              <section className="panel">
                <div className="panel-head">
                  <h3>Segment performance · YTD</h3>
                  <p>Recognized revenue ($M) by segment · Jan–Jul 2026</p>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Segment</th>
                        <th className="num">Actual</th>
                        <th className="num">Budget</th>
                        <th className="num">vs plan</th>
                        <th className="num">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SEGMENTS.map((segment) => {
                        const vs = segment.actual - segment.budget;
                        const dimmed = focus.kind === "segment" && focus.name !== segment.name;
                        return (
                          <tr
                            key={segment.name}
                            className={`${focus.kind === "segment" && focus.name === segment.name ? "is-selected" : ""} ${dimmed ? "is-dim" : ""}`}
                            onClick={() => setFocus({ kind: "segment", name: segment.name })}
                          >
                            <td>{segment.name}</td>
                            <td className="num">{money(segment.actual)}</td>
                            <td className="num">{money(segment.budget)}</td>
                            <td className={`num ${toneClass(vs)}`}>{signedMoney(vs)}</td>
                            <td className="num">{segment.share}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel" id="opex">
                <div className="panel-head">
                  <h3>Opex composition · YTD</h3>
                  <p>Click a function in the chart or the usage bar</p>
                </div>
                <div className="usage">
                  <div className="usage-meta">
                    <span>97.7% of YTD opex budget used</span>
                    <span>$16.91M / $17.30M</span>
                  </div>
                  <div className="usage-bar">
                    <button type="button" style={{ width: `${(8.92 / opexBudget) * 100}%` }} className="seg-sm" onClick={() => setFocus({ kind: "opex", name: "S&M" })} />
                    <button type="button" style={{ width: `${(5.61 / opexBudget) * 100}%` }} className="seg-rd" onClick={() => setFocus({ kind: "opex", name: "R&D" })} />
                    <button type="button" style={{ width: `${(2.38 / opexBudget) * 100}%` }} className="seg-ga" onClick={() => setFocus({ kind: "opex", name: "G&A" })} />
                    <span style={{ width: `${((opexBudget - opexUsed) / opexBudget) * 100}%` }} className="seg-rest" />
                  </div>
                </div>
                <div className="chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={opexSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `$${value}M`} width={52} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="Actual"
                        fill="var(--chart-forecast)"
                        radius={[3, 3, 0, 0]}
                        cursor="pointer"
                        onClick={(entry) => {
                          const name = (entry as { name?: string }).name;
                          if (name) setFocus({ kind: "opex", name });
                        }}
                      />
                      <Bar dataKey="Budget" fill="var(--chart-budget)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <div className="split">
              <section className="panel">
                <div className="panel-head">
                  <h2>SaaS operating metrics</h2>
                  <p>Recurring-revenue snapshot at period end · {pack.range}</p>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th className="num">Actual</th>
                        <th className="num">Plan</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Ending ARR</td>
                        <td className="num">{money(pack.arr, 1)}</td>
                        <td className="num">$46.0M</td>
                        <td>Net new ARR $6.8M YTD</td>
                      </tr>
                      <tr>
                        <td>Net revenue retention</td>
                        <td className="num">{pack.nrr}%</td>
                        <td className="num">114%</td>
                        <td>Enterprise expansions</td>
                      </tr>
                      <tr>
                        <td>Gross revenue retention</td>
                        <td className="num">94%</td>
                        <td className="num">93%</td>
                        <td>Logo churn 2.1%</td>
                      </tr>
                      <tr>
                        <td>Magic number</td>
                        <td className="num">0.92</td>
                        <td className="num">0.80</td>
                        <td>Q2 S&M spike dilutes it</td>
                      </tr>
                      <tr>
                        <td>Rule of 40</td>
                        <td className="num">33.4</td>
                        <td className="num">27.1</td>
                        <td>Growth 18% + EBITDA 15.4%</td>
                      </tr>
                      <tr onClick={() => scrollToId("headcount")}>
                        <td>Headcount</td>
                        <td className="num">186</td>
                        <td className="num">192</td>
                        <td>Six open reqs, mostly Eng</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel" id="headcount">
                <div className="panel-head">
                  <h2>Headcount versus plan</h2>
                  <p>Click a function · 31 Jul 2026</p>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Function</th>
                        <th className="num">Actual</th>
                        <th className="num">Plan</th>
                        <th className="num">Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HEADCOUNT.map((row) => {
                        const gap = row.actual - row.plan;
                        const selected = focus.kind === "headcount" && focus.team === row.team;
                        return (
                          <tr
                            key={row.team}
                            className={selected ? "is-selected" : ""}
                            onClick={() => setFocus({ kind: "headcount", team: row.team })}
                          >
                            <td>{row.team}</td>
                            <td className="num">{row.actual}</td>
                            <td className="num">{row.plan}</td>
                            <td className={`num ${gap < 0 ? "is-warn" : gap > 0 ? "is-info" : ""}`}>
                              {gap}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {period === "ytd" ? (
              <section className="panel">
                <div className="panel-head">
                  <h2>FY2026 revenue outlook</h2>
                  <p>Click a month · Jan–Jul locked to actuals</p>
                </div>
                <div className="chart tall">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={fySeries}
                      margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                      onClick={(state) => {
                        const month = state?.activeLabel;
                        if (typeof month === "string" && MONTH_NOTES[month]) {
                          setFocus({ kind: "month", month });
                        }
                      }}
                    >
                      <CartesianGrid stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: number) => `$${value}M`}
                        domain={["auto", "auto"]}
                        width={52}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={4.21} stroke="var(--good)" strokeDasharray="3 3" label={{ value: "Jul actual", fill: "var(--good)", fontSize: 11 }} />
                      <Line type="monotone" dataKey="Budget" stroke="var(--chart-budget)" strokeWidth={1.6} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="Forecast" stroke="var(--chart-forecast)" strokeWidth={2.2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="kpi-grid compact">
                  <article className="kpi static">
                    <div className="kpi-value">$46.9M</div>
                    <div className="kpi-label">FY budget revenue</div>
                  </article>
                  <article className="kpi static">
                    <div className="kpi-value is-good">$49.4M</div>
                    <div className="kpi-label">FY forecast revenue</div>
                  </article>
                  <article className="kpi static">
                    <div className="kpi-value is-good">+$2.6M</div>
                    <div className="kpi-label">Implied FY beat</div>
                  </article>
                </div>
              </section>
            ) : null}

            <section className="panel recs">
              <div className="panel-head">
                <h2>Risks and recommendations</h2>
                <p>Click a card to jump to the related view</p>
              </div>
              <div className="rec-grid">
                {RECS.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    className={focus.kind === "rec" && focus.id === rec.id ? "rec-card is-selected" : "rec-card"}
                    onClick={() => {
                      setFocus({ kind: "rec", id: rec.id });
                      scrollToId(rec.jumpsTo);
                    }}
                  >
                    <strong>{rec.title}</strong>
                    <span>{rec.body}</span>
                  </button>
                ))}
              </div>
              <p className="source">
                Cash $18.4M, no revolver drawn, operating cash flow +$2.9M YTD.
                Figures are management actuals, not audited GAAP.
              </p>
            </section>
          </main>

          <aside className="inspector">
            <div className="inspector-head">
              <h2>Inspector</h2>
              {focus.kind !== "none" ? (
                <button className="pill" type="button" onClick={() => setFocus({ kind: "none" })}>
                  Clear
                </button>
              ) : null}
            </div>
            <h3>{inspector.title}</h3>
            <p>{inspector.body}</p>
            {inspector.meta ? <p className="source">{inspector.meta}</p> : null}
          </aside>
        </div>
      </div>
    </>
  );
}

function renderInspector(
  focus: Focus,
  pack: (typeof PACKS)[Period],
  scenario: {
    vacantFilled: number;
    smCut: number;
    smbRecover: number;
    scenarioRevenue: number;
    scenarioEbitda: number;
    scenarioDirty: boolean;
  },
): { title: string; body: string; meta?: string } {
  if (focus.kind === "kpi" && focus.id === "revenue") {
    return {
      title: `Revenue · ${pack.range}`,
      body: `${money(pack.revenue)} versus ${money(pack.revenueBudget)} plan. The beat sits in Enterprise, not SMB.`,
      meta: scenario.scenarioDirty ? `Scenario revenue ${money(scenario.scenarioRevenue)}` : undefined,
    };
  }
  if (focus.kind === "kpi" && focus.id === "margin") {
    return {
      title: "Gross margin",
      body: `${pct(pack.grossMargin)} versus ${pct(pack.grossMarginBudget)} plan. Mix shift and committed-use cloud discounts.`,
    };
  }
  if (focus.kind === "kpi" && focus.id === "ebitda") {
    return {
      title: "EBITDA",
      body: `${money(pack.ebitda)} versus ${money(pack.ebitdaBudget)} plan. Two-thirds revenue, one-third delayed hiring.`,
      meta: scenario.scenarioDirty ? `Scenario EBITDA ${money(scenario.scenarioEbitda)}` : undefined,
    };
  }
  if (focus.kind === "kpi" && focus.id === "cash") {
    return {
      title: "Cash",
      body: `${money(pack.cash, 1)} on the balance sheet, FCF positive, no revolver drawn. Operating cash flow +$2.9M YTD.`,
    };
  }
  if (focus.kind === "month") {
    const index = pack.months.indexOf(focus.month);
    const actual = index >= 0 ? pack.actualRev[index] : undefined;
    const budget = index >= 0 ? pack.budgetRev[index] : undefined;
    return {
      title: `${focus.month} revenue`,
      body: MONTH_NOTES[focus.month] ?? "No close note for this month.",
      meta:
        actual !== undefined && budget !== undefined
          ? `Actual ${money(actual)} vs budget ${money(budget)} (${signedMoney(actual - budget)})`
          : "H2 month is forecast only.",
    };
  }
  if (focus.kind === "segment") {
    const segment = SEGMENTS.find((item) => item.name === focus.name);
    return {
      title: focus.name,
      body: SEGMENT_NOTES[focus.name] ?? "",
      meta: segment
        ? `${money(segment.actual)} actual · ${money(segment.budget)} budget · ${segment.share}% of YTD`
        : undefined,
    };
  }
  if (focus.kind === "bridge") {
    const index = pack.bridge.categories.indexOf(focus.name);
    const value = index >= 0 ? pack.bridge.values[index] : undefined;
    return {
      title: focus.name,
      body: BRIDGE_NOTES[focus.name] ?? "",
      meta: value !== undefined ? `${signedMoney(value)} on the EBITDA walk` : undefined,
    };
  }
  if (focus.kind === "pl") {
    const row = pack.pl.find((item) => item.line === focus.line);
    const vs = row ? variance(row.actual, row.budget, row.expense) : 0;
    return {
      title: focus.line,
      body: PL_NOTES[focus.line] ?? "",
      meta: row ? `Actual ${formatCell(row, "actual")} · vs plan ${row.isPercent ? `${vs.toFixed(1)} pts` : signedMoney(vs)}` : undefined,
    };
  }
  if (focus.kind === "opex") {
    return {
      title: `${focus.name} opex`,
      body: OPEX_NOTES[focus.name] ?? "",
    };
  }
  if (focus.kind === "headcount") {
    const row = HEADCOUNT.find((item) => item.team === focus.team);
    return {
      title: focus.team,
      body: row?.note ?? "",
      meta: row ? `${row.actual} actual vs ${row.plan} plan (${row.actual - row.plan})` : undefined,
    };
  }
  if (focus.kind === "rec") {
    const rec = RECS.find((item) => item.id === focus.id);
    return {
      title: rec?.title ?? "Recommendation",
      body: rec?.body ?? "",
    };
  }
  if (scenario.scenarioDirty) {
    return {
      title: "Scenario is live",
      body: `Vacant seats filled: ${scenario.vacantFilled}. S&M clawback ${scenario.smCut}%. SMB recovery ${money(scenario.smbRecover)}.`,
      meta: `Scenario EBITDA ${money(scenario.scenarioEbitda)} vs reported ${money(pack.ebitda)}`,
    };
  }
  return {
    title: "Click anything",
    body: "KPIs, chart points, pie slices, P&L rows, opex bars, headcount, and recommendation cards all open here.",
    meta: "Keyboard: 1 YTD · 2 Q2 · 3 July · Esc clear",
  };
}
