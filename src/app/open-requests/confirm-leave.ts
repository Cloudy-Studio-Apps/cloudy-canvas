import { toast } from "@shared/stores/toast-store";
import { useUnsavedChangesStore } from "@shared/stores/unsaved-changes-store";

/** Runs `leave` now, or once the user agrees to lose the open editor's unsaved changes. */
export function confirmLeave(title: string, leave: () => void): void {
  if (!useUnsavedChangesStore.getState().dirty) {
    leave();
    return;
  }
  toast({
    title,
    description: "The open board has unsaved changes, which will be lost.",
    action: { label: "Open anyway", run: leave },
  });
}
