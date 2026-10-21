import type { ElementKinds } from "./element.kinds";
import type { Point, Size } from "../geometry.types";
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
  /** Ids of the elements a line runs between (`null` for a free end), e.g. a connector's. */
  ends?: { from: string | null; to: string | null };
}

/** A side of an element, e.g. where a connector leaves it. */
export type ElementSide = "top" | "right" | "bottom" | "left";

/** A point the overlay draws while the element is selected or hovered (world units). */
export interface ElementHandle extends Point {
  /** `square` (the default) for grab handles, `dot` for small actions such as quick-connect. */
  look?: "square" | "dot";
}

/** What `ElementKind.build` can look up while building from a spec. */
export interface ElementBuildContext {
  /**
   * An element by id, or by the `key` an agent gave another element in the same call. Elements
   * created in the same call have their spec's geometry.
   */
  lookup(ref: string): CanvasElement | undefined;
  /** The product's kinds, e.g. to check what another element can do. */
  readonly kinds: ElementKinds;
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
  /** Every field the agent gave, for type-specific ones (see `ElementKind.specProperties`). */
  args: Readonly<Record<string, unknown>>;
}
