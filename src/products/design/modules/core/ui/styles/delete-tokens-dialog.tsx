import { DOCUMENT_TOKENS } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/kit";
import type { DeleteTokensDialogProps } from "./styles.types";

/**
 * Deleting variables or styles: at once when nothing uses them, otherwise after saying how many layers do
 * (they keep what they show, unlinked).
 */
export function DeleteTokensDialog({ ids, onClose }: DeleteTokensDialogProps) {
  const engine = useDesignEngine();
  const tokens = engine.service(DOCUMENT_TOKENS);
  const users = new Set((ids ?? []).flatMap((id) => tokens.usage(id)));
  const remove = () => {
    if (ids) tokens.deleteTokens(ids);
    onClose();
  };
  return (
    <Dialog open={ids !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Delete {ids?.length === 1 ? "it" : `these ${ids?.length ?? 0}`}?
          </DialogTitle>
          <DialogDescription>
            {users.size === 0
              ? "No layer uses it."
              : `Used by ${users.size} ${users.size === 1 ? "layer" : "layers"}. They keep the value they show now, no longer linked.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={remove}>
            {users.size === 0 ? "Delete" : "Delete and detach"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
