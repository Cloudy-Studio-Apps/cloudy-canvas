import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { ConnectAgentBody } from "./connect-agent-body";
import type { ConnectAgentDialogProps } from "./connect-agent-dialog.types";
import { t } from "../agent-server.i18n";

/** Picks an agent app and shows how to connect it to the app's MCP server. */
export function ConnectAgentDialog({ open, onOpenChange }: ConnectAgentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("connect.description")}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts at the grid. */}
        <ConnectAgentBody />
      </DialogContent>
    </Dialog>
  );
}
