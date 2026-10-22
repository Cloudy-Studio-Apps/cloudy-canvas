import { ShieldAlert } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import type { PluginTrustDialogProps } from "./plugins.types";

/** Asks once before a plugin runs: it gets the same access as the app. */
export function PluginTrustDialog({ plugin, onTrust, onCancel }: PluginTrustDialogProps) {
  return (
    <Dialog open={plugin !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-destructive" />
            Turn on {plugin?.manifest.name}?
          </DialogTitle>
          <DialogDescription>
            Plugins run with the same access as the app: your files, the network and your boards.
            Only turn on plugins you trust
            {plugin?.manifest.author ? ` (this one is by ${plugin.manifest.author})` : ""}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onTrust}>Trust and turn on</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
