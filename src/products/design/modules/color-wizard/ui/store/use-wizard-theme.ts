import { useMemo } from "react";

import { buildTheme, wizardColors, type WizardColor, type WizardTheme } from "../..";
import { useWizardInput } from "./use-wizard-input";

/** The Theme as it would be made, and the colors it's made of, as the wizard changes. */
export function useWizardTheme(): { theme: WizardTheme; colors: WizardColor[] } {
  const input = useWizardInput();
  return useMemo(() => {
    const colors = wizardColors(input.roles, input.options);
    return { colors, theme: buildTheme(colors, input.options, input.overrides) };
  }, [input]);
}
