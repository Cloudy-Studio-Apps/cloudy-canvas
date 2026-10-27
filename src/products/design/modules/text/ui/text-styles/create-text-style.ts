import { DOCUMENT_TOKENS, pickedBindings } from "@canvas";
import { isText } from "../../is-text";
import { TEXT_DEFAULTS } from "../../text.defaults";
import { TEXT_STYLE, textStyleOfNode } from "../../text-style";
import type { DesignEngine } from "../../../../design-engine.types";
import type { TextStyleValue } from "../../text.types";
import { t } from "../../text.i18n";

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
    name: name ?? t("styles.defaultName", { size: Math.round(value.fontSize) }),
    value: { ...value },
    // The variables its typography uses stay (weight and face are stored differently on styles).
    bindings: text
      ? pickedBindings(text.bindings, ["fontSize", "lineHeight", "letterSpacing", "fontFamily"])
      : undefined,
  }).id;
}
