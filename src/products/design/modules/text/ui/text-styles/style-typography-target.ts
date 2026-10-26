import type { DocumentTokens, StyleRecord } from "@canvas";
import { readTextStyle } from "../../text-style";
import type { TypographyTarget } from "../typography-target.types";

/**
 * A text style as the typography controls' target, so its editor reuses them: they read its
 * values and set them on the style (the texts using it follow).
 */
export function styleTypographyTarget(
  tokens: DocumentTokens,
  style: StyleRecord,
): TypographyTarget {
  const value = readTextStyle(style.value);
  return {
    range: false,
    read: (field) => (value[field as keyof typeof value] ?? null) as never,
    // Colors aren't part of a text style; only its typography is kept.
    set: (patch) => tokens.updateStyle(style.id, { value: readTextStyle(patch) }),
  };
}
