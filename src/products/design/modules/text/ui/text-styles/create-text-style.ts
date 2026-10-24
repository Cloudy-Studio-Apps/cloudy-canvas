import { DOCUMENT_TOKENS } from "@canvas";
import {
  isText,
  TEXT_DEFAULTS,
  TEXT_STYLE,
  textStyleOfNode,
  type DesignEngine,
  type TextStyleValue,
} from "@design";

/**
 * Adds a text style from the first selected text's typography (or the default one), named after
 * its size; returns its id.
 */
export function createTextStyle(engine: DesignEngine, name?: string): string {
  const text = engine
    .getState()
    .selectedIds.map((id) => engine.getElement(id))
    .find(isText);
  const value: TextStyleValue = text
    ? textStyleOfNode(text)
    : { ...TEXT_DEFAULTS.typography, textDecoration: "none" };
  return engine.service(DOCUMENT_TOKENS).createStyle({
    styleType: TEXT_STYLE,
    name: name ?? `Text ${Math.round(value.fontSize)}`,
    value: { ...value },
  }).id;
}
