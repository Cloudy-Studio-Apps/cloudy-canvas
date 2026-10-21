import { Textarea } from "@ui/components/ui/textarea";
import { useCommitField } from "./use-commit-field";
import type { CommitTextareaProps } from "./commit-input.types";

/** Textarea that commits on blur or Ctrl/Cmd+Enter and reverts on Escape. */
export function CommitTextarea({ value, onCommit, ...props }: CommitTextareaProps) {
  const field = useCommitField(value, onCommit);

  return (
    <Textarea
      {...props}
      value={field.draft}
      onChange={(event) => field.setDraft(event.target.value)}
      onFocus={field.onFocus}
      onBlur={field.onBlur}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) event.currentTarget.blur();
        if (event.key === "Escape") {
          field.revert();
          event.currentTarget.blur();
        }
      }}
    />
  );
}
