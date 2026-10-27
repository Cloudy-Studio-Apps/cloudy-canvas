import { useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { readAgentToolCatalog } from "../agent-tool-catalog";
import { useAgentServerStatus } from "../use-agent-server-status";
import { AgentToolsList } from "./agent-tools-list";
import type { AgentToolsDialogProps } from "./agent-tools-dialog.types";
import { t } from "../agent-server.i18n";

/** Every tool connected agents can use, with what it does. */
export function AgentToolsDialog({ open, onOpenChange }: AgentToolsDialogProps) {
  const { enabled } = useAgentServerStatus();
  // Read on every opening, so plugin tools are current.
  const sections = useMemo(() => (open ? readAgentToolCatalog() : []), [open]);
  const count = sections.reduce((sum, section) => sum + section.tools.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("tools.title")}</DialogTitle>
          <DialogDescription>
            {t("tools.count", { count })}
            {!enabled && t("tools.off")}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts with an empty search. */}
        {open && <AgentToolsList sections={sections} />}
      </DialogContent>
    </Dialog>
  );
}
