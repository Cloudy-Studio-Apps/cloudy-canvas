import { Palette, X } from "lucide-react";

import { FloatingPanel, useDocumentTokens } from "@canvas-ui";
import { Button, EmptyState, IconButton } from "@shared/ui/kit";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { AddMenu } from "./add-menu";
import { BoardModes } from "./board-modes";
import { CollectionColors } from "./collection-colors";
import { ColorsExchangeMenu } from "./colors-exchange-menu";
import { NEW_COLOR } from "./new-color";
import { t } from "../colors.i18n";

/**
 * The side panel of the board's colors: its color variables by collection and group, edited in
 * place, and the mode the board shows. Board elements' color bars offer them first.
 */
export function BoardColorsPanel() {
  const open = useBoardPanelStore((state) => state.colorsOpen);
  const setOpen = useBoardPanelStore((state) => state.setColorsOpen);
  const { tokens, store } = useDocumentTokens();
  if (!open) return null;

  // Empty collections show too, so a new one can be filled.
  const collections = store.collections().map((collection) => ({
    collection,
    colors: store.variables(collection.id).filter((v) => v.type === "color"),
  }));
  // A new color goes into the first collection, or "Colors" when there's none.
  const addColor = () => {
    const collection = store.collections()[0] ?? tokens.createCollection("Colors");
    tokens.createVariable({ ...NEW_COLOR, collectionId: collection.id });
  };

  return (
    <FloatingPanel
      role="complementary"
      aria-label={t("title")}
      className="max-h-full w-[300px] flex-col items-stretch gap-3 p-3"
    >
      <header className="flex items-center gap-1">
        <h2 className="flex-1 text-sm font-semibold">{t("title")}</h2>
        <ColorsExchangeMenu />
        <AddMenu />
        <IconButton label={t("panel.closePanel")} size="sm" onClick={() => setOpen(false)}>
          <X />
        </IconButton>
      </header>
      <BoardModes />
      <div className="-mx-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3">
        {collections.length === 0 ? (
          <EmptyState
            icon={<Palette />}
            title={t("panel.emptyTitle")}
            description={t("panel.emptyDescription")}
            action={
              <Button size="sm" onClick={addColor}>
                {t("panel.addColor")}
              </Button>
            }
          />
        ) : (
          collections.map(({ collection, colors }) => (
            <CollectionColors key={collection.id} collection={collection} colors={colors} />
          ))
        )}
      </div>
    </FloatingPanel>
  );
}
