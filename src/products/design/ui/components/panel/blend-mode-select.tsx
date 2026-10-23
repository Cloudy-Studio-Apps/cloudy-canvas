import { Fragment } from "react";

import type { LayerBlendMode } from "@design";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { BLEND_MODE_GROUPS } from "./blend-mode-labels";
import type { BlendModeSelectProps } from "./blend-mode-select.types";

/** Figma's blend mode menu, grouped (darken, lighten, contrast, inversion, component). */
export function BlendModeSelect({
  value,
  onChange,
  passThrough = true,
  label = "Blend mode",
}: BlendModeSelectProps) {
  const groups = BLEND_MODE_GROUPS.map((group) =>
    passThrough ? group : group.filter((mode) => mode.value !== "pass-through"),
  );
  return (
    <Select value={value ?? undefined} onValueChange={(mode) => onChange(mode as LayerBlendMode)}>
      <SelectTrigger aria-label={label} title={label} className="h-7 w-full text-xs">
        <SelectValue placeholder="Mixed" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group, i) => (
          <Fragment key={i}>
            {i > 0 && <SelectSeparator />}
            {group.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}
