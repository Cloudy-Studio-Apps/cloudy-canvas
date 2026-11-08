import { Plus } from "lucide-react";
import { useState } from "react";

import type { CollectionRecord } from "@canvas";
import { groupBySource, TokenSourceHeader, useTokenSources } from "@canvas-ui";
import { PaintingSeal } from "@shared/ui/brand/painting-seal";
import { freeGroup } from "../group-paths";
import { draftFromColor } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { CollectionItem } from "./collection-item";
import { DeleteCollectionDialog } from "./delete-collection-dialog";
import { UnusedEntry } from "./unused-entry";
import { t } from "../../../variables.i18n";

/**
 * The window's left column: the collections (right-click to rename or delete one), the open one
 * unfolded into its groups, "+ New collection", and the painting seal, which starts a palette. In
 * a file using project libraries, the collections are grouped by where they come from: each
 * library, then the file's own.
 */
export function CollectionsSide() {
  const { tokens, store, collection } = useBoard();
  const { showCollection, setDraft } = useVariablesWindowStore();
  const [deleting, setDeleting] = useState<CollectionRecord | null>(null);
  const collections = store.collections();
  const sources = useTokenSources(collections);
  const startPalette = () => {
    const target = collection ?? tokens.createCollection(t("defaults.collection"));
    setDraft(draftFromColor(target.id, freeGroup(store.variables(target.id), "brand")));
  };
  return (
    <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-border p-2">
      <p className="px-1.5 py-1 text-[11px] text-subtle-foreground uppercase">
        {t("side.collections")}
      </p>
      {sources
        ? groupBySource(collections, sources).map(({ source, items }) => (
            <div key={source.libraryId ?? "file"} className="flex flex-col">
              <TokenSourceHeader source={source} className="px-1.5 pt-2 pb-1" />
              {items.map((c) => (
                <CollectionItem key={c.id} collection={c} source={source} onDelete={setDeleting} />
              ))}
            </div>
          ))
        : collections.map((c) => (
            <CollectionItem key={c.id} collection={c} onDelete={setDeleting} />
          ))}
      <button
        type="button"
        onClick={() =>
          showCollection(
            tokens.createCollection(
              t("defaults.collectionNumbered", { number: store.collections().length + 1 }),
            ).id,
          )
        }
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted"
      >
        <Plus className="size-3.5" /> {t("side.newCollection")}
      </button>
      <UnusedEntry />
      <DeleteCollectionDialog collection={deleting} onClose={() => setDeleting(null)} />
      <div className="mt-auto flex flex-col items-center gap-1 pt-3 text-center">
        <PaintingSeal width={140} />
        <span className="text-[11px] text-subtle-foreground">{t("side.tagline")}</span>
        <button
          type="button"
          onClick={startPalette}
          className="text-[11px] text-primary hover:underline"
        >
          {t("side.generatePalette")}
        </button>
      </div>
    </aside>
  );
}
