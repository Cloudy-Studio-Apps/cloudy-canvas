import type { CanvasDocument } from "@canvas";

import { isDesignNode, nodePaintStacks } from "../../core";
import { countedUse } from "../../pages";
import { normalizeColorHex } from "../color";
import type { FileFill } from "./sources.types";

/**
 * The solid colors the user's layers paint without a variable (fills, strokes and vectors' areas'
 * own fills, visible ones),
 * each with every paint using it, most used first. Layers on pages a feature keeps (the design
 * system's) don't count.
 */
export function collectFills(doc: CanvasDocument): FileFill[] {
  const counts = countedUse(doc);
  const byHex = new Map<string, FileFill>();
  for (const el of doc.all()) {
    if (!isDesignNode(el) || !counts(el.id)) continue;
    for (const stack of nodePaintStacks(el)) {
      stack.paints.forEach((paint, i) => {
        if (paint.type !== "solid" || !paint.visible || paint.opacity === 0) return;
        const path = `${stack.path}.${i}.color`;
        if (el.bindings?.[path]) return;
        const hex = normalizeColorHex(paint.color);
        if (!hex) return;
        const fill = byHex.get(hex) ?? { hex, refs: [] };
        fill.refs.push({ nodeId: el.id, path });
        byHex.set(hex, fill);
      });
    }
  }
  return [...byHex.values()].sort((a, b) => b.refs.length - a.refs.length);
}
