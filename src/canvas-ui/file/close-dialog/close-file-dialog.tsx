import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import type { CloseFileDialogProps } from "./close-file-dialog.types";

/**
 * Asks before the app quits with a file open. Saved files (or autosaved ones) only confirm; a
 * file with changes nothing will save offers to save them first.
 */
export function CloseFileDialog({ open, name, unsaved, busy, onChoose }: CloseFileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onChoose("cancel")}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quit Cloudy Canvas?</DialogTitle>
          <DialogDescription>
            {unsaved
              ? `“${name}” has changes that aren't saved. They'll be lost unless you save them.`
              : `Your changes to “${name}” are saved.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={() => onChoose("cancel")}>
            Cancel
          </Button>
          {unsaved ? (
            <>
              <Button variant="outline" disabled={busy} onClick={() => onChoose("close")}>
                Quit without saving
              </Button>
              <Button disabled={busy} onClick={() => onChoose("save")}>
                Save and quit
              </Button>
            </>
          ) : (
            <Button autoFocus onClick={() => onChoose("close")}>
              Quit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
