import { useEffect, useMemo, useState } from "react";
import { money, rateLabel } from "./model/compare";
import {
  EXAMPLE_ITEMS,
  type EstimateItem,
  type TriPoint,
  blankItem,
  expectedHours,
  hoursDetail,
  pointInOrder,
  readHours,
  rollup,
} from "./model/estimate";

const STORAGE_KEY = "pod-three-point-estimate";

type Sheet = {
  name: string;
  manRate: number;
  podRate: number;
  items: EstimateItem[];
};

const EMPTY_SHEET: Sheet = {
  name: "",
  manRate: 100,
  podRate: 119,
  items: [blankItem()],
};

export function EstimatePage() {
  const [sheet, setSheet] = useState<Sheet>(loadSheet);
  const [copied, setCopied] = useState(false);

  const man = useMemo(() => rollup(sheet.items.map((item) => item.man)), [sheet.items]);
  const pod = useMemo(() => rollup(sheet.items.map((item) => item.pod)), [sheet.items]);

  useEffect(() => {
    document.title = "99x · Three-point estimate";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
    } catch {
      // The sheet still works for this visit when storage is unavailable.
    }
  }, [sheet]);

  function patch(next: Partial<Sheet>) {
    setSheet((current) => ({ ...current, ...next }));
  }

  function updateItem(id: string, next: Partial<EstimateItem>) {
    setSheet((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...next } : item)),
    }));
  }

  function updatePoint(
    id: string,
    unit: "man" | "pod",
    field: keyof TriPoint,
    value: number,
  ) {
    setSheet((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id
          ? { ...item, [unit]: { ...item[unit], [field]: readHours(value) } }
          : item,
      ),
    }));
  }

  function removeItem(id: string) {
    setSheet((current) => {
      const items = current.items.filter((item) => item.id !== id);
      return { ...current, items: items.length > 0 ? items : [blankItem()] };
    });
  }

  async function copySummary() {
    const text = [
      sheet.name.trim() ? `Estimate: ${sheet.name.trim()}` : "Estimate",
      `Man hours at ${rateLabel(sheet.manRate)} — most likely ${hoursDetail(man.likely)}, expected ${hoursDetail(man.expected)}, about 85% ${hoursDetail(man.commit85)}, about 95% ${hoursDetail(man.commit95)}.`,
      `Pod hours at ${rateLabel(sheet.podRate)} — most likely ${hoursDetail(pod.likely)}, expected ${hoursDetail(pod.expected)}, about 85% ${hoursDetail(pod.commit85)}, about 95% ${hoursDetail(pod.commit95)}.`,
      `Man-hour price — expected ${money(man.expected * sheet.manRate)}, about 85% ${money(man.commit85 * sheet.manRate)}.`,
      `Pod-hour price — expected ${money(pod.expected * sheet.podRate)}, about 85% ${money(pod.commit85 * sheet.podRate)}.`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <main className="wrap">
        <section className="hero hero-tool">
          <p className="eyebrow">For the estimate</p>
          <h1>Three-point estimate.</h1>
          <p className="lede">
            For each piece of work, enter the optimistic, most likely, and
            pessimistic hours. Enter them in man hours, and again in pod hours.
            A pod hour is one hour from one pilot working with agents. The
            sheet gives you the hours you can plan, and the hours you can
            commit.
          </p>
        </section>

        <form className="estimator" onSubmit={(event) => event.preventDefault()}>
          <div className="estimator-head">
            <h2>The work</h2>
            <div className="sheet-actions">
              <button type="button" className="pill" onClick={() => patch({ items: [...sheet.items, blankItem()] })}>
                Add work
              </button>
              <button type="button" className="pill" onClick={() => patch({ items: EXAMPLE_ITEMS.map((item) => ({ ...item })) })}>
                Show an example
              </button>
              <button
                type="button"
                className="pill"
                onClick={() => patch({ name: "", items: [blankItem()] })}
              >
                Clear work
              </button>
            </div>
          </div>

          <div className="fields fields-rates">
            <label>
              Name of this estimate
              <input
                type="text"
                value={sheet.name}
                placeholder="The work you are estimating"
                onChange={(event) => patch({ name: event.target.value })}
              />
            </label>
            <label>
              Man-hour rate
              <input
                type="number"
                min={0}
                step={1}
                value={sheet.manRate}
                onChange={(event) => patch({ manRate: readHours(Number(event.target.value)) })}
              />
            </label>
            <label>
              Pod-hour rate
              <input
                type="number"
                min={0}
                step={1}
                value={sheet.podRate}
                onChange={(event) => patch({ podRate: readHours(Number(event.target.value)) })}
              />
            </label>
          </div>

          <div className="sheet-scroll">
            <table className="sheet">
              <caption>Man hours and pod hours for each piece of work</caption>
              <thead>
                <tr>
                  <th rowSpan={2} scope="col">
                    Work
                  </th>
                  <th colSpan={4} scope="colgroup">
                    Man hours
                  </th>
                  <th colSpan={4} scope="colgroup">
                    Pod hours
                  </th>
                  <th rowSpan={2} scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
                <tr>
                  <PointHeaders unit="Man hours" />
                  <PointHeaders unit="Pod hours" />
                </tr>
              </thead>
              <tbody>
                {sheet.items.map((item, index) => {
                  const label = item.name.trim() || `Work ${index + 1}`;
                  const manOrder = pointInOrder(item.man);
                  const podOrder = pointInOrder(item.pod);
                  return (
                    <tr key={item.id}>
                      <th scope="row">
                        <input
                          type="text"
                          aria-label={`Name of work ${index + 1}`}
                          value={item.name}
                          placeholder={`Work ${index + 1}`}
                          onChange={(event) => updateItem(item.id, { name: event.target.value })}
                        />
                        {manOrder && podOrder ? null : (
                          <span className="row-warning">
                            Keep optimistic, then most likely, then pessimistic.
                          </span>
                        )}
                      </th>
                      <PointCells
                        label={label}
                        unit="man hours"
                        point={item.man}
                        ordered={manOrder}
                        onChange={(field, value) => updatePoint(item.id, "man", field, value)}
                      />
                      <PointCells
                        label={label}
                        unit="pod hours"
                        point={item.pod}
                        ordered={podOrder}
                        onChange={(field, value) => updatePoint(item.id, "pod", field, value)}
                      />
                      <td>
                        <button
                          type="button"
                          className="pill"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </form>

        <section className="result-grid" aria-label="Estimate totals">
          <Result
            title="Man hours"
            tone="man"
            rollup={man}
            rate={sheet.manRate}
            empty={man.expected === 0 && pod.expected > 0}
            emptyText="These stay at zero until you enter man hours."
          />
          <Result
            title="Pod hours"
            tone="pod"
            rollup={pod}
            rate={sheet.podRate}
            empty={pod.expected === 0 && man.expected > 0}
            emptyText="These stay at zero until you enter pod hours."
          />
        </section>

        <section className="reading" aria-label="How the hours are calculated">
          <p>
            Expected hours are (optimistic + 4 × most likely + pessimistic) ÷ 6.
            The spread of one line is (pessimistic − optimistic) ÷ 6. The spread
            of the whole estimate is the square root of the sum of those squared
            spreads. That holds when the pieces of work vary on their own.
          </p>
          <p>
            About 85% is the expected hours plus 1.04 × the spread. About 95%
            adds 1.65 × the spread. Shared risk sits outside this spread. The
            price is these hours at the rate you enter for this estimate.
            {man.expected > 0
              ? ` The pod estimate is ${hoursDetail(pod.expected)} expected, against ${hoursDetail(man.expected)} of man hours.`
              : ""}
          </p>
          <p className="sheet-actions">
            <button type="button" className="pill" onClick={() => void copySummary()}>
              {copied ? "Copied" : "Copy the summary"}
            </button>
          </p>
        </section>
      </main>

      <footer className="wrap">
        <p>
          This sheet is for the estimation. A quote is separate. Autopilot costs
          are separate from the pod hour. The opening rates are {rateLabel(100)} for
          a man hour and {rateLabel(119)} for a pod hour, so the sheet matches the
          comparison until you replace them.
        </p>
      </footer>
    </>
  );
}

function PointHeaders({ unit }: { unit: string }) {
  return (
    <>
      <th scope="col">
        Optimistic <span className="visually-hidden">{unit}</span>
      </th>
      <th scope="col">
        Most likely <span className="visually-hidden">{unit}</span>
      </th>
      <th scope="col">
        Pessimistic <span className="visually-hidden">{unit}</span>
      </th>
      <th scope="col">
        Expected <span className="visually-hidden">{unit}</span>
      </th>
    </>
  );
}

function PointCells({
  label,
  unit,
  point,
  ordered,
  onChange,
}: {
  label: string;
  unit: string;
  point: TriPoint;
  ordered: boolean;
  onChange: (field: keyof TriPoint, value: number) => void;
}) {
  const fields: { field: keyof TriPoint; name: string }[] = [
    { field: "optimistic", name: "optimistic" },
    { field: "likely", name: "most likely" },
    { field: "pessimistic", name: "pessimistic" },
  ];
  return (
    <>
      {fields.map(({ field, name }) => (
        <td key={field}>
          <input
            type="number"
            min={0}
            step={0.5}
            aria-label={`${label}, ${unit}, ${name}`}
            aria-invalid={ordered ? undefined : true}
            value={point[field]}
            onChange={(event) => onChange(field, Number(event.target.value))}
          />
        </td>
      ))}
      <td className="expected">{hoursDetail(expectedHours(point))}</td>
    </>
  );
}

function Result({
  title,
  tone,
  rollup: figures,
  rate,
  empty,
  emptyText,
}: {
  title: string;
  tone: "man" | "pod";
  rollup: ReturnType<typeof rollup>;
  rate: number;
  empty: boolean;
  emptyText: string;
}) {
  return (
    <article className={`result${tone === "pod" ? " result-pod" : ""}`}>
      <h2>{title}</h2>
      {empty ? <p className="summary">{emptyText}</p> : null}
      <dl>
        <div>
          <dt>Most likely, added up</dt>
          <dd>{hoursDetail(figures.likely)}</dd>
        </div>
        <div>
          <dt>Expected</dt>
          <dd>{hoursDetail(figures.expected)}</dd>
        </div>
        <div>
          <dt>Spread</dt>
          <dd>{hoursDetail(figures.spread)}</dd>
        </div>
        <div>
          <dt>About 85%</dt>
          <dd>{hoursDetail(figures.commit85)}</dd>
        </div>
        <div>
          <dt>About 95%</dt>
          <dd>{hoursDetail(figures.commit95)}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd>{rateLabel(rate)}</dd>
        </div>
      </dl>
      <p className="price">{money(figures.expected * rate)}</p>
      <p className="versus">
        Expected price · {money(figures.commit85 * rate)} at about 85%
      </p>
    </article>
  );
}

function loadSheet(): Sheet {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SHEET, items: [blankItem()] };
    const parsed = JSON.parse(raw) as Partial<Sheet>;
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return { ...EMPTY_SHEET, items: [blankItem()] };
    }
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      manRate: readHours(Number(parsed.manRate ?? EMPTY_SHEET.manRate)),
      podRate: readHours(Number(parsed.podRate ?? EMPTY_SHEET.podRate)),
      items: parsed.items.map((item) => ({
        id: typeof item.id === "string" ? item.id : blankItem().id,
        name: typeof item.name === "string" ? item.name : "",
        man: readPoint(item.man),
        pod: readPoint(item.pod),
      })),
    };
  } catch {
    return { ...EMPTY_SHEET, items: [blankItem()] };
  }
}

function readPoint(value: TriPoint | undefined): TriPoint {
  return {
    optimistic: readHours(Number(value?.optimistic)),
    likely: readHours(Number(value?.likely)),
    pessimistic: readHours(Number(value?.pessimistic)),
  };
}
