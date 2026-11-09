import { TokenStore, type LibraryDocument } from "@canvas";
import { EFFECT_STYLE, TEXT_STYLE } from "@design";
import type { LibraryEntry } from "@shared/core";
import { libraryColorList } from "@pages/shared/projects";
import type { KindCounts, LibrarySummary } from "./library-summary.types";

/** Reads what a library holds. */
export function summarizeLibrary(entry: LibraryEntry, doc: LibraryDocument): LibrarySummary {
  const records = doc.tokenRecords();
  const store = new TokenStore(records);
  const assets = doc.assets();
  return {
    entry,
    doc,
    colors: libraryColorList(records),
    textStyles: [...store.styles(TEXT_STYLE)],
    effects: [...store.styles(EFFECT_STYLE)],
    images: assets.filter((asset) => asset.type === "image"),
    svgs: assets.filter((asset) => asset.type !== "image"),
    modes: store.switchableAxes().map((axis) => axis.modes.map((mode) => mode.name).join(" / ")),
  };
}

/** How many items of each kind a library holds (components don't exist yet). */
export function kindCounts(summary: LibrarySummary): KindCounts {
  return {
    colors: summary.colors.length,
    text: summary.textStyles.length,
    images: summary.images.length,
    svg: summary.svgs.length,
    components: 0,
    effects: summary.effects.length,
  };
}

/** The counts of several libraries added up. */
export function totalCounts(summaries: readonly LibrarySummary[]): KindCounts {
  const total: KindCounts = { colors: 0, text: 0, images: 0, svg: 0, components: 0, effects: 0 };
  for (const summary of summaries) {
    const counts = kindCounts(summary);
    for (const kind of Object.keys(total) as (keyof KindCounts)[]) total[kind] += counts[kind];
  }
  return total;
}
