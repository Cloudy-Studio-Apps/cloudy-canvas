import { Input } from "@ui/components/ui/input";
import { useCommitField } from "./use-commit-field";
import type { CommitInputProps } from "./commit-input.types";

/** Input that commits on blur or Enter and reverts on Escape. Shows the commit error as a tooltip. */
export function CommitInput({ value, onCommit, title, ...props }: CommitInputProps) {
  const field = useCommitField(value, onCommit);

  return (
    <Input
      {...props}
      value={field.draft}
      aria-invalid={field.error ? true : undefined}
      title={field.error ?? title}
      onChange={(event) => field.setDraft(event.target.value)}
      onFocus={field.onFocus}
      onBlur={field.onBlur}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          field.revert();
          event.currentTarget.blur();
        }
      }}
    />
  );
}
