import { tCommon } from "@shared/core";
import { AppDialog, Button } from "@shared/ui/kit";
import { t } from "../model3d.i18n";
import type { ConvertModelDialogProps } from "./model-panel.types";

/** Asks before a 3D model becomes a plain PNG (permanent: its 3D data is removed). */
export function ConvertModelDialog({ open, onOpenChange, onConfirm }: ConvertModelDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("convert.title")}
      description={t("convert.description")}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            {t("convert.confirm")}
          </Button>
        </>
      }
    />
  );
}
