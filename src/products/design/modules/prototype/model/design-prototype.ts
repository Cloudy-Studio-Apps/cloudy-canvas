import { createElementBase, defineService, keyBetween, type CanvasDocument } from "@canvas";

import { t } from "../prototype.i18n";
import { PROTOTYPE_FLOW_TYPE } from "../prototype.constants";
import { defaultFlowDevice, firstDevice } from "./devices";
import { PROTOTYPE_FLOW_DEFAULTS } from "./flow.defaults";
import type { PrototypeFlowElement, PrototypeFlowPatch } from "./flow.types";
import type { PrototypeInteraction } from "./interaction.types";
import { isFlow } from "./is-flow";
import { nodeInteractions } from "./node-interactions";
import { isScreen } from "./screens";
import { interactionsPatch, writeInteractions } from "./write-interactions";

const byIndex = (a: PrototypeFlowElement, b: PrototypeFlowElement): number =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : 0;

/**
 * The design's prototype: its flows (records, several per design page) and its nodes'
 * interactions. The only place that edits them, one undo step each (every write checkpoints first).
 */
export class DesignPrototype {
  constructor(private readonly doc: CanvasDocument) {}

  /** A design page's flows, in order. */
  flows(page: string): PrototypeFlowElement[] {
    return this.allFlows().filter((flow) => flow.page === page);
  }

  /** A flow by id, or `null` when there's none. */
  flow(id: string): PrototypeFlowElement | null {
    const el = this.doc.get(id);
    return isFlow(el) ? el : null;
  }

  /**
   * Adds a flow starting at the screen `start` of the design page `page`, named `name` or after
   * the screen, on the device its size suggests (`defaultFlowDevice`). Returns it.
   */
  addFlow(page: string, start: string, name?: string): PrototypeFlowElement {
    const screen = this.doc.get(start);
    if (!isScreen(screen) || screen.pageId !== page) {
      throw new Error(`"${start}" isn't a screen of the page "${page}".`);
    }
    const last = this.allFlows().at(-1);
    const flow: PrototypeFlowElement = {
      ...createElementBase(
        PROTOTYPE_FLOW_TYPE,
        { x: 0, y: 0, w: 0, h: 0 },
        keyBetween(last?.index ?? null, null),
      ),
      name: name?.trim() || t("flow.defaultName", { screen: screen.name }),
      page,
      start,
      ...defaultFlowDevice(screen),
      ...PROTOTYPE_FLOW_DEFAULTS,
    };
    this.doc.checkpoint();
    this.doc.add(flow);
    return flow;
  }

  /**
   * Changes a flow (an empty name is ignored). A new `platform` without a `device` gets that
   * platform's first device.
   */
  updateFlow(id: string, patch: PrototypeFlowPatch): void {
    const flow = this.require(id);
    const next: PrototypeFlowPatch = { ...patch };
    if (next.name !== undefined) {
      const name = next.name.trim();
      if (name) next.name = name;
      else delete next.name;
    }
    if (next.platform && next.platform !== flow.platform && next.device === undefined) {
      next.device = firstDevice(next.platform);
    }
    if (Object.keys(next).length === 0) return;
    this.doc.checkpoint();
    this.doc.update(id, next);
  }

  /** Deletes a flow (its screens stay). */
  removeFlow(id: string): void {
    this.require(id);
    this.doc.checkpoint();
    this.doc.remove([id]);
  }

  /** A node's interactions, `[]` for none. */
  interactions(nodeId: string): PrototypeInteraction[] {
    return nodeInteractions(this.doc.get(nodeId));
  }

  /** Replaces a node's interactions (an empty list clears them). */
  setInteractions(nodeId: string, list: readonly PrototypeInteraction[]): void {
    this.doc.checkpoint();
    writeInteractions(this.doc, nodeId, list);
  }

  /** Adds an interaction after a node's others. */
  addInteraction(nodeId: string, ix: PrototypeInteraction): void {
    const list = [...this.interactions(nodeId), ix];
    this.doc.checkpoint();
    writeInteractions(this.doc, nodeId, list);
  }

  /** Clears the interactions of every node of `nodeIds` that has some, in one undo step. */
  removeInteractions(nodeIds: Iterable<string>): void {
    const patches = new Map(
      [...new Set(nodeIds)]
        .filter((id) => this.stores(id))
        .map((id) => [id, interactionsPatch([])]),
    );
    if (patches.size === 0) return;
    this.doc.checkpoint();
    this.doc.updateMany(patches);
  }

  /** The ids of the nodes with an interaction showing the screen `screenId`. */
  linksTo(screenId: string): string[] {
    const ids: string[] = [];
    for (const id of this.doc.ids()) {
      if (!this.stores(id)) continue;
      if (this.interactions(id).some((ix) => ix.to === screenId)) ids.push(id);
    }
    return ids;
  }

  private allFlows(): PrototypeFlowElement[] {
    const flows: PrototypeFlowElement[] = [];
    for (const id of this.doc.ids()) {
      if (this.doc.field(id, "type") !== PROTOTYPE_FLOW_TYPE) continue;
      const el = this.doc.get(id);
      if (isFlow(el)) flows.push(el);
    }
    return flows.sort(byIndex);
  }

  /** Whether a node stores interactions (read without reading the whole node). */
  private stores(id: string): boolean {
    return Array.isArray(this.doc.field(id, "interactions"));
  }

  private require(id: string): PrototypeFlowElement {
    const flow = this.flow(id);
    if (!flow) throw new Error(`There's no prototype flow with the id "${id}".`);
    return flow;
  }
}

/** The design's prototype (`engine.service(DESIGN_PROTOTYPE)`, `useService` in React). */
export const DESIGN_PROTOTYPE = defineService(
  "design.prototype",
  (doc) => new DesignPrototype(doc),
);
