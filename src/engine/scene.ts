import { draftPath, resolveRelations, type Relation } from "./db";
import { isDbTable, type BoardDocument, type Shape } from "./document";
import { rectsIntersect, unionRects } from "./geometry";
import type { Point, Rect } from "./geometry.types";
import { shapeBounds, topmostShapeAt } from "./hit-test";
import {
  buildOverlayState,
  type DropTarget,
  type OverlayState,
  type RelationState,
} from "./render";
import { Selection } from "./selection";
import type { DraftRelation } from "./scene.types";

/**
 * What's on the board right now and what the user is pointing at: the z-ordered shape list,
 * the selection, hover and marquee. Answers spatial queries for tools and the renderer.
 */
export class Scene {
  readonly selection = new Selection();
  private list: Shape[] = [];
  private hoverId: string | null = null;
  private relationList: Relation[] = [];
  marquee: Rect | null = null;
  /** Relation being dragged out of a column handle. */
  draftRelation: DraftRelation | null = null;
  /** Column row the dragged relation would connect to. */
  dropTarget: DropTarget | null = null;

  constructor(private readonly doc: BoardDocument) {}

  /** Shapes sorted bottom-to-top. */
  get shapes(): readonly Shape[] {
    return this.list;
  }

  /** Re-reads the shape list from the document. */
  refresh(): void {
    this.list = this.doc.all();
    this.relationList = resolveRelations(this.list);
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
    const selected = this.list.filter((shape) => this.selection.has(shape.id));
    const hover = this.hoverId ? this.doc.get(this.hoverId) : undefined;
    return buildOverlayState(selected, hover, this.marquee, this.dropTarget);
  }

  relations(): RelationState {
    const draft = this.draftRelation;
    const from = draft ? this.doc.get(draft.tableId) : undefined;
    return {
      relations: this.relationList,
      highlighted: this.selection.ids,
      draft: draft && isDbTable(from) ? draftPath(from, draft.row, draft.end) : null,
    };
  }
}
