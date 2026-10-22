import type { TextTypography } from "./text.types";

/** The tool options the text module owns. */
export interface TextToolOptions {
  /** What new texts are typed in: the typography used last (as in Figma). */
  textTypography: TextTypography;
}
