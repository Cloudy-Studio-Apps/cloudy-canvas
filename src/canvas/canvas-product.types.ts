import type { CanvasViewOptions } from "./canvas-view.types";
import type { CopyContext, PastedImage } from "./clipboard";
import type { CanvasDocument, EditedChange } from "./document";
import type { CanvasElement, ElementKinds, ElementPatch } from "./elements";
import type { Point, Rect } from "./geometry.types";
import type { Keybindings } from "./input";
import type { EffectRenderers, ElementClip, ElementEffects, ElementMasks } from "./render";
import type { CanvasGuides } from "./ruler-guides";
import type { CanvasLinks } from "./links";
import type { Tool, ToolContext } from "./tools";
import type { CanvasMode } from "./modes";

/**
 * What makes a canvas a board or a design file: its element types, its tools, its shortcuts and
 * its tool options. The engine is the same for every product; it's created with one of these.
 * `O` is the product's tool options (colors, sizes, … the options panel edits).
 */
export interface CanvasProduct<O extends object = object> {
  /** e.g. `"board"`; used in messages and logs. */
  readonly id: string;
  readonly kinds: ElementKinds<O>;
  /** The product's tools, added after the built-in select and hand tools. */
  createTools(ctx: ToolContext<O>): Tool[];
  /** Every command's shortcuts: `BASE_KEYBINDINGS` plus `tool.<id>` for the product's tools. */
  readonly keybindings: Keybindings;
  /**
   * Commands the host app implements (e.g. opening a panel), bound in `keybindings` like any other.
   * The host handles each with `engine.handleHostAction(id, handler)`.
   */
  readonly hostCommands?: readonly string[];
  /** Modes besides the default one (`DEFAULT_MODE`), switched with `engine.setMode`. */
  readonly modes?: readonly CanvasMode[];
  /** Tool options a new editor starts with. */
  readonly defaultOptions: O;
  /** Zoom range and background grid; unset values are `DEFAULT_VIEW_OPTIONS`'. */
  readonly view?: Partial<CanvasViewOptions>;
  /**
   * Splits the document into scopes shown one at a time (a design's pages). Without it, the
   * canvas shows every element.
   */
  readonly scopes?: CanvasScopes;
  /** Where the ruler guides are kept (per scope). Without it, the canvas has none. */
  readonly guides?: CanvasGuides;
  /**
   * Drawing order keys (compared as strings, bottom to top) for elements whose order isn't their
   * own `index` alone, e.g. nodes of a tree drawn after their parent. Elements left out get
   * `zOrderKey`. `elements` are the scene's, with derived geometry resolved.
   */
  orderKeys?(elements: readonly CanvasElement[]): Map<string, string>;
  /**
   * The world area each clipped element shows in (e.g. children of a frame that clips its
   * content); elements left out aren't clipped. What's clipped away isn't drawn or hit.
   * `elements` are the scene's, with derived geometry resolved.
   */
  clips?(elements: readonly CanvasElement[]): Map<string, ElementClip>;
  /**
   * The masks: elements that others show through (only where the mask shows, or where it doesn't
   * when inverted), and where each element under one is drawn (see `ElementMasks`). What's masked
   * away isn't drawn or hit. `elements` are the scene's, with derived geometry resolved.
   */
  masks?(elements: readonly CanvasElement[]): ElementMasks;
  /**
   * Each element's effects (shadows, blurs, shaders) and what they're drawn over: the element and
   * what it holds (see `ElementEffects`). Its slots nest with the masks'. `elements` are the
   * scene's, with derived geometry resolved.
   */
  effects?(elements: readonly CanvasElement[]): ElementEffects;
  /** How each type of effect is drawn, by type (effects without one aren't drawn). */
  effectRenderers?: EffectRenderers;
  /**
   * Elements that are on the canvas (hit, selected, snapped to their parents' results) but not
   * drawn on their own, e.g. a boolean's operands, which it draws combined. `elements` are the
   * scene's, with derived geometry resolved.
   */
  undrawn?(elements: readonly CanvasElement[]): ReadonlySet<string>;
  /**
   * Starts editing an element in a way of its own (e.g. a design vector's points), on
   * double-click or Enter. Returns `false` to fall back to editing its text, if it has any.
   */
  editElement?(el: CanvasElement, ctx: ToolContext<O>): boolean;
  /**
   * What a click on the element `hitId` selects (e.g. the group holding it, as in Figma), given
   * the current selection: `deep` (Ctrl/Cmd+click) asks for the element itself, `enter`
   * (double-click) for one level further into a group. Without it, clicks select what they hit.
   */
  selectTarget?(
    hitId: string,
    request: SelectTargetRequest,
    elements: readonly CanvasElement[],
  ): string;
  /**
   * What a single element is aligned with (the align commands): the box that holds it (e.g. a
   * design's parent frame, a board's section), or `null` when nothing does.
   */
  alignTarget?(el: CanvasElement, elements: readonly CanvasElement[]): Rect | null;
  /**
   * The frame the rulers measure for this selection (e.g. the design frame it's in, as in Figma):
   * they count from its top-left corner and number only its span (the page's while it's turned),
   * and a guide dragged out of them while it's set belongs to it. `null`, or without it, the whole
   * canvas from the world's origin.
   */
  rulerFrame?(
    selected: readonly CanvasElement[],
    elements: readonly CanvasElement[],
  ): CanvasElement | null;
  /**
   * The frames N and Shift+N step through (`nextFrame`, `previousFrame`), in order (e.g. a
   * design's top-level frames, a board's sections, in reading order). Without it, none.
   */
  frames?(elements: readonly CanvasElement[]): readonly CanvasElement[];
  /**
   * Runs when the select tool finishes dragging elements (with their members) to a new place,
   * inside the drag's undo step: e.g. puts them into the frame they were dropped on. `elements`
   * are the scene's, after the move.
   */
  onMoved?(
    doc: CanvasDocument,
    moved: ReadonlySet<string>,
    elements: readonly CanvasElement[],
  ): void;
  /**
   * Runs after every edit, inside its transaction and undo step (`CanvasDocument.setAfterEdit`):
   * writes what follows from the change (e.g. a design's auto layout), which runs it again with
   * what that changed. Elements a file opens with don't run it.
   */
  afterEdit?(doc: CanvasDocument, change: EditedChange): void;
  /**
   * Gives elements whose geometry follows others (e.g. a box around a group) their current
   * geometry. Returns the list with those replaced by new objects and the rest as they were;
   * the replaced ones are redrawn on every change.
   */
  resolveElements?(elements: CanvasElement[]): CanvasElement[];
  /**
   * The ids plus what goes with them when they're moved or deleted (e.g. an entity's attributes).
   * `elements` are the scene's, with derived geometry resolved.
   */
  withMembers?(
    ids: ReadonlySet<string>,
    elements: readonly CanvasElement[],
    purpose: "move" | "delete",
  ): Set<string>;
  /** Lines derived from the elements, drawn under them (one set per engine). */
  createLinks?(): CanvasLinks[];
  /**
   * Cleans up after elements are deleted (e.g. clears references to them). Runs inside the
   * deletion's transaction, so it's part of the same undo step. `before` are the scene's elements
   * as they were before the deletion (derived geometry resolved).
   */
  onRemove?(
    doc: CanvasDocument,
    removed: ReadonlySet<string>,
    before: readonly CanvasElement[],
  ): void;
  /**
   * Fixes copied elements (pasted, duplicated or Alt-dragged) before they're added: unique names,
   * references to elements that weren't copied, … The copies already have new ids, with references
   * between them remapped. Returns the list to add.
   */
  prepareCopies?(copies: CanvasElement[], context: CopyContext): CanvasElement[];
  /**
   * An element for text pasted from outside the app, centered on `at` at z-order `index`, or
   * `null` to ignore it. `options` are the current tool options.
   */
  pasteText?(text: string, at: Point, index: string, options: O): CanvasElement | null;
  /**
   * Text pasted from outside the app while elements are selected, applied to them instead of
   * becoming an element (e.g. a CSS gradient as their fill): each element's patch, or `null` to
   * paste it as usual. Asked before `pasteText`.
   */
  pasteOnto?(text: string, selected: readonly CanvasElement[]): Map<string, ElementPatch> | null;
  /**
   * An element showing an image pasted or dropped from outside the app (stored as `image.assetId`),
   * fit and centered in `view` (the visible world rect, centered on the drop point for a drop) at
   * z-order `index`, or `null` to ignore it.
   */
  pasteImage?(image: PastedImage, view: Rect, index: string, options: O): CanvasElement | null;
}

/** What `CanvasProduct.selectTarget` is asked with. */
export interface SelectTargetRequest {
  /** The current selection. */
  selection: ReadonlySet<string>;
  /** Select the hit element itself (Ctrl/Cmd+click). */
  deep: boolean;
  /** Go one level further in (double-click). */
  enter: boolean;
}

/**
 * A document split into scopes the canvas shows one at a time (a design's pages). The scene holds
 * only the current scope's elements, so everything that reads it (hits, selection, exports,
 * agents) stays in that scope. New elements are placed in the current one when they're added.
 */
export interface CanvasScopes {
  /** The scope ids, in order; the canvas opens on the first. */
  list(doc: CanvasDocument): string[];
  /** The scope an element is shown in; `null` for elements never shown (e.g. the page records). */
  of(el: CanvasElement): string | null;
  /** An element being added, placed in `scope` unless it's already in one. */
  place(el: CanvasElement, scope: string): CanvasElement;
  /** A scope's name for people (a design's page name), shown where collaborators are. */
  label?(doc: CanvasDocument, scope: string): string | null;
}
