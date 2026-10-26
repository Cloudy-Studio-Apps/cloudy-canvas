import type { WizardPlan } from "../..";

/** "Create 112 variables + 8 text styles", "Create 57, update 33 variables". */
export function createLabel(plan: WizardPlan): string {
  const parts = [
    plan.created && `Create ${plan.created}`,
    plan.updated && `update ${plan.updated}`,
  ];
  const variables = `${parts.filter(Boolean).join(", ") || "Create 0"} variables`;
  return plan.textStyles.length
    ? `${variables} + ${plan.textStyles.length} text styles`
    : variables;
}
