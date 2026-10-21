import type { Size } from "../geometry.types";
import type { CanvasElement, ElementPatch } from "./element.types";

/**
 * Default values every element type may have. Each type's `<type>.defaults.ts` object satisfies
 * this and adds its own (padding, stroke width, …); generic code reads it through `kind.defaults`.
 */
export interface ElementDefaults {
  /** Size when placed with a click. */
  size?: Size;
  /** Font size of new elements' text. */
  fontSize?: number;
}

/** How an element's text is laid out, shared by its drawer and the DOM text editor. */
export interface ElementTextStyle {
  fontSize: number;
  color: string;
  /** Defaults to regular (400). */
  fontWeight?: "400" | "600";
  /** Horizontal alignment of the wrapped lines. */
  align: "left" | "center";
  /** `top` starts at the padding; `middle` centers the text block in the element. */
  vAlign: "top" | "middle";
  /** Inner padding, in world units. */
  padX: number;
  padY: number;
  /** One-line text (e.g. a name): Enter finishes editing instead of adding a line. */
  singleLine?: boolean;
}

/** An element whose text is edited in place with the text editor. */
export interface ElementText<E extends CanvasElement> {
  get(el: E): string;
  /** The patch that writes edited text, or `null` when nothing changes. */
  set(el: E, text: string): ElementPatch<E> | null;
  style(el: E): ElementTextStyle;
  /**
   * The element is sized to its text (e.g. a free text label): lines don't wrap and the editor
   * grows while typing. `set` returns the new size with the text.
   */
  fitContent?: boolean;
  /** The element is only its text, so emptying it deletes the element (and a new one isn't added). */
  removeWhenEmpty?: boolean;
}

/** Type-specific details shown in compact listings (agent summaries). */
export interface ElementDescription {
  /** Text, title or name, when the element has one. */
  label?: string;
  /** Sub-kind, e.g. a geo element's variant. */
  kind?: string;
  /** The group it belongs to, e.g. the id of its ER diagram. */
  group?: string;
}

/** A new element's requested fields, as hosts and agents give them. `x`/`y` are the top-left corner. */
export interface ElementSpec {
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: string;
  color?: string;
  /** Sub-kind, e.g. a geo variant (`rectangle`, `ellipse`, …). */
  kind?: string;
  fill?: string;
  stroke?: string;
}
