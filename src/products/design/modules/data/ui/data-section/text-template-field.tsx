import { useRef } from "react";
import { Braces } from "lucide-react";

import { commitFieldProps, useCommitField } from "@canvas-ui";
import { Field, IconButton, Textarea } from "@shared/ui/kit";
import { FieldPicker } from "./field-picker";
import type { TextTemplateFieldProps } from "./text-template-field.types";
import { t } from "../../data.i18n";

/**
 * A bound text's template, line breaks and all: typed text with `{expr}` tokens, committed on
 * blur or Ctrl/⌘+Enter, Escape reverting it. The picker inserts `{expr}` where the caret was and
 * puts the caret right after it.
 */
export function TextTemplateField({ value, names, onCommit }: TextTemplateFieldProps) {
  const field = useCommitField(value, (text) => onCommit(text));
  const area = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);
  // Where the caret goes once the picker has closed, after an insert.
  const after = useRef<number | null>(null);
  const bindings = commitFieldProps<HTMLTextAreaElement>(field, { commitOn: "mod-enter" });

  const insert = (expr: string) => {
    const at = Math.min(caret.current ?? field.draft.length, field.draft.length);
    const token = `{${expr}}`;
    const next = field.draft.slice(0, at) + token + field.draft.slice(at);
    field.setDraft(next);
    onCommit(next);
    caret.current = at + token.length;
    after.current = at + token.length;
  };

  const refocus = (event: Event) => {
    const el = area.current;
    const at = after.current;
    after.current = null;
    if (!el || at === null) return;
    event.preventDefault();
    el.focus();
    el.setSelectionRange(at, at);
  };

  return (
    <Field
      label={t("section.text.template")}
      hint={t("section.text.hint", { example: `{${t("section.text.exampleWord")}}` })}
    >
      {(id) => (
        <div className="flex min-w-0 items-start gap-1">
          <Textarea
            {...bindings}
            id={id}
            ref={area}
            rows={3}
            onSelect={(event) => {
              caret.current = event.currentTarget.selectionStart;
            }}
            className="min-h-14 min-w-0 flex-1 resize-y px-2 py-1.5 font-mono text-xs"
          />
          <FieldPicker names={names} onPick={insert} onCloseAutoFocus={refocus}>
            <IconButton size="xs" label={t("section.text.insert")}>
              <Braces />
            </IconButton>
          </FieldPicker>
        </div>
      )}
    </Field>
  );
}
