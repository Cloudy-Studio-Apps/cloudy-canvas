import type { GeneratorInput, ScaleInput } from "@canvas";

export interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

export interface GeneratorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export interface GeneratorPartProps {
  draft: GeneratorInput;
  change: (patch: Partial<GeneratorInput>) => void;
}

export interface ShadeGeneratorPanelProps {
  draft: GeneratorInput;
}

export interface ShadeStripsProps {
  draft: GeneratorInput;
}

export interface ScalePartProps {
  draft: ScaleInput;
  change: (patch: Partial<ScaleInput>) => void;
}

export interface ScaleStepsListProps {
  draft: ScaleInput;
}

export interface NumberScalePanelProps {
  draft: ScaleInput;
}

export interface StepCountProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}
