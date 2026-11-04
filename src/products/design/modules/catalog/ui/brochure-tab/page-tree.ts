import type { BookLayout } from "../../model/book-layout.types";
import type { PageInfo } from "../../model/numbering/page-numbers.types";
import type { PlacedSection } from "../../model/sections/sections.types";
import type { FolderRow, PageTreeRow } from "./page-tree.types";

/**
 * The page list's rows: the layout's sides in order, each section a folder over its pages (its
 * subsections folders inside it), and with `spreads` a heading before each spread. A section
 * starting on a spread's first side opens before that spread's heading. What's in a collapsed
 * folder is left out.
 */
export function pageTree(
  layout: BookLayout,
  sections: readonly PlacedSection[],
  numbers: readonly PageInfo[],
  collapsed: ReadonlySet<string>,
  spreads: boolean,
): PageTreeRow[] {
  const startingAt = new Map<string, PlacedSection[]>();
  for (const placed of sections) {
    startingAt.set(placed.section.start, [...(startingAt.get(placed.section.start) ?? []), placed]);
  }
  const rows: PageTreeRow[] = [];
  const open: FolderRow[] = [];
  const numbered = new Map<FolderRow, string[]>();
  // Shown while no folder it's in is collapsed.
  const shown = () => open.every((folder) => !folder.collapsed);
  const push = (row: PageTreeRow) => {
    if (shown()) rows.push(row);
  };

  const openFolders = (index: number) => {
    const side = layout.sides[index];
    if (side?.kind !== "page" || side.part === "right") return;
    for (const placed of startingAt.get(side.page.slot.id) ?? []) {
      open.length = Math.min(open.length, placed.depth);
      const folder: FolderRow = {
        kind: "folder",
        placed,
        depth: open.length,
        range: "",
        slots: [],
        collapsed: collapsed.has(placed.section.id),
      };
      push(folder);
      numbered.set(folder, []);
      open.push(folder);
    }
  };

  for (const spread of layout.spreads) {
    const first = spread[0];
    if (first !== undefined) openFolders(first);
    if (spreads) push({ kind: "spread", spread, depth: open.length });
    for (const index of spread) {
      if (index !== first) openFolders(index);
      const side = layout.sides[index];
      if (!side) continue;
      const label = numbers[index]?.label;
      for (const folder of open) {
        if (side.kind === "page" && side.part !== "right") folder.slots.push(side.page.slot.id);
        if (label) numbered.get(folder)?.push(label);
      }
      // A spread frame's two sides are one row, at its left side.
      if (side.kind === "page" && side.part === "right") continue;
      push({ kind: "side", side, index, depth: open.length });
    }
  }

  for (const [folder, labels] of numbered) {
    const [from, to] = [labels[0], labels.at(-1)];
    folder.range = !from ? "" : from === to ? from : `${from}–${to}`;
  }
  return rows;
}
