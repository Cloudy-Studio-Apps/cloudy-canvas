import type { CanvasEngine } from "@canvas";

import { nodeInteractions, screenOf } from "../../model";
import type { PageLink } from "./link-path.types";

/** The nodes of a page's screens that have interactions, in drawing order. */
export function collectLinks(engine: CanvasEngine, screenIds: ReadonlySet<string>): PageLink[] {
  const links: PageLink[] = [];
  for (const el of engine.elements()) {
    const interactions = nodeInteractions(el);
    if (interactions.length === 0) continue;
    const screen = screenOf(engine.doc, el.id);
    if (screen && screenIds.has(screen.id)) {
      links.push({ id: el.id, screenId: screen.id, interactions });
    }
  }
  return links;
}
