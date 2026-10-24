import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { useBoard } from "../use-board";
import type { DeleteCollectionDialogProps } from "./side.types";

/** Deleting a collection: its variables go with it, and the layers using them keep their values. */
export function DeleteCollectionDialog({ collection, onClose }: DeleteCollectionDialogProps) {
  const { tokens, store } = useBoard();
  const variables = collection ? store.variables(collection.id) : [];
  const layers = new Set(variables.flatMap((v) => tokens.usage(v.id))).size;
  return (
    <Dialog open={collection !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete “{collection?.name}”?</DialogTitle>
          <DialogDescription>
            {variables.length === 0
              ? "It's empty."
              : `Its ${variables.length} ${variables.length === 1 ? "variable goes" : "variables go"} with it.` +
                (layers > 0
                  ? ` ${layers} ${layers === 1 ? "layer keeps" : "layers keep"} the values they show, no longer linked.`
                  : "")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (collection) tokens.deleteCollection(collection.id);
              onClose();
            }}
          >
            Delete collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
