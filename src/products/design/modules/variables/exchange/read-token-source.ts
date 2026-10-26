import type { ElementKinds } from "@canvas";

import { readDesignTokens } from "../../../file";
import type { TokenFormat, TokenSourceRead } from "./token-format.types";

const DESIGN_MAGIC = "CCDS";

/**
 * Reads a picked file's tokens: a `.cdesign` (by its magic), else JSON in the first format whose
 * `detect` accepts it. Throws with a message people can act on.
 */
export function readTokenSource(
  bytes: Uint8Array,
  formats: readonly TokenFormat[],
  kinds: ElementKinds,
): TokenSourceRead {
  if (new TextDecoder().decode(bytes.subarray(0, 4)) === DESIGN_MAGIC) {
    return { label: "Cloudy Canvas design", records: readDesignTokens(bytes, kinds), warnings: [] };
  }
  const text = new TextDecoder().decode(bytes);
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("This file isn't a design or a tokens JSON file.");
  }
  const format = formats.find((f) => f.read && f.detect?.(json));
  if (!format?.read) throw new Error("No installed format reads this JSON file.");
  return { label: format.label, ...format.read(text) };
}
