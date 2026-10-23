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
    guides: definePoint(id("guides")),
    drawOrder: definePoint(id("drawOrder")),
    clips: definePoint(id("clips")),
    masks: definePoint(id("masks")),
    effects: definePoint(id("effects")),
    effectRenderers: definePoint(id("effectRenderers"), { keyOf: (renderer) => renderer.type }),
    undrawn: definePoint(id("undrawn")),
    selectTarget: definePoint(id("selectTarget")),
    alignTarget: definePoint(id("alignTarget")),
    editElement: definePoint(id("editElement")),
    rulerFrame: definePoint(id("rulerFrame")),
    frames: definePoint(id("frames")),
    onMoved: definePoint(id("onMoved")),
    afterEdit: definePoint(id("afterEdit")),
    links: definePoint(id("links")),
    resolveElements: definePoint(id("resolveElements")),
    withMembers: definePoint(id("withMembers")),
    onRemove: definePoint(id("onRemove")),
    prepareCopies: definePoint(id("prepareCopies")),
    pasteText: definePoint(id("pasteText")),
    pasteOnto: definePoint(id("pasteOnto")),
    pasteImage: definePoint(id("pasteImage")),
  };
}
