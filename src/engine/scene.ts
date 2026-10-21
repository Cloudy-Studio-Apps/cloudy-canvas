import { draftPath, resolveRelations, type Relation } from "./db";
import { resolveConnector } from "./connectors";
import { isConnector, isDbTable, type BoardDocument, type Shape } from "./document";
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
  private byId = new Map<string, Shape>();
  /** Shape id → ids of the connectors attached to it. */
  private attachments = new Map<string, Set<string>>();
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

  /**
   * Re-reads the shape list from the document. Connectors are resolved against the shapes they're
   * attached to, so the list always holds their current route and bounds.
   */
  refresh(): void {
    const raw = this.doc.all();
    const rawById = new Map(raw.map((shape) => [shape.id, shape]));
    this.attachments.clear();
    this.list = raw.map((shape) => {
      if (!isConnector(shape)) return shape;
      for (const id of [shape.start.shapeId, shape.end.shapeId]) {
        if (id) this.attach(id, shape.id);
      }
      return resolveConnector(shape, (id) => rawById.get(id));
    });
    this.byId = new Map(this.list.map((shape) => [shape.id, shape]));
    this.relationList = resolveRelations(this.list);
  }

  /** A shape as the scene sees it (connectors resolved). */
  get(id: string): Shape | undefined {
    return this.byId.get(id);
  }

  /** Connectors attached to any of the shapes. */
  connectorsAttachedTo(ids: Iterable<string>): Set<string> {
    const result = new Set<string>();
    for (const id of ids) {
      for (const connector of this.attachments.get(id) ?? []) result.add(connector);
    }
    return result;
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

  overlay(zoom: number): OverlayState {
    return buildOverlayState({
      selected: this.list.filter((shape) => this.selection.has(shape.id)),
      hover: this.hoverId ? this.byId.get(this.hoverId) : undefined,
      marquee: this.marquee,
      dropTarget: this.dropTarget,
      zoom,
    });
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

  private attach(shapeId: string, connectorId: string): void {
    let set = this.attachments.get(shapeId);
    if (!set) this.attachments.set(shapeId, (set = new Set()));
    set.add(connectorId);
  }
}
