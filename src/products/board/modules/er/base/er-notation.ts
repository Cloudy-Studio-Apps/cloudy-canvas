import type { ErNotation, ErNotationPreset, ErNotationSettings } from "./er.types";

/**
 * Each preset's settings. `chen`: `(min,max)` numbers, the triangle and arc, crow's feet, and the
 * ratio read across (diagrams saved before notations existed keep `ratio: own`, see `ErKind`).
 */
export const ER_NOTATION_PRESETS: Readonly<Record<ErNotationPreset, ErNotationSettings>> = {
  chen: { ratio: "across", participation: "numbers", isa: "arc", crowFeet: true },
};

/** What diagrams saved before notations existed draw with: their ratio read the first way. */
export const LEGACY_ER_NOTATION: ErNotation = { ratio: "own" };

/** The settings a diagram draws with: its preset's, with what it overrides. */
export function erNotation(notation: ErNotation | undefined): ErNotationSettings {
  const { preset, ...overrides } = notation ?? {};
  const defined = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined),
  ) as Partial<ErNotationSettings>;
  return { ...ER_NOTATION_PRESETS[preset ?? "chen"], ...defined };
}
