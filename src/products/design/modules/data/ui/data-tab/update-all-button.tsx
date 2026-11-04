import { useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";

import { useService } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import { DESIGN_DATA_SOURCES } from "../../model";
import { cancelAllUpdates, startUpdateAll } from "../hooks/run-update";
import type { UpdateAllButtonProps } from "./update-all-button.types";
import { t } from "../../data.i18n";

/** "Update all": every source, one after another; a click while it runs cancels the rest. */
export function UpdateAllButton({ disabled }: UpdateAllButtonProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const [running, setRunning] = useState(false);

  if (running) {
    return (
      <IconButton
        size="xs"
        label={t("update.allRunning")}
        description={t("update.cancelHint")}
        active
        onClick={() => cancelAllUpdates(sources)}
      >
        <Loader2 className="animate-spin" />
      </IconButton>
    );
  }
  return (
    <IconButton
      size="xs"
      label={t("update.all")}
      disabled={disabled}
      onClick={() => {
        setRunning(true);
        void startUpdateAll(sources).finally(() => setRunning(false));
      }}
    >
      <RefreshCcw />
    </IconButton>
  );
}
