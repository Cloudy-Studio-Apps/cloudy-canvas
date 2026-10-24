import type { TokenScope, VariableType } from "@canvas";

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
};

/** What a new variable of each type starts as. */
export const NEW_VALUES = {
  color: { color: "#D9D9D9FF" },
  number: { number: 0 },
} as const;

/** The collection made for a file's first variable. */
export const FIRST_COLLECTION = "Primitives";
