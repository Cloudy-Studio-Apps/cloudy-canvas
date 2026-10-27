import type { WizardStepEntry } from "./shell.types";
import type { WizardStep } from "../store";
import { t } from "../../color-wizard.i18n";

/** The steps in order, with their names. */
export const WIZARD_STEPS: readonly WizardStepEntry[] = [
  { id: "colors", label: t("shell.steps.colors") },
  { id: "roles", label: t("shell.steps.roles") },
  { id: "theme", label: t("shell.steps.theme") },
  { id: "type", label: t("shell.steps.type") },
  { id: "review", label: t("shell.steps.review") },
];

export const stepIndex = (step: WizardStep): number => WIZARD_STEPS.findIndex((s) => s.id === step);
