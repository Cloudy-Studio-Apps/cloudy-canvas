import type {
  CommitFieldBindings,
  CommitFieldPropsOptions,
  CommitTarget,
} from "./commit-field-props.types";
import type { CommitField } from "./use-commit-field.types";

/**
 * Binds a text field to a `useCommitField` draft: typing edits the draft, Enter (or Ctrl/Cmd+Enter
 * with `commitOn: "mod-enter"`) and blur commit it, Escape reverts it, and an error shows as the
 * tooltip. Every committing field spreads these, so the keys behave the same everywhere.
 */
export function commitFieldProps<T extends CommitTarget>(
  field: CommitField,
  { commitOn = "enter", selectOnFocus = false }: CommitFieldPropsOptions = {},
): CommitFieldBindings<T> {
  return {
    value: field.draft,
    "aria-invalid": field.error ? true : undefined,
    title: field.error ?? undefined,
    onChange: (event) => field.setDraft(event.target.value),
    onFocus: (event) => {
      field.onFocus();
      if (selectOnFocus) event.currentTarget.select();
    },
    onBlur: field.onBlur,
    onKeyDown: (event) => {
      const commits = commitOn === "enter" || event.ctrlKey || event.metaKey;
      if (event.key === "Enter" && commits) event.currentTarget.blur();
      if (event.key === "Escape") {
        field.revert();
        event.currentTarget.blur();
      }
    },
  };
}
