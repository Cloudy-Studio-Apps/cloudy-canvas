import {
  canvasFileMagic,
  colorTokensOnly,
  fromDtcg,
  fromTokensStudio,
  isTokensStudio,
  readFileTokens,
  type TokenRecord,
} from "@canvas";

import type { ColorSource } from "./read-color-source.types";

/**
 * The colors a file brings to a board: a Cloudy Canvas design or board (read without opening
 * it), or a Tokens Studio or W3C design tokens JSON file; only color variables, with what they
 * need. Throws with a message people can act on.
 */
export function readColorSource(bytes: Uint8Array): ColorSource {
  const magic = canvasFileMagic(bytes);
  if (magic) {
    const records = readFileTokens(bytes, { magic, noun: "Cloudy Canvas" });
    return { label: "Cloudy Canvas file", ...onlyColors(records, []) };
  }
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("This file isn't a design, a board or a tokens JSON file.");
  }
  const studio = isTokensStudio(json);
  const read = studio ? fromTokensStudio(json) : fromDtcg(json);
  return {
    label: studio ? "Tokens Studio" : "Design tokens (DTCG)",
    ...onlyColors(read.records, read.warnings),
  };
}

/** The color records, with a warning counting what boards can't use. */
function onlyColors(records: readonly TokenRecord[], warnings: readonly string[]) {
  const colors = colorTokensOnly(records);
  const kept = new Set(colors.map((r) => r.id));
  const left = records.filter(
    (r) => (r.kind === "variable" || r.kind === "style") && !kept.has(r.id),
  ).length;
  return {
    records: colors,
    warnings: [
      ...warnings,
      ...(left > 0 ? [`${left} variables and styles that aren't colors were left out.`] : []),
    ],
  };
}
