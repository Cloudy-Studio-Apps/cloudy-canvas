import { createId } from "@core";

import { isErShape, type BoardDocument, type ErShape } from "../document";
import { freeName } from "../db/table-edits";
import type { Point } from "../geometry.types";
import { Emitter } from "../utils";
import { freeOrigin } from "./apply-er-plan";
import { createErEntity } from "./create-er-shapes";
import { ErDiagram } from "./er-diagram";
import { entitySize } from "./er-size";
import { erDiagrams, erShapes } from "./er-shapes";
import type { ErDiagramInfo } from "./er-shapes.types";
import { withErMembers } from "./er-members";
import { migrateErDiagrams } from "./migrate-er-diagrams";
import { pruneEr } from "./prune-er";

/**
 * The board's ER diagrams. A board can hold several, each with its own text, layout and names;
 * `diagram(id)` reads and edits one. Notifies when any ER shape changes.
 */
export class ErModel {
  private readonly emitter = new Emitter();
  private readonly cache = new Map<string, ErDiagram>();
  private version = 0;
  private readonly unobserve: () => void;

  constructor(private readonly doc: BoardDocument) {
    migrateErDiagrams(doc);
    this.unobserve = doc.observe((change) => {
      const touched =
        change.removed.size > 0 || [...change.updated].some((id) => isErShape(doc.get(id)));
      if (!touched) return;
      this.version++;
      this.emitter.emit();
    });
  }

  /** Notifies when a diagram changes (works with React's `useSyncExternalStore`). */
  subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

  getVersion = (): number => this.version;

  destroy(): void {
    this.unobserve();
    this.emitter.clear();
  }

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

  shape(id: string): ErShape | undefined {
    const shape = this.doc.get(id);
    return isErShape(shape) ? shape : undefined;
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
function besideBoard(doc: BoardDocument): Point {
  const origin = freeOrigin(doc, new Set());
  const size = entitySize("entity");
  return { x: origin.x + size.w / 2, y: origin.y + size.h / 2 };
}
