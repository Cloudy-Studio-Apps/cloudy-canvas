import { commitFieldProps, useCommitField } from "@canvas-ui";
import { FieldBox, NumberField, PropertyGrid } from "@design/ui/components/panel";
import { SelectField } from "@shared/ui/kit";
import {
  DASH_STYLES,
  dashStyle,
  dashStylePatch,
  formatDashes,
  parseDashes,
  type DashStyle,
} from "../sections/stroke";
import type { StrokeStyleDashesProps } from "./stroke-style-dashes.types";

/** A stroke style's dash style and its lengths (as the Strokes section's settings set them). */
export function StrokeStyleDashes({ value, onChange }: StrokeStyleDashesProps) {
  const style = dashStyle(value);
  const pattern = useCommitField(formatDashes(value.strokeDashes), (draft) => {
    const dashes = parseDashes(draft);
    if (dashes === null) return "Enter lengths, e.g. 8, 4";
    onChange({ strokeDashes: dashes });
  });
  const patternProps = commitFieldProps<HTMLInputElement>(pattern, { selectOnFocus: true });
  const [dash = 0, gap = 0] = value.strokeDashes;
  return (
    <>
      <SelectField
        label="Dash style"
        value={style}
        options={DASH_STYLES}
        onChange={(next) => onChange(dashStylePatch(next as DashStyle, value) as never)}
      />
      {style === "dashed" && (
        <PropertyGrid>
          <NumberField
            prefix="D"
            label="Dash length"
            min={0}
            value={dash}
            onCommit={(next) => onChange({ strokeDashes: [next, gap] })}
          />
          <NumberField
            prefix="G"
            label="Gap length"
            min={0}
            value={gap}
            onCommit={(next) => onChange({ strokeDashes: [dash, next] })}
          />
        </PropertyGrid>
      )}
      {style === "dotted" && (
        <NumberField
          prefix="G"
          label="Space between dots"
          min={0}
          value={gap}
          onCommit={(next) => onChange({ strokeDashes: [0, next] })}
        />
      )}
      {style === "custom" && (
        <FieldBox title={patternProps.title ?? "Dash pattern"} invalid={!!pattern.error}>
          <span className="shrink-0 text-subtle-foreground">Pattern</span>
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a bare input inside its FieldBox */}
          <input
            aria-label="Dash pattern"
            placeholder="dash, gap, …"
            {...patternProps}
            className="min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none placeholder:text-subtle-foreground"
          />
        </FieldBox>
      )}
    </>
  );
}
