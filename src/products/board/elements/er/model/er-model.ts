import { createId } from "@shared/core";
import { DocumentFeed, type CanvasDocument, type Point } from "@canvas";

import { isErElement } from "../base/is-er-element";
import type { ErElement } from "../base/er.types";
import { freeName } from "../../../modules/db";
import { createErEntity } from "../entity/entity.factory";
import { entitySize } from "../base/er-size";
import { freeOrigin } from "./apply-er-plan";
import { ErDiagram } from "./er-diagram";
import { erDiagrams, erShapes } from "./er-shapes";
import type { ErDiagramInfo } from "./er-shapes.types";
import { withErMembers } from "./er-members";
import { pruneEr } from "./prune-er";

/**
 * The board's ER diagrams. A board can hold several, each with its own text, layout and names;
 * `diagram(id)` reads and edits one. Notifies when any ER element changes. Boards from before
 * diagrams existed are sorted into diagrams when they load (`migrateErDiagrams`).
 */
export class ErModel {
  private readonly cache = new Map<string, ErDiagram>();
  private readonly feed: DocumentFeed;

  constructor(private readonly doc: CanvasDocument) {
    this.feed = new DocumentFeed(
      doc,
      (change) =>
        change.removed.size > 0 || [...change.updated].some((id) => isErElement(doc.get(id))),
    );
  }

  /** Notifies when a diagram changes (works with React's `useSyncExternalStore`). */
  subscribe = (listener: () => void): (() => void) => this.feed.subscribe(listener);

  getVersion = (): number => this.feed.getVersion();

  /** One diagram by id (an empty one when nothing on the board belongs to it yet). */
  diagram = (id: string): ErDiagram => {
    let diagram = this.cache.get(id);
    if (!diagram) {
      diagram = new ErDiagram(this.doc, id);
      this.cache.set(id, diagram);
    }
    return diagram;
  };

  /** The board's diagrams, in board order. */
  diagrams = (): ErDiagramInfo[] => erDiagrams(this.doc);

  /** The diagram an ER shape belongs to. */
  diagramOf = (shapeId: string): string | null => this.shape(shapeId)?.diagram ?? null;

  shape(id: string): ErElement | undefined {
    const shape = this.doc.get(id);
    return isErElement(shape) ? shape : undefined;
  }

  /** Removes a shape and what belongs to it (its attributes; a hierarchy's discriminator…). */
  remove = (id: string): void => {
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.doc.remove(withErMembers([id], this.doc.all(), false));
      pruneEr(this.doc);
    });
  };

  /**
   * Starts a new diagram with one entity centered on `center` (by default right of everything on
   * the board); returns the entity's id.
   */
  newDiagram(center?: Point): string {
    const name = freeName(erShapes(this.doc).entities, "entity");
    const at = center ?? besideBoard(this.doc);
    const shape = {
      ...createErEntity(at, name, this.doc.nextIndex()),
      diagram: createId(),
      diagramName: "",
    };
    this.doc.checkpoint();
    this.doc.add(shape);
    return shape.id;
  }
}

/** Where a new diagram's first entity goes when no point is given. */
function besideBoard(doc: CanvasDocument): Point {
  const origin = freeOrigin(doc, new Set());
  const size = entitySize("entity");
  return { x: origin.x + size.w / 2, y: origin.y + size.h / 2 };
}
