import { clamp } from "@canvas";
import { useScrubUndo } from "../../use-scrub-undo";
import { commitFieldProps, useCommitField } from "../commit-field";
import { evaluateNumber, useScrub } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import type { PercentInputProps } from "./color.types";
import { t } from "../components.i18n";

/**
 * A bare input for a 0–100% value (stored 0–1), with its "%"; place it in a `FieldBox`. Drag the
 * "%" sideways to scrub it (one undo step; Shift: ×10), Up/Down step it by 1% (Shift: 10%), and it
 * takes arithmetic like the kit's `NumberInput`.
 */
export function PercentInput({ value, label, onCommit }: PercentInputProps) {
  const field = useCommitField(String(Math.round(value * 100)), (draft) => {
    const percent = evaluateNumber(draft);
    if (percent === null) return t("color.percentError");
    onCommit(clamp(percent, 0, 100) / 100);
  });
  const bindings = commitFieldProps<HTMLInputElement>(field, { selectOnFocus: true });
  const undo = useScrubUndo();
  const scrub = useScrub({
    value,
    min: 0,
    max: 1,
    scrubStep: 1,
    factor: 100,
    decimals: 0,
    onChange: (next) => onCommit(next),
    onStart: undo.onScrubStart,
    onEnd: undo.onScrubEnd,
    onClick: () => undefined,
  });

  return (
    <>
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a bare input inside its FieldBox */}
      <input
        aria-label={label}
        inputMode="decimal"
        {...bindings}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            const base = evaluateNumber(field.draft) ?? value * 100;
            const delta = (event.shiftKey ? 10 : 1) * (event.key === "ArrowUp" ? 1 : -1);
            const next = clamp(Math.round(base + delta), 0, 100);
            field.setDraft(String(next));
            onCommit(next / 100);
            return;
          }
          bindings.onKeyDown(event);
        }}
        className="w-full min-w-0 bg-transparent text-foreground tabular-nums outline-none"
      />
      <span
        aria-hidden
        className={cn(
          "cursor-ew-resize text-subtle-foreground select-none hover:text-foreground",
          scrub.scrubbing && "text-foreground",
        )}
        {...scrub.handlers}
      >
        %
      </span>
    </>
  );
}
