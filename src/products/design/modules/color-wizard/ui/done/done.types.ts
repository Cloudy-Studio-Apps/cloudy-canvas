import type { WizardResult } from "../..";

export interface WizardDoneProps {
  result: WizardResult;
}

export interface DoneStatProps {
  value: string | number;
  label: string;
}
