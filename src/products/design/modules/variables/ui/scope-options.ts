import type { TokenScope, TokenValue, VariableType } from "@canvas";
import { t } from "../variables.i18n";

/** The scopes a variable of each type can be limited to, with their names. */
export const SCOPE_OPTIONS: Readonly<
  Record<VariableType, readonly { scope: TokenScope; label: string }[]>
> = {
  color: [
    { scope: "all-fills", label: t("scopes.allFills") },
    { scope: "frame-fill", label: t("scopes.frameFill") },
    { scope: "shape-fill", label: t("scopes.shapeFill") },
    { scope: "text-fill", label: t("scopes.textFill") },
    { scope: "stroke-color", label: t("scopes.strokeColor") },
    { scope: "effect-color", label: t("scopes.effectColor") },
  ],
  number: [
    { scope: "corner-radius", label: t("scopes.cornerRadius") },
    { scope: "width-height", label: t("scopes.widthHeight") },
    { scope: "gap", label: t("scopes.gap") },
    { scope: "padding", label: t("scopes.padding") },
    { scope: "stroke-weight", label: t("scopes.strokeWeight") },
    { scope: "opacity", label: t("scopes.opacity") },
    { scope: "font-size", label: t("scopes.fontSize") },
    { scope: "line-height", label: t("scopes.lineHeight") },
    { scope: "letter-spacing", label: t("scopes.letterSpacing") },
    { scope: "font-weight", label: t("scopes.fontWeight") },
    { scope: "effect-value", label: t("scopes.effectValue") },
    { scope: "other-number", label: t("scopes.otherNumber") },
  ],
  string: [
    { scope: "text-content", label: t("scopes.textContent") },
    { scope: "font-family", label: t("scopes.fontFamily") },
    { scope: "font-style", label: t("scopes.fontStyle") },
  ],
  // Figma's booleans aren't scoped either: they're offered wherever a true/false fits.
  boolean: [],
};

/** What a new variable of each type starts as. */
export const NEW_VALUES: Readonly<Record<VariableType, TokenValue>> = {
  color: { color: "#D9D9D9FF" },
  number: { number: 0 },
  string: { string: "Text" },
  boolean: { boolean: true },
};

/** A new variable's name, by type. */
export const NEW_NAMES: Readonly<Record<VariableType, string>> = {
  color: "Color",
  number: "Number",
  string: "Text",
  boolean: "Boolean",
};

/** The collection made for a file's first variable. */
export const FIRST_COLLECTION = t("defaults.firstCollection");
