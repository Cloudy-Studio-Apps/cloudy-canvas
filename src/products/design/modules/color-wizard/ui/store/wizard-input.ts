import { defaultRoleNames, type WizardInput, type WizardRole } from "../..";
import type { ColorWizardState } from "./color-wizard-store.types";

/** The palette's roles: the ones set on the roles step, or each color's default. */
export function wizardRoles(state: ColorWizardState): WizardRole[] {
  if (state.roles.length === state.palette.length) return state.roles;
  const names = defaultRoleNames(state.palette);
  return state.palette.map((c, i) => ({
    name: names[i] ?? `color-${i + 1}`,
    hex: c.hex,
    include: true,
    fills: c.fills,
  }));
}

/** Everything the wizard would write, from its state. */
export function wizardInput(state: ColorWizardState): WizardInput {
  const { enabled, ...type } = state.type;
  return {
    collection: state.collection.trim() || "Brand",
    roles: wizardRoles(state),
    options: state.options,
    overrides: state.overrides,
    type: enabled ? type : null,
    bindFills: state.bindFills,
  };
}
