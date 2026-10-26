import { DEFAULT_TYPE_SCALE, typeScaleSteps } from "../../variables";
import type { WizardType, WizardTypeStep } from "./type.types";

/** The steps the wizard's type scale makes: the variables' type scale, headings in their font. */
export function wizardTypeSteps(type: WizardType): WizardTypeStep[] {
  return typeScaleSteps({
    ...DEFAULT_TYPE_SCALE,
    base: type.base,
    ratio: type.ratio,
    collection: "",
    font: { name: type.body },
  }).map((step) => ({ ...step, font: step.heading ? type.heading : type.body }));
}
