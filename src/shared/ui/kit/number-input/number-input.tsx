import { useRef, useState } from "react";

import { cn } from "@shared/ui/lib/utils";
import { FieldBox } from "../field-box";
import { evaluateNumber } from "./evaluate-number";
import type { NumberInputProps } from "./number-input.types";
import { clampNumber, roundTo } from "./round-to";
import { useScrub } from "./use-scrub";

/**
 * The compact number field of every panel (W 630, X 120, 45°), as in Figma:
 * - drag the prefix (or the suffix, "%") sideways to change the value live (right adds, left
 *   takes away; Shift: ×10),
 * - Up/Down add or take away `step` (Shift: ×10), each press a change,
 * - type a value or arithmetic ("120+24"); Enter or blur commits, Escape reverts.
 * Shows "Mixed" for `null`.
 */
export function NumberInput({
  value,
  onChange,
  label,
  prefix,
  suffix,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  scrubStep = step,
  factor = 1,
  decimals = 2,
  onScrubStart,
  onScrubEnd,
  disabled,
  className,
}: NumberInputProps) {
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const shown = value === null ? "" : String(roundTo(value * factor, decimals));
  // Escape reverts and blurs in one event: the blur must not commit what it still sees.
  const reverted = useRef(false);

  const commit = (next: number) => {
    const clamped = clampNumber(roundTo(next, decimals + 4), min, max);
    if (clamped !== value) onChange(clamped, { done: true });
  };
  const commitDraft = () => {
    if (draft === null || draft === shown) return true;
    const typed = evaluateNumber(draft);
    if (typed === null) return false;
    commit(typed / factor);
    return true;
  };
  const scrub = useScrub({
    value,
    min,
    max,
    scrubStep,
    factor,
    decimals,
    disabled,
    onChange,
    onStart: onScrubStart,
    onEnd: onScrubEnd,
    onClick: () => input.current?.select(),
  });

  return (
    <FieldBox
      title={invalid ? "Enter a number" : label}
      invalid={invalid}
      className={cn(
        scrub.scrubbing && "border-ring bg-surface",
        disabled && "opacity-50",
        className,
      )}
    >
      {prefix !== undefined && (
        <span
          aria-hidden
          className={cn(
            "flex min-w-3 shrink-0 justify-center text-subtle-foreground select-none [&_svg]:size-3",
            !disabled && value !== null && "cursor-ew-resize hover:text-foreground",
            scrub.scrubbing && "text-foreground",
          )}
          {...scrub.handlers}
        >
          {prefix}
        </span>
      )}
      <input
        ref={input}
        aria-label={label}
        inputMode="decimal"
        disabled={disabled}
        placeholder={value === null ? "Mixed" : undefined}
        value={draft ?? shown}
        onChange={(event) => {
          setDraft(event.target.value);
          setInvalid(false);
        }}
        onFocus={(event) => {
          reverted.current = false;
          setDraft(shown);
          event.currentTarget.select();
        }}
        onBlur={() => {
          if (!reverted.current) setInvalid(!commitDraft());
          reverted.current = false;
          setDraft(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (commitDraft()) {
              setInvalid(false);
              setDraft(null);
              event.currentTarget.blur();
            } else setInvalid(true);
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            reverted.current = true;
            setInvalid(false);
            event.currentTarget.blur();
          } else if ((event.key === "ArrowUp" || event.key === "ArrowDown") && value !== null) {
            event.preventDefault();
            const base = (draft !== null ? evaluateNumber(draft) : null) ?? value * factor;
            const delta = step * (event.shiftKey ? 10 : 1) * (event.key === "ArrowUp" ? 1 : -1);
            const next = clampNumber(
              roundTo(base / factor + delta / factor, decimals + 4),
              min,
              max,
            );
            setDraft(String(roundTo(next * factor, decimals)));
            setInvalid(false);
            if (next !== value) onChange(next, { done: true });
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none placeholder:text-subtle-foreground disabled:cursor-not-allowed"
      />
      {suffix && (
        <span
          aria-hidden
          className={cn(
            "shrink-0 text-subtle-foreground select-none",
            !disabled && value !== null && "cursor-ew-resize hover:text-foreground",
          )}
          {...scrub.handlers}
        >
          {suffix}
        </span>
      )}
    </FieldBox>
  );
}
