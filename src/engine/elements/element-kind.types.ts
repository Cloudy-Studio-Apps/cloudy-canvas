import type { ElementPatch } from "./element.types";

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
}

/** An element whose text is edited in place with the text editor. */
export interface ElementText<E> {
  /** Accessible name of the editor's textarea. */
  ariaLabel: string;
  get(el: E): string;
  /** The patch that writes edited text, or `null` when nothing changes. */
  set(el: E, text: string): ElementPatch | null;
  style(el: E): ElementTextStyle;
}

/** Type-specific details shown in compact listings (agent summaries). */
export interface ElementDescription {
  /** Text, title or name, when the element has one. */
  label?: string;
  /** Sub-kind, e.g. a geo element's variant. */
  kind?: string;
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
