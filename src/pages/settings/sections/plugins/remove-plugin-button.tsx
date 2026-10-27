import { useState } from "react";
import { Trash2 } from "lucide-react";

import { tCommon } from "@shared/core";
import { Button } from "@shared/ui/components/ui/button";
import type { RemovePluginButtonProps } from "./plugins.types";
import { t } from "../../settings.i18n";

/** Remove, asked again inline: a linked plugin is only forgotten, a copied one deleted. */
export function RemovePluginButton({ source, onRemove }: RemovePluginButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        onClick={() => setConfirming(true)}
      >
        <Trash2 />
        {t("plugins.remove")}
      </Button>
    );
  }
  return (
    <>
      <span className="text-sm">
        {source === "linked" ? t("plugins.stopLoading") : t("plugins.deleteIt")}
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          setConfirming(false);
          onRemove();
        }}
      >
        {t("plugins.remove")}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        {tCommon("cancel")}
      </Button>
    </>
  );
}
