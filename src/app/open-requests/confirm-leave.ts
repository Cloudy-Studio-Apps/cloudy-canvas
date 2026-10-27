import { toast } from "@shared/stores/toast-store";
import { useUnsavedChangesStore } from "@shared/stores/unsaved-changes-store";
import { t } from "../app.i18n";

/** Runs `leave` now, or once the user agrees to lose the open editor's unsaved changes. */
export function confirmLeave(title: string, leave: () => void): void {
  if (!useUnsavedChangesStore.getState().dirty) {
    leave();
    return;
  }
  toast({
    title,
    description: t("leave.unsaved"),
    action: { label: t("leave.openAnyway"), run: leave },
  });
}
