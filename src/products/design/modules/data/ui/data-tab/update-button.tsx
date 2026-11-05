import { Loader2, RefreshCw } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { stageText } from "./source-meta";
import type { UpdateButtonProps } from "./update-button.types";
import { t } from "../../data.i18n";

/** Update: a spinner and the stage while it runs, and a click then cancels it. */
export function UpdateButton({
  stage,
  progress = null,
  cancellable,
  onRun,
  onCancel,
  label,
  disabled = false,
}: UpdateButtonProps) {
  if (stage === null) {
    return (
      <IconButton size="xs" label={label ?? t("update.run")} disabled={disabled} onClick={onRun}>
        <RefreshCw />
      </IconButton>
    );
  }
  return (
    <IconButton
      size="xs"
      label={stageText(stage, progress)}
      description={cancellable ? t("update.cancelHint") : undefined}
      disabled={!cancellable}
      active
      onClick={onCancel}
    >
      <Loader2 className="animate-spin" />
    </IconButton>
  );
}
