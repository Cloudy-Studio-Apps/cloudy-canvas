import type { TokenScope, TokenValue, VariableType } from "@canvas";

/** The scopes a variable of each type can be limited to, with their names. */
export const SCOPE_OPTIONS: Readonly<
  Record<VariableType, readonly { scope: TokenScope; label: string }[]>
> = {
  color: [
    { scope: "all-fills", label: "All fills" },
    { scope: "frame-fill", label: "Frame fill" },
    { scope: "shape-fill", label: "Shape fill" },
    { scope: "text-fill", label: "Text fill" },
    { scope: "stroke-color", label: "Stroke" },
    { scope: "effect-color", label: "Effects" },
  ],
  number: [
    { scope: "corner-radius", label: "Corner radius" },
    { scope: "width-height", label: "Width and height" },
    { scope: "gap", label: "Gap" },
    { scope: "padding", label: "Padding" },
    { scope: "stroke-weight", label: "Stroke weight" },
    { scope: "opacity", label: "Opacity" },
    { scope: "font-size", label: "Font size" },
    { scope: "line-height", label: "Line height" },
    { scope: "letter-spacing", label: "Letter spacing" },
    { scope: "font-weight", label: "Font weight" },
    { scope: "effect-value", label: "Effect values" },
    { scope: "other-number", label: "Other numbers" },
  ],
  string: [
    { scope: "text-content", label: "Text content" },
    { scope: "font-family", label: "Font family" },
    { scope: "font-style", label: "Font style" },
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
export const FIRST_COLLECTION = "Primitives";
