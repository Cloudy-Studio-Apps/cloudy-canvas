import { useRef } from "react";
import { Braces } from "lucide-react";

import { commitFieldProps, useCommitField } from "@canvas-ui";
import { Field, IconButton, Input } from "@shared/ui/kit";
import { FieldPicker } from "./field-picker";
import type { TextTemplateFieldProps } from "./text-template-field.types";
import { t } from "../../data.i18n";

/**
 * A bound text's template on one line: typed text with `{expr}` tokens, committed on Enter or
 * blur. The picker inserts `{expr}` where the caret was.
 */
export function TextTemplateField({ value, names, onCommit }: TextTemplateFieldProps) {
  const field = useCommitField(value, (text) => onCommit(text));
  const input = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const bindings = commitFieldProps<HTMLInputElement>(field);

  const insert = (expr: string) => {
    const at = Math.min(caret.current ?? field.draft.length, field.draft.length);
    const token = `{${expr}}`;
    const next = field.draft.slice(0, at) + token + field.draft.slice(at);
    field.setDraft(next);
    onCommit(next);
    caret.current = at + token.length;
    requestAnimationFrame(() => {
      const el = input.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(at + token.length, at + token.length);
    });
  };

  return (
    <Field label={t("section.text.template")} hint={t("section.text.hint")}>
      {(id) => (
        <div className="flex min-w-0 items-center gap-1">
          <Input
            {...bindings}
            id={id}
            ref={input}
            onSelect={(event) => {
              caret.current = event.currentTarget.selectionStart;
            }}
            className="h-7 min-w-0 flex-1 font-mono text-xs"
          />
          <FieldPicker names={names} onPick={insert}>
            <IconButton size="xs" label={t("section.text.insert")}>
              <Braces />
            </IconButton>
          </FieldPicker>
        </div>
      )}
    </Field>
  );
}
