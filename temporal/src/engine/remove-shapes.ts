import { connectorEndpoints } from "./connectors";
import { pruneRefs } from "./db";
import { pruneEr } from "./er";
import { isConnector, type BoardDocument, type ConnectorEnd } from "./document";
import type { Point } from "./geometry.types";
import type { Scene } from "./scene";

/**
 * Removes shapes as one undo step. Connectors attached to a removed shape keep their end where it
 * was (now free), database relations pointing at removed tables are cleared, and ER attributes and
 * participants of removed shapes go with them.
 */
export function removeShapes(doc: BoardDocument, scene: Scene, ids: Iterable<string>): void {
  const removing = new Set(ids);
  doc.checkpoint();
  doc.batch(() => {
    for (const id of scene.connectorsAttachedTo(removing)) {
      const raw = doc.get(id);
      const resolved = scene.get(id);
      if (removing.has(id) || !isConnector(raw) || !isConnector(resolved)) continue;
      const points = connectorEndpoints(resolved);
      doc.update(id, {
        start: detach(raw.start, points.start, removing),
        end: detach(raw.end, points.end, removing),
      });
    }
    doc.remove(removing);
    pruneRefs(doc);
    pruneEr(doc);
  });
}

function detach(end: ConnectorEnd, at: Point, removing: ReadonlySet<string>): ConnectorEnd {
  if (!end.shapeId || !removing.has(end.shapeId)) return end;
  return { shapeId: null, side: null, x: at.x, y: at.y };
}
