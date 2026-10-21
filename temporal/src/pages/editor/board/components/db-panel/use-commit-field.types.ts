/** Returns an error message to show, or nothing when the value was accepted. */
export type CommitHandler = (value: string) => string | null | void;

export interface CommitField {
  draft: string;
  error: string | null;
  setDraft: (value: string) => void;
  onFocus: () => void;
  /** Commits the draft. */
  onBlur: () => void;
  /** Puts the draft back to the current value. */
  revert: () => void;
}
