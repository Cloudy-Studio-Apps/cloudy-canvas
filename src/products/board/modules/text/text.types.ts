import type { CanvasElement, ElementDefaults, FontStyle, FontWeight } from "@canvas";

/** How the lines of a text label line up. */
export type TextLabelAlign = "left" | "center" | "right";

/** The look of a label's letters (missing fields: regular, upright, left-aligned). */
export interface TextLook {
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  align?: TextLabelAlign;
}

/**
 * A free text label. By default it's sized to its unwrapped text (auto width); with `wrap` it
 * keeps its width, its lines wrap in it and its height follows them (fixed width).
 */
export interface TextElement extends CanvasElement, TextLook {
  type: "text";
  color: string;
  text: string;
  fontSize: number;
  wrap?: boolean;
}

/** What a label's size is worked out from. */
export type LabelFit = Pick<
  TextElement,
  "text" | "fontSize" | "fontWeight" | "fontStyle" | "wrap" | "w"
>;

export interface TextDefaults extends ElementDefaults {
  fontSize: number;
  /** The font sizes the panel, Paste properties and agents may set. */
  minFontSize: number;
  maxFontSize: number;
  /** Its color field and the option that picks it. */
  colorOptions: { color: "textColor" };
}

/** The text tool's options: the look of new text (and of the selected labels). */
export interface TextToolOptions {
  textColor: string;
  /** The color variable the color is bound to (`null`: the color as picked). */
  textColorToken: string | null;
  textSize: number;
  textBold: boolean;
  textItalic: boolean;
  textAlign: TextLabelAlign;
  /** Selected labels only: sized to their text (`true`) or wrapped in their width. */
  textAutoWidth: boolean;
}
