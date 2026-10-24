import { X } from "lucide-react";

import { DEFAULT_VALUE, joinTokenColor, splitTokenColor, valueKeyOf } from "@canvas";
import { FieldBox, HexInput, PercentInput } from "@design/ui/components/panel";
import { notifyError } from "@shared/stores/toast-store";
import { cssColor } from "../css-color";
import { useBoard } from "../use-board";
import { ValueField } from "../../value-field";
import { SwatchInput } from "../../swatch-input";
import { SameAsFirst } from "./same-as-first";
import type { ModeValueCardProps } from "./inspector.types";

/**
 * A color variable in one mode: a big block of its color with the swatch, hex and opacity; in a
 * later mode without its own color, a striped "same as …" to give it one, and × to drop it.
 */
export function ColorModeCard({ variable, mode, first }: ModeValueCardProps) {
  const { tokens, store, modes } = useBoard();
  const key = valueKeyOf(store, mode.id);
  const value = variable.values[key];
  if (!value) {
    return (
      <SameAsFirst variable={variable} mode={mode} firstName={modes[0]?.name ?? "the first"} />
    );
  }
  // Another variable's value: its chip (pick another, or detach to a color of its own).
  if (!("color" in value))
    return <ValueField variable={variable} mode={mode.id} label={mode.name} />;
  const { hex, alpha } = splitTokenColor(value.color);
  const set = (color: string) => {
    try {
      tokens.setValue(variable.id, mode.id, { color });
    } catch (error) {
      notifyError("Couldn't set the color", error);
    }
  };
  return (
    <div className="overflow-hidden rounded-card border border-border">
      <div
        className="relative flex h-15 items-end bg-[length:10px_10px] p-1.5"
        style={{
          backgroundImage: "repeating-conic-gradient(var(--muted) 0 25%, var(--surface) 0 50%)",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: cssColor(value.color) }} />
        <span className="relative rounded-sm bg-surface/85 px-1.5 py-0.5 text-[11px] font-medium">
          {mode.name}
        </span>
      </div>
      <div className="flex items-center gap-1 p-2">
        <FieldBox className="min-w-0 flex-1 gap-0 pl-2">
          <SwatchInput
            color={hex.toLowerCase()}
            label={`${mode.name} color`}
            opacity={alpha}
            onChange={(color, opacity) => set(joinTokenColor(color, opacity))}
          />
          <HexInput
            color={hex}
            label={`${mode.name} hex`}
            className="px-2"
            onCommit={(color) => set(joinTokenColor(color, alpha))}
          />
          <span className="flex h-full w-12 shrink-0 items-center border-l border-surface px-1.5">
            <PercentInput
              value={alpha}
              label={`${mode.name} opacity`}
              onCommit={(next) => set(joinTokenColor(hex, next))}
            />
          </span>
        </FieldBox>
        {!first && key !== DEFAULT_VALUE && (
          <button
            type="button"
            aria-label={`Use ${modes[0]?.name ?? "the first mode"}'s color`}
            title={`Use ${modes[0]?.name ?? "the first mode"}'s color`}
            onClick={() => tokens.clearValue(variable.id, key)}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
