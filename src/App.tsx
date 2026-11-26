import { useEffect, useMemo, useState } from "react";
import { ConfigurePage, loadTeamSheet, type Sheet } from "./ConfigurePage";
import { EstimatePage } from "./EstimatePage";
import { RateSettings } from "./RateSettings";
import { appHref, appPath } from "./paths";
import { teamUnits, type TeamUnit } from "./model/configure";
import { loadRates, saveRates, type TierRates } from "./model/rates";
import {
  DEFAULT_SCENARIO,
  type Comparison,
  type Offer,
  type ScenarioInput,
  compareTeam,
  maxToolsLaterGrowth,
  hoursLabel,
  money,
  percent,
  rateLabel,
} from "./model/compare";

const OFFERS: {
  id: Offer["id"];
  kicker: string;
  title: string;
  summary: string;
  includes: string[];
}[] = [
  {
    id: "classical",
    kicker: "You buy hours, with no AI",
    title: "Today",
    summary: "You pay for every hour the work takes. Your estimate is your invoice.",
    includes: [
      "Engineers on your timesheet, at your current rate",
      "Your current way of working",
      "The full hours in the estimate you have today",
    ],
  },
  {
    id: "tools",
    kicker: "You add ordinary AI tools",
    title: "AI tools",
    summary:
      "The start looks faster. Later stages take part of that saving back. You still pay less than with people alone.",
    includes: [
      "Ordinary AI tools on your current way of working",
      "Fewer hours at the start",
      "More hours later, in review, rework, and fixes",
      "Your current rate on the total that comes back",
    ],
  },
  {
    id: "pod",
    kicker: "You buy a pilot, expert skills, and a defined process",
    title: "The 99x pod",
    summary:
      "This is the setup above. The skills are priced once, the later stages shrink, and your total comes down.",
    includes: [
      "The judgement happens early, before the build runs ahead",
      "Expert agents that are vetted, and rated for how much they may do",
      "A defined process, from your intent through to what we learned",
      "A lower total, priced as pod hours",
    ],
  },
];

export function App() {
  const path = appPath();
  const estimate = path === "/estimate";
  const [rates, setRates] = useState<TierRates>(loadRates);

  useEffect(() => {
    saveRates(rates);
  }, [rates]);

  return (
    <div className="page">
      <SiteHeader current={estimate ? "estimate" : "configure"} rates={rates} onRates={setRates} />
      {estimate ? <EstimatePage /> : <MainPage rates={rates} />}
    </div>
  );
}

function SiteHeader({
  current,
  rates,
  onRates,
}: {
  current: "compare" | "estimate" | "configure";
  rates: TierRates;
  onRates: (rates: TierRates) => void;
}) {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <a className="mark" href={appHref("/")}>
          <img src={appHref("/99x-logo.svg")} alt="99x" width="74" height="38" />
          <span>Pod delivery</span>
        </a>
        <div className="nav-end">
          <nav className="nav-links" aria-label="Pages">
            <a
              className="nav-link"
              href={appHref("#configure")}
              aria-current={current === "configure" ? "page" : undefined}
            >
              Configure
            </a>
            <a className="nav-link" href={appHref("#compare")}>
              Compare
            </a>
            <a
              className="nav-link"
              href={appHref("/estimate")}
              aria-current={current === "estimate" ? "page" : undefined}
            >
              Estimate
            </a>
            <a
              className="nav-link"
              href="https://xianix-team.github.io/copilots-studio/"
              target="_blank"
              rel="noreferrer"
            >
              Copilots Studio
            </a>
          </nav>
          <RateSettings rates={rates} onChange={onRates} />
        </div>
      </div>
    </header>
  );
}

