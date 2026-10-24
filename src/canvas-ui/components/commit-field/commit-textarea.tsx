import { Textarea } from "@shared/ui/components/ui/textarea";
import { commitFieldProps } from "./commit-field-props";
import { useCommitField } from "./use-commit-field";
import type { CommitTextareaProps } from "./commit-input.types";

/** Textarea that commits on blur or Ctrl/Cmd+Enter and reverts on Escape. */
export function CommitTextarea({
  value,
  onCommit,
  title,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: CommitTextareaProps) {
  const field = useCommitField(value, onCommit);
  const bindings = commitFieldProps<HTMLTextAreaElement>(field, { commitOn: "mod-enter" });
  return (
    <Textarea
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
