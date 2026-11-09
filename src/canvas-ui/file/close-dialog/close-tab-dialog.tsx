import { t } from "../file.i18n";
import type { CloseTabDialogProps } from "./close-tab-dialog.types";
import { SaveChangesDialog } from "./save-changes-dialog";

/** Asks before a file tab with changes nothing will save closes: Save · Don't save · Cancel. */
export function CloseTabDialog({ open, name, busy, onChoose }: CloseTabDialogProps) {
  return (
    <SaveChangesDialog
      open={open}
      title={t("closeTab.title", { name })}
      description={t("closeTab.description")}
      saveLabel={t("closeTab.save")}
      discardLabel={t("closeTab.discard")}
      busy={busy}
      onChoose={onChoose}
    />
  );
}
