import { useRef, useState } from "react";

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
  // Escape reverts and then blurs in the same event, before the reverted draft renders; the blur
  // must not commit the draft it still sees.
  const reverted = useRef(false);

  if (!focused && synced !== value) {
    setSynced(value);
    setDraft(value);
    setError(null);
  }

  return {
    draft,
    error,
    setDraft: (next) => {
      reverted.current = false;
      setDraft(next);
      setError(null);
    },
    onFocus: () => {
      reverted.current = false;
      setFocused(true);
    },
    onBlur: () => {
      setFocused(false);
      if (reverted.current) {
        reverted.current = false;
        return;
      }
      if (draft === value) return;
      setError(onCommit(draft) ?? null);
    },
    revert: () => {
      reverted.current = true;
      setDraft(value);
      setError(null);
    },
  };
}
