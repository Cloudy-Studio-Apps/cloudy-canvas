import { Minus } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { FieldBox } from "../panel/field-box";
import { HexInput } from "../panel/hex-input";
import { PanelIconButton } from "../panel/panel-section";
import { PercentInput } from "../panel/percent-input";
import type { GradientStopRowProps } from "./paint-picker.types";

/** One stop of the gradient: its position, color and opacity, and removing it. */
export function GradientStopRow({
  paint,
  index,
  selected,
  onSelect,
  onChange,
}: GradientStopRowProps) {
  const stop = paint.stops[index]!;
  const done = { done: true };
  const update = (patch: Partial<typeof stop>) =>
    onChange(
      { ...paint, stops: paint.stops.map((s, i) => (i === index ? { ...s, ...patch } : s)) },
      done,
    );

  return (
    <div
      className={cn("flex items-center gap-1 rounded-sm", selected && "bg-muted")}
      onFocusCapture={onSelect}
      onPointerDown={onSelect}
    >
      <FieldBox className="w-14 gap-0.5">
        <PercentInput
          value={stop.position}
          label="Stop position"
          onCommit={(position) => update({ position })}
        />
      </FieldBox>
      <FieldBox className="flex-1 gap-0 px-0">
        <span
          className="ml-2 size-3.5 shrink-0 rounded-xs border border-border-strong"
          style={{ background: stop.color }}
        />
        <HexInput
          color={stop.color}
          label="Stop hex"
          className="px-2"
          onCommit={(color) => update({ color })}
        />
        <span className="flex h-full w-12 items-center gap-0.5 border-l border-surface px-1.5">
          <PercentInput
            value={stop.opacity}
            label="Stop opacity"
            onCommit={(opacity) => update({ opacity })}
          />
        </span>
      </FieldBox>
      <PanelIconButton
        label="Remove stop"
        disabled={paint.stops.length <= 2}
        onClick={() =>
          onChange({ ...paint, stops: paint.stops.filter((_, i) => i !== index) }, done)
        }
      >
        <Minus />
      </PanelIconButton>
    </div>
  );
}
