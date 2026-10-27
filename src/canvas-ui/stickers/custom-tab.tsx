import { ImagePlus } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@shared/ui/components/ui/button";
import { useCustomStickersStore } from "@shared/stores/custom-stickers-store";
import { StickerGrid } from "./sticker-grid";
import type { StickerTabProps } from "./sticker-picker.types";
import { t } from "./stickers.i18n";

/** The user's own stickers: imported pictures, available on every board and design. */
export function CustomTab(props: StickerTabProps) {
  const { stickers, loaded, load, importFiles, remove } = useCustomStickersStore();
  const sections = useMemo(
    () => [{ id: "custom", label: t("custom.section"), stickers }],
    [stickers],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-3">
        <p className="text-xs text-muted-foreground">{t("custom.limits")}</p>
        <Button variant="outline" size="sm" onClick={() => void importFiles()}>
          <ImagePlus />
          {t("custom.import")}
        </Button>
      </div>
      {loaded && (
        <StickerGrid
          sections={sections}
          onRemove={(sticker) => void remove(sticker.id)}
          empty={stickers.length === 0 ? t("custom.emptyHint") : t("grid.empty")}
          {...props}
        />
      )}
    </div>
  );
}
