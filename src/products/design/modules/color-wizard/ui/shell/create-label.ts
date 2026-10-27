import type { WizardPlan } from "../..";
import { t } from "../../color-wizard.i18n";

/** "Create 112 variables + 8 text styles", "Create 57, update 33 variables". */
export function createLabel(plan: WizardPlan): string {
  const variables =
    plan.created && plan.updated
      ? t("shell.create.createUpdate", { created: plan.created, updated: plan.updated })
      : plan.updated
        ? t("shell.create.update", { updated: plan.updated })
        : t("shell.create.create", { created: plan.created });
  return plan.textStyles.length
    ? t("shell.create.withStyles", { variables, count: plan.textStyles.length })
    : variables;
}
