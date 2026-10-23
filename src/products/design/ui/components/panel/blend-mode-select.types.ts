import type { LayerBlendMode } from "@design";

export interface BlendModeSelectProps {
  /** The mode shown, or `null` for "Mixed". */
  value: LayerBlendMode | null;
  onChange(mode: LayerBlendMode): void;
  /** Whether "Pass through" is offered (layers; paints and single shapes blend normally). */
  passThrough?: boolean;
  label?: string;
}
