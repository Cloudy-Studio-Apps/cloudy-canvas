import { Palette, X } from "lucide-react";

import { FloatingPanel, useDocumentTokens } from "@canvas-ui";
import { Button, EmptyState, IconButton } from "@shared/ui/kit";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { AddMenu } from "./add-menu";
import { BoardModes } from "./board-modes";
import { CollectionColors } from "./collection-colors";
import { ColorsExchangeMenu } from "./colors-exchange-menu";
import { NEW_COLOR } from "./new-color";

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
      aria-label="Board colors"
      className="max-h-full w-[300px] flex-col items-stretch gap-3 p-3"
    >
      <header className="flex items-center gap-1">
        <h2 className="flex-1 text-sm font-semibold">Board colors</h2>
        <ColorsExchangeMenu />
        <AddMenu />
        <IconButton label="Close panel" size="sm" onClick={() => setOpen(false)}>
          <X />
        </IconButton>
      </header>
      <BoardModes />
      <div className="-mx-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3">
        {collections.length === 0 ? (
          <EmptyState
            icon={<Palette />}
            title="No board colors yet"
            description="Colors you name here are offered first in every color bar; elements using one follow it when it changes. Bring a design's colors in with Import."
            action={
              <Button size="sm" onClick={addColor}>
                Add a color
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
