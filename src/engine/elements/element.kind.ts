import { rectContainsPoint } from "../geometry";
import type { Point, Rect, Size } from "../geometry.types";
import type { ElementView } from "../render/element-view";
import type { ToolId, ToolOptions } from "../tools/tool.types";
import type { CanvasElement, ElementPatch } from "./element.types";
import type {
  ElementDefaults,
  ElementDescription,
  ElementSpec,
  ElementText,
} from "./element.kind.types";

/**
 * Behavior of one element type. Elements are plain data; each type registers one kind instance
 * (see `element.registry.ts`) and the engine asks it how to draw, hit-test, move, resize, edit and
 * restyle the elements of that type. Subclasses override the defaults below.
 */
export abstract class ElementKind<E extends CanvasElement = CanvasElement> {
  /** The stored `type` of the elements this kind handles. */
  abstract readonly type: E["type"];
  /** Human name, e.g. "Sticky note". Also names the text editor ("Sticky note text"). */
  abstract readonly label: string;
  /** One sentence for tooltips and listings. */
  abstract readonly description: string;
  /** The tool that creates it, if any. Its shortcut (from the keymap) is the element's hotkey. */
  readonly tool: ToolId | null = null;
  /** The type's default values (see its `<type>.defaults.ts`). */
  readonly defaults: ElementDefaults = {};
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
    return { x: spec.x, y: spec.y, w: spec.w ?? size.w, h: spec.h ?? size.h };
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
  restyle(_el: E, _options: Partial<ToolOptions>): ElementPatch<E> {
    return {};
  }
}
