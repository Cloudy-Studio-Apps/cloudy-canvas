import type { ElementKinds } from "./element.kinds";
import type { Point, Rect, Size } from "../geometry.types";
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

/**
 * An element whose text is edited in place with the text editor. Elements with several texts
 * (a table's cells) name each one with a `part` key; `undefined` means the element's first or
 * only text.
 */
export interface ElementText<E extends CanvasElement> {
  get(el: E, part?: string): string;
  /** The patch that writes edited text, or `null` when nothing changes. */
  set(el: E, text: string, part?: string): ElementPatch<E> | null;
  style(el: E, part?: string): ElementTextStyle;
  /** The text part at a world point (what a double-click edits); only for elements with parts. */
  partAt?(el: E, p: Point): string | null;
  /** The box the editor covers for a part, relative to the element's top-left corner. */
  partBox?(el: E, part: string): Rect;
  /** The part Tab (or Shift+Tab, `back`) moves the editor to, or `null` at the end. */
  nextPart?(el: E, part: string, back: boolean): string | null;
  /**
   * The text part to edit for a requested part (Enter on the selected element): the first one
   * when none is given, or the text part a selected part leads to (a table row's first cell).
   */
  firstPart?(el: E, requested?: string): string;
  /**
   * The element is sized to its text (e.g. a free text label): lines don't wrap and the editor
   * grows while typing. `set` returns the new size with the text.
   */
  fitContent?: boolean;
  /** The element is only its text, so emptying it deletes the element (and a new one isn't added). */
  removeWhenEmpty?: boolean;
}

/** A click on the selected element that picks a part of it (see `ElementKind.partAt`). */
export interface PartClick {
  /** The part selected before the click, if any. */
  current: string | null;
  /** Extend the current part to a range (e.g. a block of table cells). */
  shiftKey: boolean;
  /** Add or remove the clicked part from the current one (Ctrl, or Cmd on macOS). */
  modKey: boolean;
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
  /**
   * `square` (the default) for grab handles, `dot` for small actions such as quick-connect.
   * `bar` (a filled pill, e.g. a selected row's grip) and `add` (a light strip with a "+") cover
   * the rect at `x`/`y` (top-left) sized `w`×`h`.
   */
  look?: "square" | "dot" | "bar" | "add";
  w?: number;
  h?: number;
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
