import type { WizardStepEntry } from "./shell.types";
import type { WizardStep } from "../store";

/** The steps in order, with their names. */
export const WIZARD_STEPS: readonly WizardStepEntry[] = [
  { id: "colors", label: "Colors" },
  { id: "roles", label: "Roles & shades" },
  { id: "theme", label: "Theme" },
  { id: "type", label: "Type" },
  { id: "review", label: "Review" },
];

export const stepIndex = (step: WizardStep): number => WIZARD_STEPS.findIndex((s) => s.id === step);
