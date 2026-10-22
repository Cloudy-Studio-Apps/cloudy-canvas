import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";

export type CommitTarget = HTMLInputElement | HTMLTextAreaElement;

export interface CommitFieldPropsOptions {
  /** `enter` (inputs) or `mod-enter` (Ctrl/Cmd+Enter, for multi-line text). */
  commitOn?: "enter" | "mod-enter";
  /** Selects the text when the field gets focus (e.g. numbers you retype). */
  selectOnFocus?: boolean;
}

/** What a committing `<input>` or `<textarea>` spreads (see `commitFieldProps`). */
export interface CommitFieldBindings<T extends CommitTarget> {
  value: string;
  "aria-invalid": true | undefined;
  /** The error, shown as a tooltip; `undefined` without one. */
  title: string | undefined;
  onChange: (event: ChangeEvent<T>) => void;
  onFocus: (event: FocusEvent<T>) => void;
  onBlur: () => void;
  onKeyDown: (event: KeyboardEvent<T>) => void;
}
