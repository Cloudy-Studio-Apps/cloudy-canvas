import { SCALE_RATIOS } from "@canvas";
import { NumberField } from "@design/ui/components/panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import type { ScalePartProps } from "./generator.types";

const CUSTOM = "custom";

/** How much each step grows: a named musical ratio, or any number. */
export function RatioField({ draft, change }: ScalePartProps) {
  const preset = SCALE_RATIOS.find((r) => r.ratio === draft.ratio);
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="text-muted-foreground">Each step grows by</span>
      <div className="flex gap-1.5">
        <Select
          value={preset ? String(preset.ratio) : CUSTOM}
          onValueChange={(value) => value !== CUSTOM && change({ ratio: Number(value) })}
        >
          <SelectTrigger aria-label="Ratio" className="h-7 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCALE_RATIOS.map((r) => (
              <SelectItem key={r.ratio} value={String(r.ratio)}>
                {r.label} · {r.ratio}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM}>Custom</SelectItem>
          </SelectContent>
        </Select>
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
