import type { TypeScaleSettings } from "../../type-scale";

export interface TypeScaleDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export interface TypeScaleFormProps {
  settings: TypeScaleSettings;
  onChange(settings: TypeScaleSettings): void;
}

export interface TypeScalePreviewProps {
  settings: TypeScaleSettings;
}

export interface ChoiceFieldProps {
  label: string;
  value: string;
  choices: readonly { value: string; label: string }[];
  onChange(value: string): void;
}

export interface NumberFieldRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  onChange(value: number): void;
}
