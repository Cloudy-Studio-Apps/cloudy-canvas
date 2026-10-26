import { useDocumentTokens } from "@canvas-ui";
import { AppDialog, Button } from "@shared/ui/kit";
import type { DeleteCollectionDialogProps } from "./colors-ui.types";

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
  const count = `${colors.length} color${colors.length === 1 ? "" : "s"}`;
  return (
    <AppDialog
      open={!!collection}
      onOpenChange={(open) => !open && onClose()}
      size="sm"
      title={`Delete “${collection?.name ?? ""}”?`}
      description={
        elements > 0
          ? `Its ${count} go with it. ${elements} element${elements === 1 ? "" : "s"} using them keep their color, unlinked.`
          : `Its ${count} go with it.`
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={remove}>
            Delete
          </Button>
        </>
      }
    />
  );
}
