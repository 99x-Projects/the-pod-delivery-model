export type TriPoint = {
  optimistic: number;
  likely: number;
  pessimistic: number;
};

export type EstimateItem = {
  id: string;
  name: string;
  man: TriPoint;
  pod: TriPoint;
};

export type HourRollup = {
  likely: number;
  expected: number;
  spread: number;
  commit85: number;
  commit95: number;
};

/** One-sided normal quantiles. The commit sits this many spreads above the expected hours. */
export const COMMIT_Z_85 = 1.0364333894937896;
export const COMMIT_Z_95 = 1.6448536269514722;

export function blankPoint(): TriPoint {
  return { optimistic: 0, likely: 0, pessimistic: 0 };
}

export function blankItem(): EstimateItem {
  return {
    id: newId(),
    name: "",
    man: blankPoint(),
    pod: blankPoint(),
  };
}

export function expectedHours(point: TriPoint) {
  return (point.optimistic + 4 * point.likely + point.pessimistic) / 6;
}

export function spreadHours(point: TriPoint) {
  return Math.abs(point.pessimistic - point.optimistic) / 6;
}

export function pointInOrder(point: TriPoint) {
  return point.optimistic <= point.likely && point.likely <= point.pessimistic;
}

export function rollup(points: TriPoint[]): HourRollup {
  const likely = points.reduce((sum, point) => sum + point.likely, 0);
  const expected = points.reduce((sum, point) => sum + expectedHours(point), 0);
  const variance = points.reduce((sum, point) => sum + spreadHours(point) ** 2, 0);
  const spread = Math.sqrt(variance);
  return {
    likely,
    expected,
    spread,
    commit85: expected + COMMIT_Z_85 * spread,
    commit95: expected + COMMIT_Z_95 * spread,
  };
}

export function readHours(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function hoursDetail(hours: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(hours)} h`;
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const EXAMPLE_ITEMS: EstimateItem[] = [
  {
    id: "example-inception",
    name: "Inception and acceptance",
    man: { optimistic: 16, likely: 24, pessimistic: 40 },
    pod: { optimistic: 12, likely: 16, pessimistic: 28 },
  },
  {
    id: "example-build",
    name: "Build",
    man: { optimistic: 40, likely: 80, pessimistic: 140 },
    pod: { optimistic: 24, likely: 48, pessimistic: 80 },
  },
  {
    id: "example-review",
    name: "Review and fix",
    man: { optimistic: 16, likely: 32, pessimistic: 60 },
    pod: { optimistic: 8, likely: 16, pessimistic: 28 },
  },
];
