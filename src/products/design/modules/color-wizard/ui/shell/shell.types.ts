import type { WizardStep } from "../store";

/** A step of the wizard and its name. */
export interface WizardStepEntry {
  id: WizardStep;
  label: string;
}
