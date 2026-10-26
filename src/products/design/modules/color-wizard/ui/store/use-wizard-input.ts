import { useMemo } from "react";

import type { WizardInput } from "../..";
import { useColorWizardStore } from "./color-wizard-store";
import { wizardInput } from "./wizard-input";

/** What the wizard would write, as its state changes. */
export function useWizardInput(): WizardInput {
  const palette = useColorWizardStore((s) => s.palette);
  const roles = useColorWizardStore((s) => s.roles);
  const options = useColorWizardStore((s) => s.options);
  const overrides = useColorWizardStore((s) => s.overrides);
  const type = useColorWizardStore((s) => s.type);
  const collection = useColorWizardStore((s) => s.collection);
  const bindFills = useColorWizardStore((s) => s.bindFills);
  return useMemo(
    () =>
      wizardInput({
        ...useColorWizardStore.getState(),
        palette,
        roles,
        options,
        overrides,
        type,
        collection,
        bindFills,
      }),
    [palette, roles, options, overrides, type, collection, bindFills],
  );
}
