import type { Point } from "@canvas";

import { solidPaint } from "../../core";
import { createFrame, type FrameElement } from "../../frame";
import { SHEET_LOOK } from "./sheet-look";
import type { SheetFrame, TokenSheet } from "./sheet.types";

/** The auto layout every sheet keeps (regenerating sets it again). */
export const SHEET_LAYOUT: NonNullable<FrameElement["layout"]> = {
  direction: "vertical",
  wrap: false,
  gap: SHEET_LOOK.groupGap,
  counterGap: SHEET_LOOK.groupGap,
  padding: {
    top: SHEET_LOOK.padding,
    right: SHEET_LOOK.padding,
    bottom: SHEET_LOOK.padding,
    left: SHEET_LOOK.padding,
  },
  align: "start",
  counterAlign: "start",
  strokesIncluded: false,
  reverseStacking: false,
};

/** A new live element showing `source`, at `at` (its top-left corner), not yet generated. */
export function createSheet(
  source: Pick<TokenSheet, "category" | "group">,
  name: string,
  at: Point,
  index: string,
  parentId: string | null,
  look: Partial<Pick<TokenSheet, "template" | "options" | "modeView">> = {},
): SheetFrame {
  const frame = createFrame({ x: at.x, y: at.y, w: 1, h: 1 }, name, index, parentId);
  return {
    ...frame,
    fills: [solidPaint(SHEET_LOOK.surface)],
    cornerRadius: 0,
    clipsContent: false,
    layout: SHEET_LAYOUT,
    sizing: { h: "hug", v: "hug" },
    sheet: {
      category: source.category,
      ...(source.group ? { group: source.group } : {}),
      template: look.template ?? null,
      options: look.options ?? null,
      modeView: look.modeView ?? "current",
      hash: "",
    },
  };
}
