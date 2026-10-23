import { ER_STANDARDS } from "./er-standards";
import type { ErNotation, ErNotationSettings, ErStandardInfo } from "./er.types";

/** What diagrams saved before notations existed draw with: their ratio read the first way. */
export const LEGACY_ER_NOTATION: ErNotation = { ratio: "own" };

/** The standard a diagram follows (`cloudy` when it names none). */
export function erStandard(notation: ErNotation | undefined): ErStandardInfo {
  return ER_STANDARDS[notation?.standard ?? "cloudy"];
}

/** The settings a diagram draws with: its standard's, with what it overrides. */
export function erNotation(notation: ErNotation | undefined): ErNotationSettings {
  const defined = Object.fromEntries(
    Object.entries(notation ?? {}).filter(
      ([key, value]) => key !== "standard" && value !== undefined,
    ),
  ) as Partial<ErNotationSettings>;
  return { ...erStandard(notation).settings, ...defined };
}
