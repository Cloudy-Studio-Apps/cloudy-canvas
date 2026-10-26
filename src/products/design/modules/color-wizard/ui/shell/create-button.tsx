import { Button } from "@shared/ui/kit";
import { useWizardPlan } from "../store";
import { createLabel } from "./create-label";
import { useCreateSystem } from "./use-create-system";

/** The last step's button: says what it writes, and writes it. */
export function CreateButton() {
  const plan = useWizardPlan();
  const create = useCreateSystem();
  return <Button onClick={create}>{createLabel(plan)}</Button>;
}
