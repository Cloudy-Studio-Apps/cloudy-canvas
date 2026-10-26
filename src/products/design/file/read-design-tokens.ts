import { readFileTokens, type ElementKinds, type TokenRecord } from "@canvas";

import { DESIGN_FILE_KIND } from "./design-file";

/**
 * The variables, styles, collections and modes of a `.cdesign` file, read without opening it as
 * an editor (tokens from before mode axes brought up to date in memory). Throws for other files.
 */
export function readDesignTokens(bytes: Uint8Array, kinds: ElementKinds): TokenRecord[] {
  return readFileTokens(bytes, DESIGN_FILE_KIND, kinds);
}
