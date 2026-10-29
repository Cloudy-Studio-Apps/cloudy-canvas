import { compareByIndex, elementBounds, type CanvasElement, type CanvasEngine } from "@canvas";
import { t } from "../../viewer.i18n";
import { viewerPlaceholder } from "../../viewer-placeholder";
import type { PlaceholderSpot } from "../../viewer-placeholder.types";
import type { CollectedElements } from "./collect-elements.types";
import { pluginOfType } from "./plugin-of-type";

/**
 * Every element of the board. Elements of a plugin that doesn't draw in the viewer (no
 * `activateViewer`), and of types nothing registers (a plugin that isn't loaded), become
 * placeholders of the same box.
 */
export function collectElements(engine: CanvasEngine): CollectedElements {
  const elements: CanvasElement[] = [];
  const placeholderSvgs: Record<string, string> = {};
  const placeholders = new Map<string, number>();
  const pluginTypes = new Map<string, Set<string>>();

  const standIn = (spot: PlaceholderSpot, name: string) => {
    const placeholder = viewerPlaceholder(spot, name);
    elements.push(placeholder.element);
    placeholderSvgs[placeholder.assetId] = placeholder.svg;
    placeholders.set(name, (placeholders.get(name) ?? 0) + 1);
  };

  for (const el of engine.elements()) {
    const plugin = pluginOfType(el.type);
    if (!plugin) {
      elements.push(el);
    } else if (plugin.viewerCode) {
      elements.push(el);
      const types = pluginTypes.get(plugin.id) ?? new Set<string>();
      pluginTypes.set(plugin.id, types.add(el.type));
    } else {
      standIn(
        { ...elementBounds(engine.kinds.kindOf(el), el), id: el.id, index: el.index },
        plugin.name,
      );
    }
  }
  for (const spot of engine.doc.unregistered()) standIn(spot, t("placeholder.unknown"));

  elements.sort(compareByIndex);
  return { elements, placeholderSvgs, placeholders, pluginTypes };
}
