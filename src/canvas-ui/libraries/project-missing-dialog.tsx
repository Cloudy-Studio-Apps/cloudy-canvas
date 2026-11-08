import { useState } from "react";

import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import type { ProjectMissingDialogProps } from "./project-missing-dialog.types";
import { t } from "./libraries.i18n";

/**
 * Says the open file's project isn't where it was: Locate project… (then the libraries open from
 * there) or Continue without the project (library items stay read-only). Shown once per editor.
 */
export function ProjectMissingDialog({ libraries, fileName }: ProjectMissingDialogProps) {
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const open = libraries.status === "missing" && !dismissed;

  const locate = async () => {
    setBusy(true);
    try {
      await libraries.locate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && setDismissed(true)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("missing.title")}</DialogTitle>
          <DialogDescription>{t("missing.description", { name: fileName })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={() => setDismissed(true)}>
            {t("missing.continue")}
          </Button>
          <Button autoFocus disabled={busy} onClick={() => void locate()}>
            {t("missing.locate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
