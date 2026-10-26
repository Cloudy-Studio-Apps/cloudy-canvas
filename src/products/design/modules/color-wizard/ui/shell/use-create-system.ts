import { DOCUMENT_TOKENS } from "@canvas";
import { useService } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { applyWizard } from "../..";
import { useColorWizardStore, wizardInput } from "../store";

/** Writes what the wizard built (one undo step) and shows the done screen, or says what failed. */
export function useCreateSystem(): () => void {
  const engine = useDesignEngine();
  const tokens = useService(DOCUMENT_TOKENS);
  return () => {
    const state = useColorWizardStore.getState();
    try {
      const created = applyWizard(engine.doc, tokens, wizardInput(state));
      state.set({ created, celebration: state.celebration + 1 });
    } catch (error) {
      notifyError("Couldn't create the design system", error);
    }
  };
}
