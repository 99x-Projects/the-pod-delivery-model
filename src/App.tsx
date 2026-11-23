import { useMemo, useState } from "react";
import { EstimatePage } from "./EstimatePage";
import { appHref, appPath } from "./paths";
import {
  DEFAULT_SCENARIO,
  type Offer,
  type ScenarioInput,
  compare,
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
      "The work moves earlier. Vetted skills and a defined process keep the later stages small, so your total comes down.",
    includes: [
      "The judgement happens early, before the build runs ahead",
      "Expert agents that are vetted, and rated for how much they may do",
      "A defined process, from your intent through to what we learned",
      "A lower total, priced as pod hours",
    ],
  },
];

function isEstimatePath(path: string) {
  return path === "/estimate" || path === "/estimate/";
}

export function App() {
  if (isEstimatePath(appPath())) {
    return (
      <div className="page">
        <SiteHeader current="estimate" />
        <EstimatePage />
      </div>
    );
  }

  return <ComparePage />;
}

function SiteHeader({ current }: { current: "compare" | "estimate" }) {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <a className="mark" href={appHref("/")}>
          <img src={appHref("/99x-logo.svg")} alt="99x" width="74" height="38" />
          <span>Pod delivery</span>
        </a>
        <nav className="nav-links" aria-label="Pages">
          <a className="nav-link" href={appHref("/")} aria-current={current === "compare" ? "page" : undefined}>
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
      </div>
    </header>
  );
}

function ComparePage() {
  const [scenario, setScenario] = useState<ScenarioInput>(DEFAULT_SCENARIO);
  const offers = useMemo(() => compare(scenario), [scenario]);

  function update(patch: Partial<ScenarioInput>) {
    setScenario((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="page">
      <SiteHeader current="compare" />

      <main className="wrap">
        <section className="hero" id="compare">
          <p className="eyebrow">The same outcome, for you</p>
          <h1>Three ways you can buy this work.</h1>
          <p className="lede">
            Ordinary AI tools can make the start look faster. Without a defined
            process and vetted skills, some of those hours come back in the
            later stages. You still pay less than with people alone. A 99x pod
            shifts the work left. The pilot and the expert skills take the
            judgement early, the later stages shrink further, and your cost
            comes down again.
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

        <Reading offers={offers} scenario={scenario} />

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
          These figures are for your conversation with us. A quote is separate.
          Autopilot costs are separate from the pod hour. The skills and the
          process are the ones you can see on{" "}
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
    </div>
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
        <label>
          Your rate today
          <input
            type="number"
            min={0}
            step={1}
            value={scenario.rate}
            onChange={(event) => onChange({ rate: Number(event.target.value) })}
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
        <Slider
          label="How much the pod shortens those later stages"
          value={scenario.podLaterCut}
          max={85}
          onChange={(podLaterCut) => onChange({ podLaterCut })}
        />
        <Slider
          label="Share of the pod’s saving you get back in the price"
          value={scenario.returnedShare}
          max={100}
          onChange={(returnedShare) => onChange({ returnedShare })}
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
  scenario,
}: {
  offers: ReturnType<typeof compare>;
  scenario: ScenarioInput;
}) {
  const toolsSaving = offers.classical.price - offers.tools.price;
  const podVersusToday = offers.classical.price - offers.pod.price;

  return (
    <section className="reading" aria-label="What this means for you">
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
        You pay {money(offers.pod.price)}, which is {money(Math.abs(podVersusToday))}{" "}
        {podVersusToday >= 0 ? "less than today" : "more than today"}.
      </p>
      <p>
        {percent(scenario.returnedShare)} of the hours the pod removes comes back to you
        in a lower price. You pay {rateLabel(offers.pod.rate)} for a pod hour, against{" "}
        {rateLabel(offers.classical.rate)} today.
      </p>
    </section>
  );
}