function MainPage({ rates }: { rates: TierRates }) {
  const [sheet, setSheet] = useState<Sheet>(loadTeamSheet);
  const [scenario, setScenario] = useState<ScenarioInput>(DEFAULT_SCENARIO);
  const units = useMemo(
    () => teamUnits(sheet.experts, sheet.crossovers, rates),
    [sheet, rates],
  );
  const offers = useMemo(
    () =>
      compareTeam({
        classicHours: scenario.classicHours,
        laterShare: scenario.laterShare,
        toolsLaterGrowth: scenario.toolsLaterGrowth,
        units,
      }),
    [scenario.classicHours, scenario.laterShare, scenario.toolsLaterGrowth, units],
  );

  useEffect(() => {
    document.title = "99x · Set up the pods, then compare";
  }, []);

  function update(patch: Partial<ScenarioInput>) {
    setScenario((current) => ({ ...current, ...patch }));
  }

  return (
    <>
      <ConfigurePage onChange={setSheet} rates={rates} />
      <main className="wrap compare-block">
        <section className="compare-intro" id="compare">
          <p className="eyebrow">The same outcome, for you</p>
          <h2>Three ways you can buy this setup.</h2>
          <p className="lede">
            The prices below use the experts, the skills, and the cross-overs
            you set above. People alone stay the highest price. Ordinary AI
            tools still cost less than that. This pod setup costs less again,
            because the skills shorten the later stages.
          </p>
        </section>

        <Estimator
          scenario={scenario}
          onChange={update}
          onReset={() => setScenario(DEFAULT_SCENARIO)}
        />

        <section className="board" aria-label="Three ways you can buy this work">
          {OFFERS.map((offer) => (
            <OfferCard
              key={offer.id}
              copy={offer}
              figures={offers[offer.id]}
              scale={Math.max(offers.classical.hours, offers.tools.hours, offers.pod.hours)}
              recommended={offer.id === "pod"}
            />
          ))}
        </section>

        <Reading offers={offers} units={units} name={sheet.name} />

        <section className="definition">
          <div>
            <p className="eyebrow">What you are buying</p>
            <h2>The hours move earlier. The later stages get smaller.</h2>
          </div>
          <ol className="stages">
            <li>
              <strong>Inception.</strong> You start from a written intent and
              testable acceptance.
            </li>
            <li>
              <strong>Build.</strong> Expert agents carry the specialist steps.
              Your pilot owns the judgement the work needs.
            </li>
            <li>
              <strong>Operate.</strong> We release, watch, and fix inside the
              same way of working.
            </li>
            <li>
              <strong>Improvements.</strong> What failed becomes a rule before
              the next cycle.
            </li>
          </ol>
        </section>
      </main>

      <footer className="wrap">
        <p>
          These figures are the scale for this conversation, not a rate card.
          A quote is separate. Autopilot costs stay outside the pod hour. The
          skills are the expert agents on{" "}
          <a
            href="https://xianix-team.github.io/copilots-studio/"
            target="_blank"
            rel="noreferrer"
          >
            Copilots Studio
          </a>
          .
        </p>
      </footer>
    </>
  );
}

function Estimator({
  scenario,
  onChange,
  onReset,
}: {
  scenario: ScenarioInput;
  onChange: (patch: Partial<ScenarioInput>) => void;
  onReset: () => void;
}) {
  return (
    <form className="estimator" onSubmit={(event) => event.preventDefault()}>
        <div className="estimator-head">
          <h2>Start from your estimate</h2>
          <button type="button" className="pill" onClick={onReset}>
            Show the example
          </button>
        </div>
        <p className="estimator-note">
          Build these hours on the <a href={appHref("/estimate")}>three-point estimate</a>, in
          man hours and in pod hours.
        </p>

        <div className="fields">
        <label>
          Your hours today
          <input
            type="number"
            min={1}
            step={10}
            value={scenario.classicHours}
            onChange={(event) =>
              onChange({ classicHours: Number(event.target.value) })
            }
          />
        </label>
      </div>

      <div className="sliders">
        <Slider
          label="Share of your estimate that sits in the later stages"
          value={scenario.laterShare}
          min={10}
          max={70}
          onChange={(laterShare) => onChange({ laterShare })}
        />
        <Slider
          label="How much those later stages grow with ordinary AI"
          value={Math.min(scenario.toolsLaterGrowth, maxToolsLaterGrowth(scenario.laterShare))}
          max={Math.round(maxToolsLaterGrowth(scenario.laterShare) * 100)}
          onChange={(toolsLaterGrowth) => onChange({ toolsLaterGrowth })}
        />
      </div>
    </form>
  );
}

