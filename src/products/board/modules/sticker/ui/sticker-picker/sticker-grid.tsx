import { useMemo } from "react";

import { matchesSticker } from "@board";
import { StickerCell } from "./sticker-cell";
import type { StickerGridProps } from "./sticker-picker.types";

/** Stickers in titled sections, filtered by the search. */
export function StickerGrid({
  sections,
  query,
  activeId,
  onPick,
  onRemove,
  empty = "No stickers match your search.",
}: StickerGridProps) {
  const shown = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          stickers: query
            ? section.stickers.filter((sticker) => matchesSticker(sticker, query))
            : section.stickers,
        }))
        .filter((section) => section.stickers.length > 0),
    [sections, query],
  );

  if (shown.length === 0) {
    return <p className="px-3 py-8 text-center text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3 pb-2">
      {shown.map((section) => (
        <section key={section.id} aria-label={section.label}>
          {sections.length > 1 && (
            <h3 className="sticky top-0 z-10 bg-popover px-3 py-1 text-xs font-medium text-muted-foreground">
              {section.label}
            </h3>
          )}
          <div className="grid grid-cols-8 gap-0.5 px-2">
            {section.stickers.map((sticker) => (
              <StickerCell
                key={sticker.id}
                sticker={sticker}
                active={sticker.id === activeId}
                onPick={onPick}
                onRemove={onRemove}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
