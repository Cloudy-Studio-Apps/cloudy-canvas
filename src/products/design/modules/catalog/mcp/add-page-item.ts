import { optionalChoice, optionalNumber, type ToolArgs } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import {
  insertPageItems,
  isPageFrame,
  itemTargetAt,
  itemTargets,
  mmToUnits,
  PAGE_ITEMS,
  pageNumbers,
  type DesignBrochure,
  type PageItemTarget,
} from "../model";
import { BROCHURE_SCHEMA, POSITION_SCHEMA, requirePagePosition } from "./brochure-args";
import { readMaster } from "./master-args";

const ITEM_IDS = PAGE_ITEMS.map((item) => item.id);
const SIDES = ["left", "right", "both"] as const;

export const ADD_PAGE_ITEM_DESCRIPTION =
  "Adds a ready-made page item to a master (`master` and `side`: `left`, `right` or `both`, " +
  "the default) or to one page (`position`, from 1; on a spread frame `side` picks a half, " +
  'both by default), in one undo step. Items: `page-number` ({page}), `page-of` ("Page ' +
  "{page} of {pages}\"), `title` ({title}, the brochure's name), `section` ({section}, the " +
  "page's section), `folio` (\"{section} · {page}\"), `date` ({date}, today in the app's " +
  "language) and `toc` ({toc}, the table of contents: a line per section, or per page, with " +
  "its number). Each is a text whose tokens are filled in on every page; on a master the text " +
  "shows the tokens. Headers and footers sit in the margin against the edge their item says " +
  "(away from the spine, centered or by it), the contents fill the page's width from its top " +
  "margin; give `x` and `y` (world units) to center it there instead. Returns the new texts' ids.";

export const ADD_PAGE_ITEM_SCHEMA = {
  type: "object",
  required: ["brochure", "item"],
  properties: {
    item: { enum: ITEM_IDS },
    master: { type: "string", description: "A master's id (get_brochure)." },
    side: { enum: SIDES },
    position: POSITION_SCHEMA,
    x: { type: "number" },
    y: { type: "number" },
    brochure: BROCHURE_SCHEMA,
  },
};

/** `add_page_item`: checks every argument, then inserts the item (see the description). */
export function addPageItem(
  engine: DesignWorkspace,
  brochure: DesignBrochure,
  args: ToolArgs,
): string[] {
  const itemId = optionalChoice(args, "item", ITEM_IDS);
  const item = PAGE_ITEMS.find((entry) => entry.id === itemId);
  if (!item) throw new Error(`Give "item": one of ${ITEM_IDS.join(", ")}.`);
  const onMaster = "master" in args;
  if (onMaster === "position" in args) throw new Error('Give "master" or "position", not both.');
  const side = optionalChoice(args, "side", SIDES) ?? "both";
  const x = optionalNumber(args, "x");
  const y = optionalNumber(args, "y");
  if ((x === undefined) !== (y === undefined))
    throw new Error('Give both "x" and "y", or neither.');
  const at = x !== undefined && y !== undefined ? { x, y } : undefined;

  const record = brochure.record();
  const layout = brochure.layout();
  const input = {
    pages: brochure.pages(),
    layout,
    numbers: record ? pageNumbers(layout, record) : [],
    masters: brochure.masters.list(),
  };
  let frames: string[];
  if (onMaster) {
    const master = readMaster(brochure, args);
    const ids = side === "both" ? [master.left, master.right] : [master[side]];
    frames = ids.filter((id): id is string => id !== null);
    if (frames.length === 0) throw new Error(`The master has no ${side} frame any more.`);
  } else {
    frames = [requirePagePosition(brochure, args).frame.id];
  }

  let targets: PageItemTarget[] = frames.flatMap((id) => {
    const frame = engine.doc.get(id);
    return isPageFrame(frame) ? itemTargets(frame, input) : [];
  });
  if (!onMaster && side !== "both") targets = targets.filter((target) => target.side === side);
  if (targets.length === 0) throw new Error("There's no page there to put it on.");
  if (at) {
    const target = targets.map((t) => itemTargetAt(t.frame, input, at)).find((t) => t !== null);
    if (!target) throw new Error('"x", "y" isn\'t on that page.');
    targets = [target];
  }
  return insertPageItems(engine.doc, item, targets, mmToUnits(brochure.settings().margin), at);
}
