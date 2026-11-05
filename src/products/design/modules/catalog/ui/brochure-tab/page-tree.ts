import type { BookLayout } from "../../model/book-layout.types";
import type { BrochurePage } from "../../model/brochure-pages.types";
import type { PageInfo } from "../../model/numbering/page-numbers.types";
import type { FolderRow, OpenFolder, PageTreeRow, PendingRow } from "./page-tree.types";

/** Whether a page is in a repeat run of its own: it repeats, or a repeat made it. */
const repeatsItself = (page: BrochurePage) =>
  !!page.slot.repeat || !!page.slot.generated || !!page.pending;

/** The pages that don't print, by the slot of the page before them (`null`: first). */
function notPrintedAfter(pages: readonly BrochurePage[]): Map<string | null, BrochurePage[]> {
  const after = new Map<string | null, BrochurePage[]>();
  let last: string | null = null;
  for (const page of pages) {
    if (!page.notPrinted) {
      last = page.slot.id;
      continue;
    }
    after.set(last, [...(after.get(last) ?? []), page]);
  }
  return after;
}

/**
 * The page list's rows: the layout's sides in order, each section a folder over its pages (its
 * subsections folders inside it, copies of a repeating one included, `BrochurePage.starts`), and
 * with `spreads` a heading before each spread. A section starting on a spread's first side opens
 * before that spread's heading. Pending pages next to each other are one row ("+36 pages at
 * export"), copy sections not made yet included (they get no folder); a template page that
 * doesn't print for its row follows the page before it. A folder closes where its section's pages
 * end (`StartingSection.end`), so pages after a run (the back cover) are in none of its copies; a
 * spread whose pages are all pending gets no heading and shows no blank side, so a run's pending
 * pages stay one row. Rows
 * in a repeat run carry its bracket. What's in a collapsed folder is left out.
 */
export function pageTree(
  layout: BookLayout,
  pages: readonly BrochurePage[],
  numbers: readonly PageInfo[],
  collapsed: ReadonlySet<string>,
  spreads: boolean,
): PageTreeRow[] {
  const unprinted = notPrintedAfter(pages);
  const rows: PageTreeRow[] = [];
  const open: OpenFolder[] = [];
  const numbered = new Map<FolderRow, string[]>();
  let pending: PendingRow | null = null;
  // Shown while no folder it's in is collapsed.
  const shown = () => open.every((folder) => !folder.row?.collapsed);
  const depth = () => open.filter((folder) => folder.row).length;
  // The outermost repeating folder's depth, else this row's own when it repeats itself.
  const bracket = (own: boolean): number | null => {
    let at = 0;
    for (const folder of open) {
      if (folder.repeats) return at;
      if (folder.row) at++;
    }
    return own ? at : null;
  };
  const push = (row: PageTreeRow) => {
    if (row.kind !== "pending") pending = null;
    if (shown()) rows.push(row);
  };
  const pushUnprinted = (after: string | null) => {
    for (const page of unprinted.get(after) ?? []) {
      push({ kind: "notPrinted", page, depth: depth(), bracket: bracket(repeatsItself(page)) });
    }
  };

  // The page number a side is read at: its page's, a blank's the next page's (none: past all).
  const numberAt = (index: number): number => {
    for (let at = index; at < layout.sides.length; at++) {
      const side = layout.sides[at];
      if (side?.kind === "page") return side.page.number;
    }
    return Infinity;
  };
  // Closes the folders whose pages end before side `index`.
  const closeBefore = (index: number) => {
    const n = numberAt(index);
    const at = open.findIndex((folder) => folder.end <= n);
    if (at >= 0) open.length = at;
  };
  // Its pages all pending (blank sides aside): no heading, and its blanks join the pending row.
  const allPending = (spread: readonly number[]) => {
    const sides = spread.map((index) => layout.sides[index]);
    const pages = sides.filter((side) => side?.kind === "page");
    return (
      pages.length > 0 &&
      pages.length + sides.filter((side) => side?.kind === "blank").length === sides.length &&
      pages.every((side) => side?.kind === "page" && !!side.page.pending)
    );
  };

  const openFolders = (index: number) => {
    const side = layout.sides[index];
    if (side?.kind !== "page" || side.part === "right") return;
    for (const placed of side.page.starts) {
      open.length = Math.min(open.length, placed.depth);
      const repeats = !!placed.section.repeat;
      const { end } = placed;
      // A copy not made yet is in the pending row, not a folder.
      if (side.page.pending) {
        open.push({ row: null, repeats, end });
        continue;
      }
      const folder: FolderRow = {
        kind: "folder",
        placed,
        copy: placed.section.id !== placed.from,
        depth: depth(),
        bracket: bracket(repeats),
        range: "",
        slots: [],
        collapsed: collapsed.has(placed.section.id),
      };
      push(folder);
      numbered.set(folder, []);
      open.push({ row: folder, repeats, end });
    }
  };

  pushUnprinted(null);
  for (const spread of layout.spreads) {
    const first = spread[0];
    if (first !== undefined) {
      closeBefore(first);
      openFolders(first);
    }
    const pendingSpread = allPending(spread);
    if (spreads && !pendingSpread) {
      push({ kind: "spread", spread, depth: depth(), bracket: bracket(false) });
    }
    for (const index of spread) {
      if (index !== first) {
        closeBefore(index);
        openFolders(index);
      }
      const side = layout.sides[index];
      if (!side) continue;
      const label = numbers[index]?.label;
      const page = side.kind === "page" ? side.page : null;
      for (const { row } of open) {
        if (!row) continue;
        if (page && !page.pending && side.kind === "page" && side.part !== "right") {
          row.slots.push(page.slot.id);
        }
        if (label) numbered.get(row)?.push(label);
      }
      // A spread frame's two sides are one row, at its left side.
      if (side.kind === "page" && side.part === "right") continue;
      if (pendingSpread && side.kind === "blank") continue;
      if (page?.pending) {
        if (!pending) {
          pending = {
            kind: "pending",
            first: page.slot.id,
            count: 0,
            depth: depth(),
            bracket: bracket(true),
          };
          push(pending);
        }
        pending.count++;
      } else {
        push({
          kind: "side",
          side,
          index,
          depth: depth(),
          bracket: bracket(page ? repeatsItself(page) : false),
        });
      }
      if (page) pushUnprinted(page.slot.id);
    }
  }

  for (const [folder, labels] of numbered) {
    const [from, to] = [labels[0], labels.at(-1)];
    folder.range = !from ? "" : from === to ? from : `${from}–${to}`;
  }
  return rows;
}
