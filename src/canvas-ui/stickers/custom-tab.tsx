import { ImagePlus } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@shared/ui/components/ui/button";
import { useCustomStickersStore } from "@shared/stores/custom-stickers-store";
import { StickerGrid } from "./sticker-grid";
import type { StickerTabProps } from "./sticker-picker.types";

/** The user's own stickers: imported pictures, available on every board and design. */
export function CustomTab(props: StickerTabProps) {
  const { stickers, loaded, load, importFiles, remove } = useCustomStickersStore();
  const sections = useMemo(() => [{ id: "custom", label: "Your stickers", stickers }], [stickers]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-3">
        <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF or SVG, up to 2 MB.</p>
        <Button variant="outline" size="sm" onClick={() => void importFiles()}>
          <ImagePlus />
          Import…
        </Button>
      </div>
      {loaded && (
        <StickerGrid
          sections={sections}
          onRemove={(sticker) => void remove(sticker.id)}
          empty={
            stickers.length === 0
              ? "Import pictures to stamp them on any board or design."
              : "No stickers match your search."
          }
          {...props}
        />
      )}
    </div>
  );
}
