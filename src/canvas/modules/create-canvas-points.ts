import { definePoint } from "@shared/core";

import type { CanvasPoints } from "./canvas-points.types";

/** A product's canvas points, named `<product>.<point>` (e.g. `"board.kinds"`). */
export function createCanvasPoints<O extends object>(product: string): CanvasPoints<O> {
  const id = (name: string) => `${product}.${name}`;
  return {
    kinds: definePoint(id("kinds"), { keyOf: (kind) => kind.type }),
    tools: definePoint(id("tools"), { keyOf: (tool) => tool.id }),
    hostCommands: definePoint(id("hostCommands"), { keyOf: (command) => command.id }),
    keybindings: definePoint(id("keybindings")),
    options: definePoint(id("options")),
    view: definePoint(id("view")),
    scopes: definePoint(id("scopes")),
    drawOrder: definePoint(id("drawOrder")),
    clips: definePoint(id("clips")),
    selectTarget: definePoint(id("selectTarget")),
    editElement: definePoint(id("editElement")),
    onMoved: definePoint(id("onMoved")),
    links: definePoint(id("links")),
    resolveElements: definePoint(id("resolveElements")),
    withMembers: definePoint(id("withMembers")),
    onRemove: definePoint(id("onRemove")),
    prepareCopies: definePoint(id("prepareCopies")),
    pasteText: definePoint(id("pasteText")),
    pasteImage: definePoint(id("pasteImage")),
  };
}
