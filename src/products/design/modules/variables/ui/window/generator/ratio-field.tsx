import { SCALE_RATIOS } from "@canvas";
import { NumberField } from "@design/ui/components/panel";
import { SelectField } from "@shared/ui/kit";
import type { ScalePartProps } from "./generator.types";

const CUSTOM = "custom";

/** How much each step grows: a named musical ratio, or any number. */
export function RatioField({ draft, change }: ScalePartProps) {
  const preset = SCALE_RATIOS.find((r) => r.ratio === draft.ratio);
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="text-muted-foreground">Each step grows by</span>
      <div className="flex gap-1.5">
        <SelectField
          label="Ratio"
          value={preset ? String(preset.ratio) : CUSTOM}
          options={[
            ...SCALE_RATIOS.map((r) => ({
              value: String(r.ratio),
              label: `${r.label} · ${r.ratio}`,
            })),
            { value: CUSTOM, label: "Custom" },
          ]}
          onChange={(value) => value !== CUSTOM && change({ ratio: Number(value) })}
          className="flex-1"
        />
        <NumberField
          prefix="×"
          label="Ratio"
          min={1.01}
          value={draft.ratio}
          onCommit={(ratio) => change({ ratio: Math.max(1.01, ratio) })}
          className="w-20"
        />
      </div>
    </div>
  );
}
