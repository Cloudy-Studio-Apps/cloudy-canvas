import {
  FigImportContext,
  guidKey,
  type FigGuid,
  type FigMatrix,
  type FigNode,
} from "@canvas/figma";

/**
 * What converting a FigJam file's nodes shares (its blobs, images and warnings), plus where each
 * node went: its world transform, and the element it became, so connectors can find their ends.
 */
export class FigJamContext extends FigImportContext {
  private readonly worlds = new Map<string, FigMatrix>();
  private readonly ids = new Map<string, string>();

  /** Remembers where `node` is in the world. */
  visit(node: FigNode, world: FigMatrix): void {
    this.worlds.set(guidKey(node.guid), world);
  }

  /** Remembers that `node` became the element `id`; connectors stick to it unless it's not `connectable`. */
  place(node: FigNode, id: string, connectable = true): void {
    if (connectable) this.ids.set(guidKey(node.guid), id);
  }

  worldOf(guid: FigGuid | undefined): FigMatrix | null {
    return this.worlds.get(guidKey(guid)) ?? null;
  }

  /** The element the node became, or `null` when it became none a connector sticks to. */
  elementOf(guid: FigGuid | undefined): string | null {
    return this.ids.get(guidKey(guid)) ?? null;
  }
}
