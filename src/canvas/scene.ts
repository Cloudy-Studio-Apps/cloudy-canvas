import type { CanvasDocument } from "./document";
import { zOrderKey, type CanvasElement, type ElementKind, type ElementKinds } from "./elements";
import { rectContainsRect, rectsIntersect, unionRects } from "./geometry";
import type { Point, Rect } from "./geometry.types";
import { buildOverlayState, type OverlayState } from "./render";
import { Selection } from "./selection";

/**
 * What's on the canvas right now and what the user is pointing at: the z-ordered element list,
 * the selection, hover and marquee. Answers spatial queries for tools and the renderer.
 */
export class Scene {
  readonly selection = new Selection();
  private list: CanvasElement[] = [];
  private byId = new Map<string, CanvasElement>();
  private derived: string[] = [];
  private hoverId: string | null = null;
  marquee: Rect | null = null;

  constructor(
    private readonly doc: CanvasDocument,
    private readonly kinds: ElementKinds,
    /** The product's `resolveElements`, if any. */
    private readonly resolve?: (elements: CanvasElement[]) => CanvasElement[],
  ) {}

  /** Elements sorted bottom-to-top. */
  get elements(): readonly CanvasElement[] {
    return this.list;
  }

  /**
   * Re-reads the element list from the document, with derived geometry resolved, in drawing
   * order. Read elements here, not from the document, when their geometry matters.
   */
  refresh(): void {
    const raw = this.doc.all();
    const resolved = this.resolve ? this.resolve(raw) : raw;
    this.derived = resolved.filter((el, i) => el !== raw[i]).map((el) => el.id);
    const keys = new Map(resolved.map((el) => [el.id, zOrderKey(el, this.kinds.kindOf(el))]));
    this.list = resolved.sort((a, b) => {
      const ka = keys.get(a.id)!;
      const kb = keys.get(b.id)!;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    this.byId = new Map(this.list.map((el) => [el.id, el]));
  }

  /** Ids of elements whose geometry the product derives from others (see `resolveElements`). */
  get derivedIds(): readonly string[] {
    return this.derived;
  }

  get(id: string): CanvasElement | undefined {
    return this.byId.get(id);
  }

  /** Topmost element at a world point. `tolerance` is in world units. */
  elementAt(world: Point, tolerance: number): CanvasElement | undefined {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const el = this.list[i]!;
      if (this.kinds.kindOf(el).hitTest(el, world, tolerance)) return el;
    }
    return undefined;
  }

  /** Elements touching the rect. Frames only count when the rect encloses them. */
  elementsInRect(rect: Rect): CanvasElement[] {
    return this.list.filter((el) => {
      const kind = this.kinds.kindOf(el);
      const bounds = kind.bounds(el);
      return kind.frame ? rectContainsRect(rect, bounds) : rectsIntersect(bounds, rect);
    });
  }

  /** Bounding box of all elements, or `null` for an empty canvas. */
  contentBounds(): Rect | null {
    return unionRects(this.list.map((el) => this.kinds.kindOf(el).bounds(el)));
  }

  /** The kind of an element on the canvas. */
  kindOf<E extends CanvasElement>(el: E): ElementKind<E> {
    return this.kinds.kindOf(el);
  }

  get hoveredId(): string | null {
    return this.hoverId;
  }

  /** Returns whether the hover target changed. */
  setHover(id: string | null): boolean {
    if (this.hoverId === id) return false;
    this.hoverId = id;
    return true;
  }

  overlay(zoom: number): OverlayState {
    return buildOverlayState({
      kinds: this.kinds,
      selected: this.list.filter((el) => this.selection.has(el.id)),
      part: this.selection.part,
      hover: this.hoverId ? this.byId.get(this.hoverId) : undefined,
      marquee: this.marquee,
      zoom,
    });
  }
}
