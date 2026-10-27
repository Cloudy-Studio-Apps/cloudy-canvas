import { ShieldAlert } from "lucide-react";

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
import type { PluginTrustDialogProps } from "./plugins.types";
import { t } from "../../settings.i18n";

/** Asks once before a plugin runs: it gets the same access as the app. */
export function PluginTrustDialog({ plugin, onTrust, onCancel }: PluginTrustDialogProps) {
  return (
    <Dialog open={plugin !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-destructive" />
            {t("plugins.turnOn", { name: plugin?.manifest.name ?? "" })}
          </DialogTitle>
          <DialogDescription>
            {plugin?.manifest.author
              ? t("plugins.trustBodyAuthor", { author: plugin.manifest.author })
              : t("plugins.trustBody")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={onTrust}>{t("plugins.trustAndOn")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
