import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { groupTree, type CollectionRecord, type VariableRecord } from "@canvas";
import { TokenGroupAccordion, useDocumentTokens } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import { ColorRow } from "./color-row";
import { DeleteCollectionDialog } from "./delete-collection-dialog";
import { DeleteColorDialog } from "./delete-color-dialog";
import { InlineRename } from "./inline-rename";
import { NEW_COLOR } from "./new-color";
import type { CollectionColorsProps } from "./colors-ui.types";
import { t } from "../colors.i18n";

/**
 * A collection's colors in their groups: "+" adds one, its name and groups rename in place, and
 * it's deleted with its colors.
 */
export function CollectionColors({ collection, colors }: CollectionColorsProps) {
  const { tokens } = useDocumentTokens();
  const [deleting, setDeleting] = useState<VariableRecord | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<CollectionRecord | null>(null);
  // Nothing uses it: delete without asking.
  const requestDelete = (variable: VariableRecord) => {
    const usage = tokens.usageOf(variable.id);
    if (usage.layers.length === 0 && usage.aliases.length === 0) {
      tokens.deleteVariables([variable.id]);
    } else setDeleting(variable);
  };
  // An empty collection goes without asking.
  const requestDeleteCollection = () => {
    if (colors.length === 0) tokens.deleteCollection(collection.id);
    else setDeletingCollection(collection);
  };
  return (
    <section className="flex flex-col">
      <header className="group/row flex h-7 items-center gap-1 px-1">
        <h3 className="min-w-0 flex-1 truncate text-[11px] font-medium text-muted-foreground uppercase">
          {collection.name}
        </h3>
        <InlineRename
          label={t("collection.rename")}
          value={collection.name}
          onRename={(name) => tokens.renameCollection(collection.id, name)}
        />
        <IconButton
          label={t("collection.delete", { name: collection.name })}
          size="xs"
          revealOnHover
          onClick={requestDeleteCollection}
        >
          <Trash2 />
        </IconButton>
        <IconButton
          label={t("collection.addColor", { name: collection.name })}
          size="xs"
          onClick={() => tokens.createVariable({ ...NEW_COLOR, collectionId: collection.id })}
        >
          <Plus />
        </IconButton>
      </header>
      {colors.length === 0 ? (
        <p className="px-1 py-1 text-xs text-muted-foreground">{t("collection.empty")}</p>
      ) : (
        <TokenGroupAccordion
          group={groupTree(colors)}
          storageKey={`board-colors:${collection.id}`}
          renderVariable={(variable) => <ColorRow variable={variable} onDelete={requestDelete} />}
          renderGroupActions={(group) => (
            <InlineRename
              label={t("collection.renameGroup")}
              value={group.path}
              onRename={(to) => tokens.renameGroup(collection.id, group.path, to)}
            />
          )}
        />
      )}
      <DeleteColorDialog variable={deleting} onClose={() => setDeleting(null)} />
      <DeleteCollectionDialog
        collection={deletingCollection}
        onClose={() => setDeletingCollection(null)}
      />
    </section>
  );
}
