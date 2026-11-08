import { NumberInput } from "@shared/ui/kit";
import { t } from "../model3d.i18n";
import type { ModelRotationFieldsProps } from "./model-panel.types";

const AXES = ["x", "y", "z"] as const;

/** The model's turn on each axis, in degrees. */
export function ModelRotationFields({ angle, disabled, onChange }: ModelRotationFieldsProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {AXES.map((axis) => (
        <NumberInput
          key={axis}
          label={t(`panel.axis.${axis}`)}
          prefix={axis.toUpperCase()}
          suffix="°"
          value={angle[axis]}
          decimals={1}
          step={1}
          scrubStep={0.5}
          disabled={disabled}
          onChange={(value) => onChange({ ...angle, [axis]: value })}
        />
      ))}
    </div>
  );
}
