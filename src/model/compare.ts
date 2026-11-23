export type ScenarioInput = {
  classicHours: number;
  rate: number;
  laterShare: number;
  toolsLaterGrowth: number;
  podLaterCut: number;
  returnedShare: number;
};

export const DEFAULT_SCENARIO: ScenarioInput = {
  classicHours: 1000,
  rate: 100,
  laterShare: 0.4,
  toolsLaterGrowth: 0.4,
  podLaterCut: 0.55,
  returnedShare: 0.5,
};

/** Ordinary tools make the early work look faster. */
const TOOLS_EARLY_CUT = 0.35;
/** A pod keeps the early work. That is the shift left. */
const POD_EARLY_CUT = 0.1;

export type OfferId = "classical" | "tools" | "pod";

export type Offer = {
  id: OfferId;
  earlyHours: number;
  laterHours: number;
  hours: number;
  rate: number;
  price: number;
  calendar: number;
  versusClassical: number;
};

export type Comparison = Record<OfferId, Offer>;

export function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** The most the later stages can grow before ordinary AI would cost as much as people alone. */
export function maxToolsLaterGrowth(laterShare: number) {
  const share = clamp(laterShare, 0.1, 0.7);
  const early = 1 - share;
  const room = (early * TOOLS_EARLY_CUT) / share - 0.02;
  return clamp(room, 0, 1);
}

export function compare(input: ScenarioInput): Comparison {
  const hours = Math.max(1, input.classicHours);
  const rate = Math.max(0, input.rate);
  const laterShare = clamp(input.laterShare, 0.1, 0.7);
  const toolsLaterGrowth = clamp(
    input.toolsLaterGrowth,
    0,
    maxToolsLaterGrowth(laterShare),
  );
  const podLaterCut = clamp(input.podLaterCut, 0, 0.85);
  const returned = clamp(input.returnedShare, 0, 1);
  const baseline = hours * rate;

  const early = hours * (1 - laterShare);
  const later = hours * laterShare;

  const toolsEarly = early * (1 - TOOLS_EARLY_CUT);
  const toolsLater = later * (1 + toolsLaterGrowth);
  const toolsHours = toolsEarly + toolsLater;

  const podEarly = early * (1 - POD_EARLY_CUT);
  const podLater = later * (1 - podLaterCut);
  const podHours = Math.max(1, podEarly + podLater);
  const podCut = 1 - podHours / hours;
  const podPrice = baseline * (1 - podCut * returned);

  return {
    classical: offer("classical", early, later, rate, baseline, hours, baseline),
    tools: offer(
      "tools",
      toolsEarly,
      toolsLater,
      rate,
      toolsHours * rate,
      hours,
      baseline,
    ),
    pod: offer(
      "pod",
      podEarly,
      podLater,
      podPrice / podHours,
      podPrice,
      hours,
      baseline,
    ),
  };
}

function offer(
  id: OfferId,
  earlyHours: number,
  laterHours: number,
  rate: number,
  price: number,
  classicHours: number,
  baseline: number,
): Offer {
  const hours = earlyHours + laterHours;
  return {
    id,
    earlyHours,
    laterHours,
    hours,
    rate,
    price,
    calendar: classicHours === 0 ? 0 : hours / classicHours,
    versusClassical: baseline === 0 ? 0 : price / baseline,
  };
}

export function money(amount: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function hoursLabel(hours: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(hours))} h`;
}

export function rateLabel(rate: number) {
  return `${money(rate)} / h`;
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
