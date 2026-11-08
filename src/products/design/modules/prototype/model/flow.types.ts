import type { CanvasElement, ElementDefaults } from "@canvas";

/** What a flow plays on, which decides the device's chrome in the player. */
export type PrototypePlatform = "mobile" | "tablet" | "desktop" | "web";

/** How a phone or tablet is held (other platforms ignore it). */
export type PrototypeOrientation = "portrait" | "landscape";

/**
 * A flow: a named starting screen with the device it plays on. A record in the document, never on
 * a page's canvas, drawn or hit; a design page can hold several. Edited through `DESIGN_PROTOTYPE`.
 */
export interface PrototypeFlowElement extends CanvasElement {
  type: "prototype-flow";
  name: string;
  /** The design page it belongs to (named `page`, not `pageId`, so it's never taken for a node). */
  page: string;
  /** A screen of that page. */
  start: string;
  platform: PrototypePlatform;
  /** An id of `PROTOTYPE_DEVICES[platform]`. */
  device: string;
  /** Mobile and tablet; ignored otherwise. */
  orientation: PrototypeOrientation;
  /** A missed click flashes the hotspots. */
  hints: boolean;
}

/** A platform and one of its devices. */
export interface PrototypeFlowDevice {
  platform: PrototypePlatform;
  device: string;
}

/** What `DesignPrototype.updateFlow` changes. */
export type PrototypeFlowPatch = Partial<Omit<PrototypeFlowElement, "id" | "type">>;

export interface PrototypeFlowDefaults extends ElementDefaults {
  orientation: PrototypeOrientation;
  hints: boolean;
}
