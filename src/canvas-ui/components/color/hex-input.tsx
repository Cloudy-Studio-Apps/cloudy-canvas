import { commitFieldProps, useCommitField } from "../commit-field";
import { normalizeHex } from "../normalize-hex";
import { cn } from "@shared/ui/lib/utils";
import type { HexInputProps } from "./color.types";

/** A bare input for a hex color (no `#`), committed on Enter or blur; place it in a `FieldBox`. */
export function HexInput({ color, label, onCommit, className }: HexInputProps) {
  const field = useCommitField(color.replace("#", "").toUpperCase(), (draft) => {
    const next = normalizeHex(draft);
    if (!next) return "Enter a hex color, like FF8800";
    onCommit(next);
  });
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a bare input inside its FieldBox
    <input
      aria-label={label}
      spellCheck={false}
      {...commitFieldProps<HTMLInputElement>(field)}
      className={cn(
        "min-w-0 flex-1 bg-transparent font-mono text-foreground uppercase outline-none",
        className,
      )}
    />
  );
}
