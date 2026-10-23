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
          <DialogTitle>Agent tools</DialogTitle>
          <DialogDescription>
            {count} tools connected AI agents can use in Cloudy Canvas.
            {!enabled && " Agent access is off, so no agent can use them right now."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts with an empty search. */}
        {open && <AgentToolsList sections={sections} />}
      </DialogContent>
    </Dialog>
  );
}
