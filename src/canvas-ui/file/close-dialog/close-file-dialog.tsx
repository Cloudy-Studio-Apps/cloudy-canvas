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
import { tCommon } from "@shared/core";
import { t } from "../file.i18n";

/**
 * Asks before the app quits with a file open. Saved files (or autosaved ones) only confirm; a
 * file with changes nothing will save offers to save them first.
 */
export function CloseFileDialog({ open, name, unsaved, busy, onChoose }: CloseFileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onChoose("cancel")}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("close.title")}</DialogTitle>
          <DialogDescription>
            {unsaved ? t("close.unsaved", { name }) : t("close.saved", { name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={() => onChoose("cancel")}>
            {tCommon("cancel")}
          </Button>
          {unsaved ? (
            <>
              <Button variant="outline" disabled={busy} onClick={() => onChoose("close")}>
                {t("close.quitWithout")}
              </Button>
              <Button disabled={busy} onClick={() => onChoose("save")}>
                {t("close.saveQuit")}
              </Button>
            </>
          ) : (
            <Button autoFocus onClick={() => onChoose("close")}>
              {t("close.quit")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
