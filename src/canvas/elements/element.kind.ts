import type { FontRequest } from "@shared/core";

import { rectContainsPoint } from "../geometry";
import type { Point, Rect, Size } from "../geometry.types";
import type { ElementView } from "../render/element-view";
import { ELEMENT_DEFAULTS } from "./element.defaults";
import type { CanvasElement, ElementPatch } from "./element.types";
import type { ElementInteraction, InteractionQuery } from "./element.interaction.types";
import type {
  ElementBuildContext,
  ElementDefaults,
  ElementDescription,
  ElementHandle,
  ElementSide,
  ElementSpec,
  ElementText,
  PartClick,
} from "./element.kind.types";

/**
 * Behavior of one element type. Elements are plain data; each product registers one kind instance
 * per type in its `ElementKinds`, and the engine asks it how to draw, hit-test, move, resize, edit
 * and restyle the elements of that type. Subclasses override the defaults below. `O` is the
 * product's tool options, which `optionsOf` and `restyle` read and write.
 */
export abstract class ElementKind<
  E extends CanvasElement = CanvasElement,
  O extends object = object,
> {
  /** The stored `type` of the elements this kind handles. */
  abstract readonly type: E["type"];
  /** Human name, e.g. "Sticky note". Also names the text editor ("Sticky note text"). */
  abstract readonly label: string;
  /** One sentence for tooltips and listings. */
  abstract readonly description: string;
  /** The tool that creates it, if any. Its shortcut (from the keymap) is the element's hotkey. */
  readonly tool: string | null = null;
  /** The type's default values (see its `<type>.defaults.ts`). */
  readonly defaults: ElementDefaults = {};
  /** Whether agents can create it from an `ElementSpec`. */
  readonly creatable: boolean = true;
  readonly resizable: boolean = false;
  /** Whether resizing always keeps its proportions (otherwise only with Shift), e.g. images. */
  readonly keepsRatio: boolean = false;
  /**
   * Frames (e.g. sections, aggregation boxes) are drawn behind every other element, larger ones
   * further back, and a marquee selects them only when it encloses them.
   */
  readonly frame: boolean = false;
  /** Whether connectors (and other lines that attach to elements) can attach to it. */
  readonly connectable: boolean = false;
  /** Whether selection and hover outline its bounds (lines show their handles instead). */
  readonly boxed: boolean = true;
  /** JSON schema of the type-specific spec fields agents may give (read from `spec.args`). */
  readonly specProperties: Readonly<Record<string, unknown>> = {};
  /** Fields agents may patch; `null` allows every field. */
  readonly patchableFields: ReadonlySet<string> | null = null;
  /** Set when the element has text edited in place. */
  readonly text: ElementText<E> | null = null;

  /** Draws the element into its view (local coordinates). Runs on create and on every change. */
  abstract draw(view: ElementView, el: E): void;

  /** A new element from a spec. Throws with a message agents can act on when the spec is invalid. */
  build(_spec: ElementSpec, _index: string, _context: ElementBuildContext): E {
    throw new Error(`${this.label} elements can't be created from a spec.`);
  }

  bounds(el: E): Rect {
    return { x: el.x, y: el.y, w: el.w, h: el.h };
  }

  /** Whether moved, resized and drawn elements snap to its edges and center (outlined ones do). */
  snapTarget(_el: E): boolean {
    return this.boxed;
  }

  /** Whether a world point hits the element. `tolerance` is in world units. */
  hitTest(el: E, p: Point, tolerance: number): boolean {
    return rectContainsPoint(this.bounds(el), p, tolerance);
  }

  /**
   * Part of the element a press at `p` would grab (a handle, a button), checked before the
   * element is selected. `null` lets the press select and move the element as usual.
   */
  interactionAt(_el: E, _p: Point, _query: InteractionQuery): ElementInteraction<O> | null {
    return null;
  }

  /** Handles the overlay draws while the element is selected or hovered. */
  handles(_el: E, _zoom: number): ElementHandle[] {
    return [];
  }

  /**
   * The part a click on the already selected element selects there (e.g. a table cell), or `null`.
   * With Shift or Ctrl/Cmd (`click`), the kind may extend `click.current` instead (a range of
   * cells, or one more). Kinds whose parts are picked otherwise (handles) leave it `null`.
   */
  partAt(_el: E, _p: Point, _click: PartClick): string | null {
    return null;
  }

  /**
   * World rects of a selected part of the element (e.g. a table's row, or several cells), outlined
   * by the overlay; empty when the element has no such part.
   */
  partBounds(_el: E, _part: string): Rect[] {
    return [];
  }

  /** The patch that deletes a selected part (Delete key), or `null` when it can't be removed. */
  removePart(_el: E, _part: string): ElementPatch<E> | null {
    return null;
  }

  /** World point where a line attaches to a side of the element (the middle of the side). */
  anchor(el: E, side: ElementSide): Point {
    const { x, y, w, h } = this.bounds(el);
    switch (side) {
      case "top":
        return { x: x + w / 2, y };
      case "right":
        return { x: x + w, y: y + h / 2 };
      case "bottom":
        return { x: x + w / 2, y: y + h };
      case "left":
        return { x, y: y + h / 2 };
    }
  }

  /** Patch that moves the element by (dx, dy) from `origin`. */
  move(origin: E, dx: number, dy: number): ElementPatch<E> {
    // The shared fields are in every element, so the cast is safe.
    return { x: Math.round(origin.x + dx), y: Math.round(origin.y + dy) } as ElementPatch<E>;
  }

  /** Patch that gives a resizable element new bounds. */
  resize(_el: E, rect: Rect): ElementPatch<E> {
    return { x: rect.x, y: rect.y, w: rect.w, h: rect.h } as ElementPatch<E>;
  }

  /** Bounds for a new element from a spec: its position, and its size or the type's default. */
  protected specRect(spec: ElementSpec, size: Size): Rect {
    for (const key of ["w", "h"] as const) {
      const value = spec[key];
      if (value !== undefined && value < ELEMENT_DEFAULTS.minSize) {
        throw new Error(`"${key}" must be at least ${ELEMENT_DEFAULTS.minSize}.`);
      }
    }
    return { x: spec.x, y: spec.y, w: spec.w ?? size.w, h: spec.h ?? size.h };
  }

  /**
   * Completes an agent's patch with the fields that follow from it (e.g. a text's size), and
   * throws with a message the agent can act on when a value is invalid. `context` finds the
   * elements a patch refers to (e.g. a connector's new end).
   */
  completePatch(_el: E, patch: ElementPatch<E>, _context: ElementBuildContext): ElementPatch<E> {
    return patch;
  }

  /** The font faces its text uses beyond the app's own (e.g. a design text's chosen font). */
  fonts(_el: E): FontRequest[] {
    return [];
  }

  /**
   * Called when one of its fonts has loaded, after which its text is drawn again: returns what
   * changes now that the text measures differently (e.g. an auto-sized text's size), or `null`.
   * Written outside the undo history.
   */
  fontsLoaded(_el: E): ElementPatch<E> | null {
    return null;
  }

  /** Ids of the document assets it shows (e.g. an image's file), so copies carry them along. */
  assets(_el: E): string[] {
    return [];
  }

  /** The element's grid of texts, one array per row (e.g. a table's cells), for CSV exports. */
  rows(_el: E): string[][] | null {
    return null;
  }

  /** Fills fields added after the type first shipped, so files saved by older versions load. */
  fillDefaults(el: E): E {
    return el;
  }

  describe(_el: E): ElementDescription {
    return {};
  }

  /** The tool options the element was styled with, so the options panel shows its look. */
  optionsOf(_el: E): Partial<O> {
    return {};
  }

  /** How picking options in the options panel restyles the element (empty when they don't apply). */
  restyle(_el: E, _options: Partial<O>): ElementPatch<E> {
    return {};
  }
}
