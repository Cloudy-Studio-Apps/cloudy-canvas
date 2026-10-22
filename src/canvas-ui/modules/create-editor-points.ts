import { definePoint } from "@shared/core";

import type { EditorPoints } from "./editor-points.types";

/** A product's editor points, named `<product>.editor.<point>`. */
export function createEditorPoints(product: string): EditorPoints {
  const id = (name: string) => `${product}.editor.${name}`;
  return {
    tools: definePoint(id("tools"), { keyOf: (entry) => entry.tool }),
    toolPanels: definePoint(id("toolPanels"), { keyOf: (entry) => entry.tool }),
    selectionPanels: definePoint(id("selectionPanels"), { keyOf: (entry) => entry.type }),
    sidePanels: definePoint(id("sidePanels"), { keyOf: (entry) => entry.id }),
    topBar: definePoint(id("topBar"), { keyOf: (entry) => entry.id }),
    overlays: definePoint(id("overlays"), { keyOf: (entry) => entry.id }),
    sessionHooks: definePoint(id("sessionHooks"), { keyOf: (entry) => entry.id }),
    contextMenu: definePoint(id("contextMenu"), { keyOf: (entry) => entry.id }),
    toolbars: definePoint(id("toolbars"), { keyOf: (entry) => entry.id }),
  };
}
