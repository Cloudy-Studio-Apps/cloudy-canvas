import type { StrokeStyleValue } from "../../styles/stroke-style.types";

export interface StrokeStyleDashesProps {
  value: StrokeStyleValue;
  onChange: (patch: Partial<StrokeStyleValue>) => void;
}
