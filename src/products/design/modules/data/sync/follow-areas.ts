import type { CanvasDocument, EditedChange, ElementPatch } from "@canvas";

import { networkOf, regionIndexMap } from "../../core";
import { dataFieldsOf, type DataBinding } from "../bindings";

const AREA_PATH = /^network\.regions\.(\d+)\.fills(\..*)?$/;

/**
 * Data bindings on a vector's areas (`network.regions.<i>.fills…`) after an edit changed its
 * network: they follow their area when areas were added or removed (`regionIndexMap`, by the
 * areas' ids), and go when their area is gone or shows the layer's fills again ("Use layer fill"),
 * as there's nothing of its own left to write.
 */
export function followAreas(doc: CanvasDocument, change: EditedChange): void {
  const patches = new Map<string, ElementPatch>();
  for (const [id, before] of change.before) {
    if (!("network" in before)) continue;
    const el = doc.get(id);
    const bindings = el ? dataFieldsOf(el).dataBindings : undefined;
    const prev = networkOf(before);
    const next = el ? networkOf(el) : null;
    if (!bindings || !prev || !next) continue;
    const map = regionIndexMap(prev, next);
    const kept: Record<string, DataBinding> = {};
    let changed = false;
    for (const [path, binding] of Object.entries(bindings)) {
      const area = AREA_PATH.exec(path);
      if (!area) {
        kept[path] = binding;
        continue;
      }
      const moved = map(Number(area[1]));
      if (moved === null || !next.regions[moved]?.fills) {
        changed = true;
        continue;
      }
      const target = `network.regions.${moved}.fills${area[2] ?? ""}`;
      if (target !== path) changed = true;
      kept[target] = binding;
    }
    if (changed) patches.set(id, { dataBindings: kept } as ElementPatch);
  }
  if (patches.size > 0) doc.updateMany(patches);
}
