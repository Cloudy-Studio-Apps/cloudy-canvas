import { useCommitField } from "@canvas-ui";
import { cn } from "@shared/ui/lib/utils";
import type { NumberFieldProps } from "./number-field.types";

/** Shown rounded to this many decimals. */
const DECIMALS = 2;

/**
 * A compact number box (X 120): commits on Enter or blur as one undo step, reverts on Escape, and
 * shows "Mixed" when the selection's values differ.
 */
export function NumberField({
  prefix,
  label,
  value,
  suffix,
  min = -Infinity,
  max = Infinity,
  onCommit,
  className,
}: NumberFieldProps) {
  const field = useCommitField(value === null ? "" : format(value), (draft) => {
    const parsed = Number(draft.trim());
    if (draft.trim() === "" || !Number.isFinite(parsed)) return "Enter a number";
    onCommit(Math.min(max, Math.max(min, parsed)));
  });

  return (
    <label
      title={field.error ?? label}
      className={cn(
        "flex h-7 min-w-0 items-center gap-1.5 rounded-sm border border-transparent bg-muted px-2 text-xs focus-within:border-ring focus-within:bg-surface hover:border-border",
        field.error && "border-destructive",
        className,
      )}
    >
      <span className="flex w-3 shrink-0 justify-center text-subtle-foreground [&_svg]:size-3">
        {prefix}
      </span>
      <input
        aria-label={label}
        aria-invalid={field.error ? true : undefined}
        inputMode="decimal"
        value={field.draft}
        placeholder={value === null ? "Mixed" : undefined}
        onChange={(event) => field.setDraft(event.target.value)}
        onFocus={(event) => {
          field.onFocus();
          event.currentTarget.select();
        }}
        onBlur={field.onBlur}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            field.revert();
            event.currentTarget.blur();
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none placeholder:text-subtle-foreground"
      />
      {suffix && <span className="text-subtle-foreground">{suffix}</span>}
    </label>
  );
}

function format(value: number): string {
  return String(Number(value.toFixed(DECIMALS)));
}
