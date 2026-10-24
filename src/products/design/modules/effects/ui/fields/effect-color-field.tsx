import { CHECKERBOARD, ColorPicker } from "@canvas-ui";
import { FieldBox, HexInput, PercentInput } from "@design/ui/components/panel";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import type { EffectColorFieldProps } from "./fields.types";

/** An effect's color: a swatch (opens the color controls), its hex and opacity. */
export function EffectColorField({ label, color, opacity, onChange }: EffectColorFieldProps) {
  const alpha = opacity ?? 1;
  return (
    <FieldBox className="gap-1.5">
      <Popover>
        <PopoverTrigger asChild>
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a color swatch */}
          <button
            type="button"
            aria-label={`Edit ${label.toLowerCase()}`}
            className="relative size-3.5 shrink-0 cursor-pointer overflow-hidden rounded-xs border border-border-strong"
            style={{ background: CHECKERBOARD }}
          >
            <span className="absolute inset-0" style={{ backgroundColor: color, opacity: alpha }} />
          </button>
        </PopoverTrigger>
        <PopoverContent side="left" align="start" sideOffset={24} className="w-60 p-3">
          <ColorPicker
            color={color}
            opacity={opacity}
            onChange={(next, info, nextOpacity) =>
              onChange({ color: next, opacity: nextOpacity }, info)
            }
          />
        </PopoverContent>
      </Popover>
      <HexInput
        color={color}
        label={`${label} hex`}
        onCommit={(hex) => onChange({ color: hex, opacity: alpha }, { done: true })}
      />
      {opacity !== undefined && (
        <span className="flex w-12 shrink-0 items-center">
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
