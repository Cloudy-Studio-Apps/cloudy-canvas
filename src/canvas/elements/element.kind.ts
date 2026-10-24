import type { FontRequest } from "@shared/core";

import { rectContainsPoint } from "../geometry";
import { normalizeAngle, rotatePoint } from "../rotation";
import type { Point, Rect, Size } from "../geometry.types";
import type { ElementView } from "../render/element-view";
import { pathRoot, readParent, setPathsPatch } from "../tokens/binding-path";
import type { BindableField } from "../tokens/binding.types";
import { splitTokenColor } from "../tokens/token-color";
import type { ResolvedValue } from "../tokens/token.types";
import { ELEMENT_DEFAULTS } from "./element.defaults";
import { scaleRect } from "./element-scale";
import type { ScaleTransform } from "./element-scale.types";
import type { CanvasElement, ElementPatch, ElementStyle } from "./element.types";
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
   * Whether the Scale tool (K) can scale it on its own (it gets handles); others scaled with a
   * selection only follow it (see `scale`).
   */
  readonly scalable: boolean = false;
  /**
   * Frames (e.g. sections, aggregation boxes) are drawn behind every other element, larger ones
   * further back, and a marquee selects them only when it encloses them.
   */
  readonly frame: boolean = false;
  /** Whether connectors (and other lines that attach to elements) can attach to it. */
  readonly connectable: boolean = false;
  /** Whether selection and hover outline its bounds (lines show their handles instead). */
  readonly boxed: boolean = true;
  /**
   * Whether it can be turned (`CanvasElement.rotation`): the select tool's rotate zones, the
   * rotate commands. The engine draws, hits and outlines it turned; the kind works unturned.
   */
  readonly rotatable: boolean = false;
  /** JSON schema of the type-specific spec fields agents may give (read from `spec.args`). */
  readonly specProperties: Readonly<Record<string, unknown>> = {};
  /** Fields agents may patch; `null` allows every field. */
  readonly patchableFields: ReadonlySet<string> | null = null;
  /**
   * The stored fields that make up its look (fills, colors, font…), which Copy and Paste
   * properties carry (`styleOf`, `applyStyle`). Fields match by name across types.
   */
  readonly styleFields: readonly string[] = [];
  /** Set when the element has text edited in place. */
  readonly text: ElementText<E> | null = null;

  /**
   * Draws the element into its view (local coordinates). Runs on create and on every change but a
   * move: a view whose element only changed `x`/`y` is moved, not drawn again.
   */
  abstract draw(view: ElementView, el: E): void;

  /**
   * What the drawing depends on besides the element's own fields (e.g. a shape worked out from
   * other elements), compared by identity: the view is drawn again when it changes.
   */
  drawnFrom(_el: E): unknown {
    return null;
  }

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

  /**
   * Patch that turns the element by `degrees` around `pivot` (world): its corner orbits the pivot
   * and its `rotation` adds up. Kinds whose geometry holds their angle (a line's ends) override it.
   */
  rotate(el: E, degrees: number, pivot: Point): ElementPatch<E> {
    const origin = rotatePoint(el, pivot, degrees);
    return {
      x: roundHundredth(origin.x),
      y: roundHundredth(origin.y),
      rotation: normalizeAngle((el.rotation ?? 0) + degrees),
    } as ElementPatch<E>;
  }

  /** Patch that gives a resizable element new bounds. */
  resize(_el: E, rect: Rect): ElementPatch<E> {
    return { x: rect.x, y: rect.y, w: rect.w, h: rect.h } as ElementPatch<E>;
  }

  /**
   * Patch that scales the element and its content (font sizes, stroke weights, radii, points) by
   * `t`, as if it were a picture: the Scale tool (K). By default a resizable element is resized
   * to its scaled bounds and others only move with their corner; kinds override it to scale what
   * they draw. What moves with it (e.g. a frame's children) is scaled on its own.
   */
  scale(el: E, t: ScaleTransform): ElementPatch<E> {
    const from = this.bounds(el);
    const to = scaleRect(t, from);
    return this.resizable ? this.resize(el, to) : this.move(el, to.x - from.x, to.y - from.y);
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

  /** The fields of the element a variable can drive (see `BindableField`). None by default. */
  bindable(_el: E): BindableField[] {
    return [];
  }

  /**
   * The stored values a variable's value gives the field at `path` (paths → values; a color
   * also sets its paint's `opacity` from its alpha). The token sync writes them and checks them:
   * a field that no longer holds them was set by hand, and is unlinked.
   */
  bindValues(el: E, path: string, value: ResolvedValue): Record<string, unknown> {
    // A style sets the fields it holds (kinds pick the ones they take).
    if (value.type === "style") return { ...value.value };
    if (value.type === "number") return { [path]: value.number };
    const { hex, alpha } = splitTokenColor(value.color);
    const parent = readParent(el, path);
    if (path.endsWith(".color") && typeof parent?.opacity === "number") {
      return { [path]: hex, [`${path.slice(0, -".color".length)}.opacity`]: alpha };
    }
    return { [path]: alpha < 1 ? value.color : hex };
  }

  /**
   * The patch that writes `bindValues` (`null` when the path isn't there). Kinds whose fields
   * have consequences override it (a size goes through `resize`, a text lays itself out again).
   */
  bindPatch(el: E, path: string, value: ResolvedValue): ElementPatch<E> | null {
    return setPathsPatch(el, this.bindValues(el, path, value)) as ElementPatch<E> | null;
  }

  /** Its look, for Copy properties: its `styleFields`, with the variables bound to them. */
  styleOf(el: E): ElementStyle {
    const style: Record<string, unknown> = {};
    const fields = el as unknown as Record<string, unknown>;
    for (const field of this.styleFields) {
      if (fields[field] !== undefined) style[field] = structuredClone(fields[field]);
    }
    const bindings = Object.entries(el.bindings ?? {}).filter(([path]) =>
      this.styleFields.includes(pathRoot(path)),
    );
    if (bindings.length > 0) style.bindings = Object.fromEntries(bindings);
    return style;
  }

  /**
   * How Paste properties restyles it: the copied fields it has among its `styleFields`. Kinds
   * whose layout follows their look add what follows (e.g. a text's new size); empty when nothing
   * applies.
   */
  applyStyle(el: E, style: ElementStyle): ElementPatch<E> {
    const patch: Record<string, unknown> = {};
    for (const field of this.styleFields) {
      if (style[field] !== undefined) patch[field] = structuredClone(style[field]);
    }
    const bindings = pastedBindings(el, style, Object.keys(patch));
    if (bindings) patch.bindings = bindings;
    return patch as ElementPatch<E>;
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

/**
 * An element's bindings after Paste properties replaced the fields `replaced`: theirs dropped, the
 * copied element's for them added; `null` when nothing changes.
 */
export function pastedBindings(
  el: CanvasElement,
  style: ElementStyle,
  replaced: readonly string[],
): Record<string, string> | null {
  const copied = style.bindings as Record<string, string> | undefined;
  const own = el.bindings ?? {};
  if (!copied && !Object.keys(own).some((path) => replaced.includes(pathRoot(path)))) return null;
  const next = Object.fromEntries(
    Object.entries(own).filter(([path]) => !replaced.includes(pathRoot(path))),
  );
  for (const [path, id] of Object.entries(copied ?? {})) {
    if (replaced.includes(pathRoot(path))) next[path] = id;
  }
  return next;
}

/** To 1/100 of a unit: turned corners land between pixels, but not on float noise. */
function roundHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}
