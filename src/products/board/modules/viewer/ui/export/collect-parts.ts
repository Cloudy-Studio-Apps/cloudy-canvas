import type { CanvasDocument } from "@canvas";
import { getBoardModules } from "@board/ui";
import { boardViewerParts } from "../viewer.points";

/** What each viewer part carries in the file, by part id; parts with nothing for the board are left out. */
export function collectParts(doc: CanvasDocument): Record<string, unknown> {
  const parts: Record<string, unknown> = {};
  for (const part of getBoardModules().get(boardViewerParts)) {
    const data = part.collect(doc);
    if (data !== null) parts[part.id] = data;
  }
  return parts;
}
