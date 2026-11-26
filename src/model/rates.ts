import type { Level } from "./skills";

/** Opening classic rates. Tier 1 is the highest judgement, Tier 3 the lowest. Not a rate card. */
export const DEFAULT_RATES: Record<Level, number> = {
  high: 140,
  medium: 100,
  low: 80,
};

/** Display order: Tier 1, then Tier 2, then Tier 3. */
export const TIER_ORDER: Level[] = ["high", "medium", "low"];

export const TIER_LABEL: Record<Level, string> = {
  high: "Tier 1",
  medium: "Tier 2",
  low: "Tier 3",
};

const STORAGE_KEY = "pod-tier-rates";

export type TierRates = Record<Level, number>;

export function tierLabel(level: Level) {
  return TIER_LABEL[level];
}

export function readRate(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

export function loadRates(): TierRates {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RATES };
    const parsed = JSON.parse(raw) as Partial<TierRates>;
    return {
      high: readRate(Number(parsed.high ?? DEFAULT_RATES.high)),
      medium: readRate(Number(parsed.medium ?? DEFAULT_RATES.medium)),
      low: readRate(Number(parsed.low ?? DEFAULT_RATES.low)),
    };
  } catch {
    return { ...DEFAULT_RATES };
  }
}

export function saveRates(rates: TierRates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch {
    // The rates still apply for this visit when storage is unavailable.
  }
}
