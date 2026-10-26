import { useColorWizardStore } from "./color-wizard-store";
import type { SourceTab } from "./color-wizard-store.types";

/** Opens the color wizard at its first step (on a source tab, if given). */
export function openColorWizard(tab?: SourceTab): void {
  useColorWizardStore
    .getState()
    .set({ open: true, step: "colors", created: null, ...(tab ? { tab } : {}) });
}

/** Whether the color wizard is open. */
export function useColorWizardOpen(): boolean {
  return useColorWizardStore((s) => s.open);
}
