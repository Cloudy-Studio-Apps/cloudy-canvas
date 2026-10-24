import { canvasBlob, type Size } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import {
  brochurePageSize,
  sideWidth,
  type BookLayout,
  type BookSide,
  type DesignBrochure,
} from "../model";
import { drawFrame } from "./draw-frame";
import type { BrochureSheetOptions, SheetCell } from "./brochure-sheet.types";

/** The picture's colors (an exported image, not the app's theme): paper, the gaps and the numbers. */
const PAPER = "#ffffff";
const BACKGROUND = "#e6e8ec";
const SPINE = "rgba(0, 0, 0, 0.18)";
const LABEL = "#5a6270";
/** Spreads per row of a contact sheet. */
const BOOK_COLUMNS = 4;
const SINGLE_COLUMNS = 6;
/** The gap round the spreads and the room for their numbers, as a fraction of a page's height. */
const GAP = 0.08;
const LABEL_ROOM = 0.1;
/** Never drawn larger than this many pixels per world unit (one spread alone stays sharp). */
const MAX_SCALE = 2;

/**
 * A PNG of spreads as the brochure is read: each spread's sides as they lie across the spine
 * (covers alone on their side, a spread frame's halves meeting, blank pages as paper), or one at a
 * time in the single layout, in rows with each spread's page numbers under it. Frames are drawn on
 * the brochure's design page one at a time; the workspace is left on the page it was on.
 */
export async function drawBrochureSheet(
  workspace: DesignWorkspace,
  brochure: DesignBrochure,
  { spreads, maxSide }: BrochureSheetOptions,
): Promise<Blob> {
  const pages = brochure.pages();
  const page = brochurePageSize(pages);
  if (!page || spreads.length === 0) throw new Error("The brochure has no pages yet.");
  const layout = brochure.layout();
  const single = brochure.settings().layout === "single";

  const cellWidth = single
    ? Math.max(page.w, ...layout.sides.map((side) => sideWidth(side, page)))
    : page.w * 2;
  const gap = page.h * GAP;
  const room = page.h * LABEL_ROOM;
  const columns = Math.min(spreads.length, single ? SINGLE_COLUMNS : BOOK_COLUMNS);
  const rows = Math.ceil(spreads.length / columns);
  const width = columns * cellWidth + (columns + 1) * gap;
  const height = rows * (page.h + room) + (rows + 1) * gap;
  const scale = Math.min(MAX_SCALE, maxSide / Math.max(width, height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The picture couldn't be drawn.");
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const scope = workspace.scope;
  try {
    for (const [i, spread] of spreads.entries()) {
      const origin = {
        x: gap + (i % columns) * (cellWidth + gap),
        y: gap + Math.floor(i / columns) * (page.h + room + gap),
      };
      const cells = spreadCells(layout, spread, page, single, cellWidth);
      for (const { side, cell } of cells) {
        const box = {
          x: (origin.x + cell.x) * scale,
          y: (origin.y + cell.y) * scale,
          w: cell.w * scale,
          h: cell.h * scale,
        };
        await drawSide(context, workspace, side, box, scale);
      }
      if (!single && cells.length === 2) {
        context.fillStyle = SPINE;
        context.fillRect((origin.x + page.w) * scale - 1, origin.y * scale, 2, page.h * scale);
      }
      context.fillStyle = LABEL;
      context.font = `${Math.max(10, room * 0.55 * scale)}px sans-serif`;
      context.textAlign = "center";
      context.fillText(
        layout.spreadNumbers[spread] ?? "",
        (origin.x + cellWidth / 2) * scale,
        (origin.y + page.h + room * 0.7) * scale,
      );
    }
  } finally {
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
  return canvasBlob(canvas, "image/png");
}

/** Where each side of a spread lies in its cell: across the spine, or centered on its own. */
function spreadCells(
  layout: BookLayout,
  spread: number,
  page: Size,
  single: boolean,
  cellWidth: number,
): { side: BookSide; cell: SheetCell }[] {
  return (layout.spreads[spread] ?? []).flatMap((index) => {
    const side = layout.sides[index];
    if (!side) return [];
    const w = sideWidth(side, page);
    const onLeft = (index + layout.offset) % 2 === 0;
    const x = single ? (cellWidth - w) / 2 : onLeft ? 0 : page.w;
    return [{ side, cell: { x, y: 0, w, h: page.h } }];
  });
}

async function drawSide(
  context: CanvasRenderingContext2D,
  workspace: DesignWorkspace,
  side: BookSide,
  box: SheetCell,
  scale: number,
): Promise<void> {
  if (side.kind === "blank") {
    context.fillStyle = PAPER;
    context.fillRect(box.x, box.y, box.w, box.h);
    return;
  }
  const file = await drawFrame(workspace, side.page.frame, { scale }, side.part);
  const bitmap = await createImageBitmap(file);
  context.drawImage(bitmap, box.x, box.y, box.w, box.h);
  bitmap.close();
}
