import type { Point, Rect } from "@canvas";

import type { FrameElement } from "../../../frame";
import type { ItemTargetsInput, PageItemTarget } from "./page-item-definition.types";

function half(frame: Rect, side: "left" | "right"): Rect {
  const w = frame.w / 2;
  return { x: side === "left" ? frame.x : frame.x + w, y: frame.y, w, h: frame.h };
}

/**
 * The pages of `frame` that page items go on: a master's side; a page's frame (any of its
 * options) on the side of the spine it prints; both halves of a spread frame. Empty when the
 * frame is neither a master nor a page of the brochure.
 */
export function itemTargets(frame: FrameElement, input: ItemTargetsInput): PageItemTarget[] {
  const master = input.masters.find((item) => item.left === frame.id || item.right === frame.id);
  if (master) {
    return [{ frame, area: frame, side: master.left === frame.id ? "left" : "right" }];
  }
  const page = input.pages.find((item) => item.options.some((option) => option.id === frame.id));
  if (!page) return [];
  const index = input.layout.sides.findIndex(
    (side) => side.kind === "page" && side.page.slot.id === page.slot.id && side.part !== "right",
  );
  const side = input.layout.sides[index];
  if (side?.kind === "page" && side.part === "left") {
    return [
      { frame, area: half(frame, "left"), side: "left" },
      { frame, area: half(frame, "right"), side: "right" },
    ];
  }
  return [{ frame, area: frame, side: input.numbers[index]?.parity ?? "right" }];
}

/** The page of `frame` under world point `at` (a spread frame's half), `null` for none. */
export function itemTargetAt(
  frame: FrameElement,
  input: ItemTargetsInput,
  at: Point,
): PageItemTarget | null {
  return (
    itemTargets(frame, input).find(
      ({ area }) =>
        at.x >= area.x && at.x <= area.x + area.w && at.y >= area.y && at.y <= area.y + area.h,
    ) ?? null
  );
}
