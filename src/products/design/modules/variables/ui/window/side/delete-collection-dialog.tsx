import { tCommon } from "@shared/core";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/kit";
import { useBoard } from "../use-board";
import type { DeleteCollectionDialogProps } from "./side.types";
import { t } from "../../../variables.i18n";

/** Deleting a collection: its variables go with it, and the layers using them keep their values. */
export function DeleteCollectionDialog({ collection, onClose }: DeleteCollectionDialogProps) {
  const { tokens, store } = useBoard();
  const variables = collection ? store.variables(collection.id) : [];
  const layers = new Set(variables.flatMap((v) => tokens.usage(v.id))).size;
  return (
    <Dialog open={collection !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("side.deleteTitle", { name: collection?.name ?? "" })}</DialogTitle>
          <DialogDescription>
            {variables.length === 0
              ? t("side.empty")
              : t("side.goes", { count: variables.length }) +
                (layers > 0 ? ` ${t("side.keeps", { count: layers })}` : "")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (collection) tokens.deleteCollection(collection.id);
              onClose();
            }}
          >
            {t("side.deleteCollection")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
