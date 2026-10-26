import type { ScaleNames, ScaleSettings, ScaleStep } from "./scale-generator.types";

const DOWN = ["sm", "xs", "2xs", "3xs", "4xs"];
const UP = ["lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];

/** A new scale's settings. */
export const DEFAULT_SCALE_SETTINGS: ScaleSettings = {
  ratio: 1.25,
  below: 2,
  above: 4,
  names: "tshirt",
  round: true,
};

/** Musical ratios type scales are usually built on. */
export const SCALE_RATIOS: readonly { ratio: number; label: string }[] = [
  { ratio: 1.125, label: "Major second" },
  { ratio: 1.2, label: "Minor third" },
  { ratio: 1.25, label: "Major third" },
  { ratio: 1.333, label: "Perfect fourth" },
  { ratio: 1.5, label: "Perfect fifth" },
  { ratio: 1.618, label: "Golden ratio" },
  { ratio: 2, label: "Double" },
];

/** The name of the step `offset` steps from the base (`index`: its place from the smallest). */
function stepName(names: ScaleNames, offset: number, index: number): string {
  if (names === "numeric") return String((index + 1) * 100);
  if (offset === 0) return "md";
  return (offset < 0 ? DOWN[-offset - 1] : UP[offset - 1]) ?? `step${offset}`;
}

/** A scale's steps: the base, then each step below and above it by `ratio`. */
export function numberScale(base: number, settings: ScaleSettings): ScaleStep[] {
  const steps: ScaleStep[] = [];
  for (let offset = -settings.below; offset <= settings.above; offset++) {
    const raw = base * settings.ratio ** offset;
    const value = settings.round ? Math.round(raw) : Math.round(raw * 100) / 100;
    steps.push({
      name: stepName(settings.names, offset, offset + settings.below),
      value: offset === 0 ? base : value,
      base: offset === 0,
      factor: settings.ratio ** offset,
    });
  }
  return steps;
}
