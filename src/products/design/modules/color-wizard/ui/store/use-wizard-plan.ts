import { useMemo, useSyncExternalStore } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useService } from "@canvas-ui";
import { buildWizardPlan, type WizardPlan } from "../..";
import { useWizardInput } from "./use-wizard-input";

/** What Create would write into this file, as the wizard and the file's tokens change. */
export function useWizardPlan(): WizardPlan {
  const tokens = useService(DOCUMENT_TOKENS);
  const version = useSyncExternalStore(tokens.subscribe, tokens.getVersion);
  const input = useWizardInput();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- read again when the tokens' version bumps
  return useMemo(() => buildWizardPlan(tokens.store(), input), [tokens, input, version]);
}
