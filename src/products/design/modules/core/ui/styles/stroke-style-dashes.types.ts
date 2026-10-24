import type { StrokeStyleValue } from "@design";

export interface StrokeStyleDashesProps {
  value: StrokeStyleValue;
  onChange: (patch: Partial<StrokeStyleValue>) => void;
}
