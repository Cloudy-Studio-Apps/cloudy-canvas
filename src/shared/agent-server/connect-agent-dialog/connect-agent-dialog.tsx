import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { ConnectAgentBody } from "./connect-agent-body";
import type { ConnectAgentDialogProps } from "./connect-agent-dialog.types";

/** Picks an agent app and shows how to connect it to the app's MCP server. */
export function ConnectAgentDialog({ open, onOpenChange }: ConnectAgentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Agents (MCP)</DialogTitle>
          <DialogDescription className="sr-only">
            Connect an AI agent to Cloudy Canvas.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts at the grid. */}
        <ConnectAgentBody />
      </DialogContent>
    </Dialog>
  );
}
