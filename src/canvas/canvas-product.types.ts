import type { CopyContext } from "./clipboard";
import type { CanvasDocument } from "./document";
import type { CanvasElement, ElementKinds } from "./elements";
import type { Point } from "./geometry.types";
import type { Keybindings } from "./input";
import type { CanvasLinks } from "./links";
import type { Tool, ToolContext } from "./tools";

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
  /** Tool options a new editor starts with. */
  readonly defaultOptions: O;
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
}
