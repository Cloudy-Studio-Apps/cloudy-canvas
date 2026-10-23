import { CHEN_STANDARD } from "./chen.standard";
import { CLOUDY_STANDARD } from "./cloudy.standard";
import { ELMASRI_STANDARD } from "./elmasri.standard";
import type { ErStandardDefinition } from "./er-standard.types";
import { PIATTINI_STANDARD } from "./piattini.standard";
import { SILBERSCHATZ_STANDARD } from "./silberschatz.standard";

/** The standards the er module contributes, in the order the picker lists them. */
export const BUILT_IN_ER_STANDARDS: readonly ErStandardDefinition[] = [
  CLOUDY_STANDARD,
  CHEN_STANDARD,
  ELMASRI_STANDARD,
  SILBERSCHATZ_STANDARD,
  PIATTINI_STANDARD,
];
