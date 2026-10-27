import { useEffect, useRef, useState } from "react";

import { CodeEditor } from "@shared/ui/components/code-editor";
import type { SourceEditorProps, SourceStatus } from "./source-editor.types";
import { t } from "../../board-ui.i18n";

/** Typing pauses this long before the text is applied to the board. */
const APPLY_DELAY_MS = 400;

/**
 * Text view of part of the document (DBML, ER). Valid text is applied while typing; invalid text
 * shows the error and leaves the board as it was. While focused, outside changes don't overwrite
 * the text. `highlight` points out part of the text until it's edited.
 */
export function SourceEditor({
  version,
  read,
  apply,
  label,
  hint,
  highlight,
  language,
  completions,
}: SourceEditorProps) {
  const [text, setText] = useState(read);
  const [syncedVersion, setSyncedVersion] = useState(version);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<SourceStatus>({ warnings: [] });
  /** Typed into since the text was last read from the document. */
  const [edited, setEdited] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (!focused && syncedVersion !== version) {
    setSyncedVersion(version);
    setText(read());
    setEdited(false);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const applyNow = (value: string, commit: boolean): boolean => {
    clearTimeout(timer.current);
    const result = apply(value, commit);
    setStatus(
      result.ok
        ? { warnings: result.warnings.map((w) => `Line ${w.line}: ${w.message}`) }
        : { error: result.error },
    );
    return result.ok;
  };

  const change = (value: string, commit = false) => {
    setText(value);
    setEdited(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => applyNow(value, commit), APPLY_DELAY_MS);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex min-h-72 flex-1 flex-col">
        <CodeEditor
          value={text}
          language={language}
          completions={completions}
          label={label}
          invalid={"error" in status}
          errorLine={"error" in status ? status.error.line : null}
          highlight={edited ? null : (highlight ?? null)}
          onChange={(value, { pasted }) => change(value, pasted)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            // Show the canonical text again once it's valid.
            if (applyNow(text, true)) {
              setSyncedVersion(version);
              setText(read());
              setEdited(false);
            }
          }}
        />
      </div>
      {"error" in status ? (
        <p role="alert" className="text-xs text-destructive">
          {t("sourceEditor.lineError", { line: status.error.line, message: status.error.message })}
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
