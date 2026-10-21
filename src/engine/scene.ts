import type { BoardDocument, Shape } from "./document";
import { rectsIntersect, unionRects, type Point, type Rect } from "./geometry";
import { shapeBounds, topmostShapeAt } from "./hit-test";
import { buildOverlayState, type OverlayState } from "./render";
import { Selection } from "./selection";

/**
 * What's on the board right now and what the user is pointing at: the z-ordered shape list,
 * the selection, hover and marquee. Answers spatial queries for tools and the renderer.
 */
export class Scene {
  readonly selection = new Selection();
  private list: Shape[] = [];
  private hoverId: string | null = null;
  marquee: Rect | null = null;

  constructor(private readonly doc: BoardDocument) {}

  /** Shapes sorted bottom-to-top. */
  get shapes(): readonly Shape[] {
    return this.list;
  }

  /** Re-reads the shape list from the document. */
  refresh(): void {
    this.list = this.doc.all();
  }

  /** Topmost shape at a world point. `tolerance` is in world units. */
  shapeAt(world: Point, tolerance: number): Shape | undefined {
    return topmostShapeAt(this.list, world, tolerance);
  }

  shapesInRect(rect: Rect): Shape[] {
    return this.list.filter((shape) => rectsIntersect(shapeBounds(shape), rect));
  }

  /** Bounding box of all shapes, or `null` for an empty board. */
  contentBounds(): Rect | null {
    return unionRects(this.list.map(shapeBounds));
  }

  /** Returns whether the hover target changed. */
  setHover(id: string | null): boolean {
    if (this.hoverId === id) return false;
    this.hoverId = id;
    return true;
  }

  overlay(): OverlayState {
    const selected = this.list.filter((shape) => this.selection.has(shape.id));
    const hover = this.hoverId ? this.doc.get(this.hoverId) : undefined;
    return buildOverlayState(selected, hover, this.marquee);
  }
}
