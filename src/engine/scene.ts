import type { BoardDocument } from "./document";
import { kindOf, type CanvasElement } from "./elements";
import { rectsIntersect, unionRects } from "./geometry";
import type { Point, Rect } from "./geometry.types";
import { buildOverlayState, type OverlayState } from "./render";
import { Selection } from "./selection";

/**
 * What's on the board right now and what the user is pointing at: the z-ordered element list,
 * the selection, hover and marquee. Answers spatial queries for tools and the renderer.
 */
export class Scene {
  readonly selection = new Selection();
  private list: CanvasElement[] = [];
  private byId = new Map<string, CanvasElement>();
  private hoverId: string | null = null;
  marquee: Rect | null = null;

  constructor(private readonly doc: BoardDocument) {}

  /** Elements sorted bottom-to-top. */
  get elements(): readonly CanvasElement[] {
    return this.list;
  }

  /** Re-reads the element list from the document. */
  refresh(): void {
    this.list = this.doc.all();
    this.byId = new Map(this.list.map((el) => [el.id, el]));
  }

  get(id: string): CanvasElement | undefined {
    return this.byId.get(id);
  }

  /** Topmost element at a world point. `tolerance` is in world units. */
  elementAt(world: Point, tolerance: number): CanvasElement | undefined {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const el = this.list[i]!;
      if (kindOf(el).hitTest(el, world, tolerance)) return el;
    }
    return undefined;
  }

  /** Elements touching the rect. */
  elementsInRect(rect: Rect): CanvasElement[] {
    return this.list.filter((el) => rectsIntersect(kindOf(el).bounds(el), rect));
  }

  /** Bounding box of all elements, or `null` for an empty board. */
  contentBounds(): Rect | null {
    return unionRects(this.list.map((el) => kindOf(el).bounds(el)));
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

  overlay(): OverlayState {
    return buildOverlayState({
      selected: this.list.filter((el) => this.selection.has(el.id)),
      hover: this.hoverId ? this.byId.get(this.hoverId) : undefined,
      marquee: this.marquee,
    });
  }
}
