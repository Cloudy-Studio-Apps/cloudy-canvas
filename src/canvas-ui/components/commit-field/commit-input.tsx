import { Input } from "@shared/ui/components/ui/input";
import { commitFieldProps } from "./commit-field-props";
import { useCommitField } from "./use-commit-field";
import type { CommitInputProps } from "./commit-input.types";

/**
 * Input that commits on blur or Enter and reverts on Escape. Shows the commit error as a tooltip.
 * Its own `onFocus`, `onBlur` and `onKeyDown` run after the field's (e.g. leaving rename mode).
 */
export function CommitInput({
  value,
  onCommit,
  title,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: CommitInputProps) {
  const bindings = commitFieldProps<HTMLInputElement>(useCommitField(value, onCommit));
  return (
    <Input
      {...props}
      {...bindings}
      title={bindings.title ?? title}
      onFocus={(event) => {
        bindings.onFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        bindings.onBlur();
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        bindings.onKeyDown(event);
        onKeyDown?.(event);
      }}
    />
  );
}
