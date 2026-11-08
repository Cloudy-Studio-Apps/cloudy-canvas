import { useSyncExternalStore } from "react";

import { tCommon } from "@shared/core";
import { AppDialog, Button } from "@shared/ui/kit";
import { t } from "../model3d.i18n";
import { answerModelSize, pendingModelSize, subscribeModelSize } from "./model-size-prompt";

/** The size in megabytes with one decimal. */
function megabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/**
 * Warns before a big 3D model is added (see `confirmModelSize`). Mount it once in an editor that
 * takes models, as an overlay.
 */
export function ModelSizeDialog() {
  const request = useSyncExternalStore(subscribeModelSize, pendingModelSize);
  return (
    <AppDialog
      open={request !== null}
      onOpenChange={(open) => !open && answerModelSize(false)}
      title={t("size.title")}
      description={t("size.description", {
        name: request?.name ?? "",
        size: megabytes(request?.bytes ?? 0),
      })}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => answerModelSize(false)}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={() => answerModelSize(true)}>{t("size.continue")}</Button>
        </>
      }
    />
  );
}
