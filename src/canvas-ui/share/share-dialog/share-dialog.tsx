import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { useCanvasFile } from "../../file";
import { useHostedSession } from "../host-session";
import { HostingPanel } from "./hosting-panel";
import type { ShareDialogProps } from "./share-dialog.types";
import { StartSharing } from "./start-sharing";
import { t } from "../share.i18n";

/** Shares the open file live: starts the session, then shows its link and who's in it. */
export function ShareDialog({ open, onOpenChange, product }: ShareDialogProps) {
  const file = useCanvasFile();
  const host = useHostedSession(file.id);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="pointer-events-auto"
        // Keys pressed in the dialog aren't canvas shortcuts.
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>
            {host ? t("dialog.sharing") : t("dialog.share", { noun: file.noun })}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("dialog.description", { noun: file.noun })}
          </DialogDescription>
        </DialogHeader>
        {host ? <HostingPanel host={host} /> : <StartSharing product={product} />}
      </DialogContent>
    </Dialog>
  );
}
