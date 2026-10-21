import { useEffect, useRef, useState } from "react";

import { Textarea } from "@ui/components/ui/textarea";
import { useDbVersion } from "../../engine/use-db-table";
import type { DbmlEditorProps, DbmlStatus } from "./dbml-editor.types";

/** Typing pauses this long before the text is applied to the board. */
const APPLY_DELAY_MS = 400;
const INDENT = "  ";

/**
 * DBML text view of the document. Valid text is applied while typing; invalid text shows the
 * error and leaves the board as it was. While focused, outside changes don't overwrite the text.
 * Tables that refs name but nothing defines are only created for pasted text and on blur, so
 * half-typed names don't turn into tables.
 */
export function DbmlEditor({ read, apply, label, hint }: DbmlEditorProps) {
  const version = useDbVersion();
  const [text, setText] = useState(read);
  const [syncedVersion, setSyncedVersion] = useState(version);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<DbmlStatus>({ warnings: [] });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pasted = useRef(false);

  if (!focused && syncedVersion !== version) {
    setSyncedVersion(version);
    setText(read());
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const applyNow = (value: string, commit: boolean): boolean => {
    clearTimeout(timer.current);
    const result = apply(value, { createMissingTables: commit });
    setStatus(
      result.ok
        ? { warnings: result.warnings.map((w) => `Line ${w.line}: ${w.message}`) }
        : { error: result.error },
    );
    return result.ok;
  };

  const change = (value: string, commit = false) => {
    setText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => applyNow(value, commit), APPLY_DELAY_MS);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <Textarea
        aria-label={label}
        spellCheck={false}
        value={text}
        aria-invalid={"error" in status ? true : undefined}
        className="min-h-72 flex-1 resize-none font-mono text-xs leading-relaxed"
        onPaste={() => {
          pasted.current = true;
        }}
        onChange={(event) => {
          change(event.target.value, pasted.current);
          pasted.current = false;
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          // Show the canonical text again once it's valid.
          if (applyNow(text, true)) {
            setSyncedVersion(version);
            setText(read());
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab" || event.shiftKey) return;
          event.preventDefault();
          const el = event.currentTarget;
          const { selectionStart: start, selectionEnd: end } = el;
          const next = text.slice(0, start) + INDENT + text.slice(end);
          change(next);
          requestAnimationFrame(() =>
            el.setSelectionRange(start + INDENT.length, start + INDENT.length),
          );
        }}
      />
      {"error" in status ? (
        <p role="alert" className="text-xs text-destructive">
          Line {status.error.line}: {status.error.message}
        </p>
      ) : (
        <>
          {status.warnings.map((warning) => (
            <p key={warning} className="text-xs text-muted-foreground">
              {warning}
            </p>
          ))}
          <p className="text-xs text-muted-foreground">{hint}</p>
        </>
      )}
    </div>
  );
}
