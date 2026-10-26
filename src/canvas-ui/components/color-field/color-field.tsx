import { cn } from "@shared/ui/lib/utils";
import { FieldBox } from "@shared/ui/kit";
import { HexInput, PercentInput } from "../color";
import { ColorPopover } from "./color-popover";
import type { ColorFieldProps } from "./color-field.types";

/**
 * The one color field: a swatch that opens the color picker (a drag is one undo step), the hex
 * and, for colors with one, the opacity. Typed values are reported as done.
 */
export function ColorField({
  color,
  opacity,
  label,
  hex = true,
  onChange,
  className,
}: ColorFieldProps) {
  const alpha = opacity ?? 1;
  return (
    <FieldBox className={cn("gap-0 pl-2", className)}>
      <ColorPopover color={color} opacity={opacity} label={label} onChange={onChange} />
      {hex && (
        <HexInput
          color={color}
          label={`${label} hex`}
          className="px-2"
          onCommit={(next) => onChange({ color: next, opacity: alpha }, { done: true })}
        />
      )}
      {opacity !== undefined && (
        <span className="flex h-full w-12 shrink-0 items-center border-l border-surface px-1.5">
          <PercentInput
            value={opacity}
            label={`${label} opacity`}
            onCommit={(next) => onChange({ color, opacity: next }, { done: true })}
          />
        </span>
      )}
    </FieldBox>
  );
}
