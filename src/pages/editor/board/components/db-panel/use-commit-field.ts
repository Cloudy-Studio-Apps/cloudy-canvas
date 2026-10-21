import { useState } from "react";

import type { CommitField, CommitHandler } from "./use-commit-field.types";

/**
 * Local draft for a text field that writes to the document only on commit (blur / Enter), so each
 * edit is one undo step. Follows outside changes to `value` while the field isn't focused.
 */
export function useCommitField(value: string, onCommit: CommitHandler): CommitField {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!focused && synced !== value) {
    setSynced(value);
    setDraft(value);
    setError(null);
  }

  return {
    draft,
    error,
    setDraft: (next) => {
      setDraft(next);
      setError(null);
    },
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      if (draft === value) return;
      setError(onCommit(draft) ?? null);
    },
    revert: () => {
      setDraft(value);
      setError(null);
    },
  };
}
