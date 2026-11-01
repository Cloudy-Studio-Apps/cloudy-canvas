import type { CanvasElement } from "../../elements";
import type { ExportHost } from "../export.types";

/**
 * `found` split into a PDF's pages: one for each of the product's frames among them (a board's
 * sections), in the product's order, then one for what's in none of them, so nothing is left out.
 * A frame inside another shows on that one's page. Empty when `found` holds no frames.
 */
export function pdfPageGroups(
  host: Pick<ExportHost, "elementsOf" | "frames">,
  found: readonly CanvasElement[],
): CanvasElement[][] {
  const inArea = new Set(found.map((el) => el.id));
  const frames = host
    .frames()
    .filter((frame) => inArea.has(frame.id))
    .map((frame) => ({
      id: frame.id,
      elements: host.elementsOf("board", [frame.id]).filter((el) => inArea.has(el.id)),
    }));
  const pages = frames.filter(
    (frame) =>
      !frames.some((other) => other !== frame && other.elements.some((el) => el.id === frame.id)),
  );
  if (pages.length === 0) return [];
  const placed = new Set(pages.flatMap((page) => page.elements.map((el) => el.id)));
  const rest = found.filter((el) => !placed.has(el.id));
  return [...pages.map((page) => page.elements), ...(rest.length > 0 ? [rest] : [])];
}
