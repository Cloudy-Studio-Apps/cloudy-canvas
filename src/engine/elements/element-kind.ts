import { rectContainsPoint } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import type { ElementView } from "../render/element-view";
import type { ToolOptions } from "../tools/tool.types";
import type { AnyElement, ElementPatch } from "./element.types";
import type { ElementDescription, ElementSpec, ElementText } from "./element-kind.types";

/**
 * Behavior of one element type. Elements are plain data; each type registers one kind instance
 * (see `element-registry.ts`) and the engine asks it how to draw, hit-test, move, resize, edit and
 * restyle the elements of that type. Subclasses override the defaults below.
 */
export abstract class ElementKind<E extends AnyElement = AnyElement> {
  /** The stored `type` of the elements this kind handles. */
  abstract readonly type: E["type"];
  /** Human name, e.g. "Sticky note". */
  abstract readonly label: string;
  /** Whether agents can create it from an `ElementSpec`. */
  readonly creatable: boolean = true;
  readonly resizable: boolean = false;
  /** Fields agents may patch; `null` allows every field. */
  readonly patchableFields: ReadonlySet<string> | null = null;
  /** Set when the element has text edited in place. */
  readonly text: ElementText<E> | null = null;

  /** Draws the element into its view (local coordinates). Runs on create and on every change. */
  abstract draw(view: ElementView, el: E): void;

  /** A new element from a spec. Throws with a message agents can act on when the spec is invalid. */
  build(_spec: ElementSpec, _index: string): E {
    throw new Error(`${this.label} elements can't be created from a spec.`);
  }

  bounds(el: E): Rect {
    return { x: el.x, y: el.y, w: el.w, h: el.h };
  }

  /** Whether a world point hits the element. `tolerance` is in world units. */
  hitTest(el: E, p: Point, tolerance: number): boolean {
    return rectContainsPoint(this.bounds(el), p, tolerance);
  }

  /** Patch that moves the element by (dx, dy) from `origin`. */
  move(origin: E, dx: number, dy: number): ElementPatch {
    return { x: Math.round(origin.x + dx), y: Math.round(origin.y + dy) };
  }

  /** Patch that gives a resizable element new bounds. */
  resize(_el: E, rect: Rect): ElementPatch {
    return rect;
  }

  /** Fills fields added after the type first shipped, so boards saved by older versions load. */
  fillDefaults(el: E): E {
    return el;
  }

  describe(_el: E): ElementDescription {
    return {};
  }

  /** The tool options the element was styled with, so the options panel shows its look. */
  optionsOf(_el: E): Partial<ToolOptions> {
    return {};
  }

  /** How picking options in the options panel restyles the element (empty when they don't apply). */
  restyle(_el: E, _options: Partial<ToolOptions>): ElementPatch {
    return {};
  }
}
