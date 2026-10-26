import { ColorsStep } from "../colors/colors-step";
import { WizardDone } from "../done/wizard-done";
import { ReviewStep } from "../review/review-step";
import { RolesStep } from "../roles/roles-step";
import { ThemeStep } from "../theme/theme-step";
import { TypeStep } from "../type/type-step";
import { useColorWizardStore } from "../store";

/** The current step, or the done screen after Create. */
export function WizardBody() {
  const step = useColorWizardStore((s) => s.step);
  const created = useColorWizardStore((s) => s.created);
  if (created) return <WizardDone result={created} />;
  switch (step) {
    case "colors":
      return <ColorsStep />;
    case "roles":
      return <RolesStep />;
    case "theme":
      return <ThemeStep />;
    case "type":
      return <TypeStep />;
    case "review":
      return <ReviewStep />;
  }
}
