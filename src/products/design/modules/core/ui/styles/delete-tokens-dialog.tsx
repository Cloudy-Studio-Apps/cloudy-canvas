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
import { t } from "../../core.i18n";
import { tCommon } from "@shared/core";

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
          <DialogTitle>{t("dialog.deleteTitle", { count: ids?.length ?? 0 })}</DialogTitle>
          <DialogDescription>
            {users.size === 0 ? t("dialog.unused") : t("dialog.usedBy", { count: users.size })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button variant="destructive" onClick={remove}>
            {users.size === 0 ? tCommon("delete") : t("dialog.deleteDetach")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
