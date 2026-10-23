import { useRef } from "react";

import { clamp } from "@canvas";
import { commitFieldProps, useCommitField } from "@canvas-ui";
import { FieldBox, parseNumber } from "@design/ui/components/panel";
import { cn } from "@shared/ui/lib/utils";
import type { ScrubFieldProps } from "./fields.types";

/** Pixels the pointer moves before a press on the label scrubs instead of focusing. */
const SCRUB_THRESHOLD = 2;

/**
 * A compact number field whose label scrubs: drag it sideways to change the value live (Shift:
 * ten times faster), or type a value (Enter or blur commits, Escape reverts). A drag reports
 * `{ done: false }` steps and `{ done: true }` on release, so it's one undo step.
 */
export function ScrubField({
  prefix,
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  suffix,
  factor = 1,
  className,
}: ScrubFieldProps) {
  const shown = Math.round(value * factor * 100) / 100;
  const field = useCommitField(String(shown), (draft) => {
    const parsed = parseNumber(draft);
    if (parsed === null) return "Enter a number";
    onChange(clamp(parsed / factor, min, max), { done: true });
  });
  const bindings = commitFieldProps<HTMLInputElement>(field, { selectOnFocus: true });
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);

  const scrubTo = (event: React.PointerEvent, done: boolean) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) < SCRUB_THRESHOLD) return;
    state.moved = true;
    const delta = (dx * step * (event.shiftKey ? 10 : 1)) / factor;
    const next = clamp(Math.round((state.start + delta) * 1000) / 1000, min, max);
    onChange(next, { done });
  };

  return (
    <FieldBox title={bindings.title ?? label} invalid={!!field.error} className={className}>
      <span
        aria-hidden
        className="flex min-w-3 shrink-0 cursor-ew-resize justify-center text-subtle-foreground select-none [&_svg]:size-3"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, start: value, moved: false };
        }}
        onPointerMove={(event) => scrubTo(event, false)}
        onPointerUp={(event) => {
          if (drag.current?.moved) scrubTo(event, true);
          drag.current = null;
        }}
        onPointerCancel={() => (drag.current = null)}
      >
        {prefix}
      </span>
      <input
        aria-label={label}
        inputMode="decimal"
        {...bindings}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none",
          "placeholder:text-subtle-foreground",
        )}
      />
      {suffix && <span className="text-subtle-foreground">{suffix}</span>}
    </FieldBox>
  );
}
