import { tCommon } from "@shared/core";
import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import type { SaveChangesDialogProps } from "./save-changes-dialog.types";

/**
 * Asks what to do with changes nothing will save before something closes: save them first, go on
 * without them, or stay. Closing a tab and closing the window use it.
 */
export function SaveChangesDialog({
  open,
  title,
  description,
  saveLabel,
  discardLabel,
  busy,
  onChoose,
}: SaveChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onChoose("cancel")}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={() => onChoose("cancel")}>
            {tCommon("cancel")}
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => onChoose("discard")}>
            {discardLabel}
          </Button>
          <Button autoFocus disabled={busy} onClick={() => onChoose("save")}>
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
