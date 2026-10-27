import { tCommon } from "@shared/core";
import { useDocumentTokens } from "@canvas-ui";
import { AppDialog, Button } from "@shared/ui/kit";
import type { DeleteCollectionDialogProps } from "./colors-ui.types";
import { t } from "../colors.i18n";

/**
 * Asks before deleting a collection with colors: they go with it, and the elements using them
 * keep their color, unlinked.
 */
export function DeleteCollectionDialog({ collection, onClose }: DeleteCollectionDialogProps) {
  const { tokens, store } = useDocumentTokens();
  const colors = collection ? store.variables(collection.id) : [];
  const elements = new Set(colors.flatMap((v) => tokens.usageOf(v.id).layers)).size;
  const remove = () => {
    if (collection) tokens.deleteCollection(collection.id);
    onClose();
  };
  const count = t("deleteCollection.colors", { count: colors.length });
  return (
    <AppDialog
      open={!!collection}
      onOpenChange={(open) => !open && onClose()}
      size="sm"
      title={t("deleteCollection.title", { name: collection?.name ?? "" })}
      description={
        elements > 0
          ? t("deleteCollection.withElements", {
              colors: count,
              elements: t("deleteCollection.elements", { count: elements }),
            })
          : t("deleteCollection.plain", { colors: count })
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button variant="destructive" onClick={remove}>
            {tCommon("delete")}
          </Button>
        </>
      }
    />
  );
}