function Slider({
  label,
  value,
  min = 0,
  max = 75,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider">
      <span>
        {label}
        <strong>{percent(value)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={Math.round(value * 100)}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
      />
    </label>
  );
}

function OfferCard({
  copy,
  figures,
  scale,
  recommended,
}: {
  copy: (typeof OFFERS)[number];
  figures: Offer;
  scale: number;
  recommended: boolean;
}) {
  const width = scale === 0 ? 0 : (figures.hours / scale) * 100;
  return (
    <article className={`card card-${copy.id}${recommended ? " card-pod" : ""}`}>
      {recommended ? <p className="badge">Recommended</p> : <p className="badge spacer" />}
      <p className="kicker">{copy.kicker}</p>
      <h2>{copy.title}</h2>
      <p className="price">{money(figures.price)}</p>
      <p className="versus">
        {hoursLabel(figures.hours)} in total · {percent(figures.versusClassical)} of your price today
      </p>
      <p className="summary">{copy.summary}</p>
      <div className="stage-track" aria-hidden="true">
        <div className="stage-fill" style={{ width: `${width}%` }}>
          <span className="early" style={{ flexGrow: figures.earlyHours }} />
          <span className="later" style={{ flexGrow: Math.max(figures.laterHours, 0.001) }} />
        </div>
      </div>
      <dl>
        <div>
          <dt>Early</dt>
          <dd>{hoursLabel(figures.earlyHours)}</dd>
        </div>
        <div>
          <dt>Later</dt>
          <dd>{hoursLabel(figures.laterHours)}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd>{rateLabel(figures.rate)}</dd>
        </div>
      </dl>
      <ul>
        {copy.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function Reading({
  offers,
  units,
  name,
}: {
  offers: Comparison;
  units: TeamUnit[];
  name: string;
}) {
  const toolsSaving = offers.classical.price - offers.tools.price;
  const podVersusToday = offers.classical.price - offers.pod.price;
  const setup = units
    .map((unit) => `${unit.name} at ${rateLabel(unit.podRate)}`)
    .join(", ");
  const team = name.trim() ? `For ${name.trim()}, people` : "People";

  return (
    <section className="reading" aria-label="What this means for you">
      <p>
        {team} alone are {rateLabel(offers.classical.rate)}. This setup is {setup || "the experts above"}.
      </p>
      <p>
        With ordinary AI tools the early work falls to {hoursLabel(offers.tools.earlyHours)}.
        The later stages grow to {hoursLabel(offers.tools.laterHours)}, against{" "}
        {hoursLabel(offers.classical.laterHours)} today. You pay {money(offers.tools.price)},
        which is {money(Math.max(toolsSaving, 0))} less than with people alone. The later
        stages have taken back part of the saving you saw at the start.
      </p>
      <p>
        The pod keeps {hoursLabel(offers.pod.earlyHours)} in the early work, where the
        judgement happens, and brings the later stages down to {hoursLabel(offers.pod.laterHours)}.
        You pay {money(offers.pod.price)}
        {podVersusToday > 1
          ? `, which is ${money(podVersusToday)} less than today`
          : ", the same as people alone until skills are in the hour"}
        . You pay {rateLabel(offers.pod.rate)} for the configured pods, against{" "}
        {rateLabel(offers.classical.rate)} with people alone.
      </p>
    </section>
  );
}
