import { Braces, Sigma, Wand2 } from "lucide-react";
import { useRef } from "react";

import {
  DOCUMENT_TOKENS,
  formatExpression,
  parsedExpression,
  readExpression,
  resolveVariable,
} from "@canvas";
import { commitFieldProps, useCommitField, useDocumentTokens, VariablePicker } from "@canvas-ui";
import { FieldBox } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn, IconButton } from "@shared/ui/kit";
import { ExpressionBuilder } from "./expression-builder";
import type { ExpressionInputProps } from "./variables-ui.types";
import { t } from "../variables.i18n";

/**
 * A number variable's expression for one mode (`{space/base} * 2`), typed with variables' names,
 * what it works out to after it (or why it was refused, in red), a picker that puts a variable's
 * name where the caret was, and the visual builder.
 */
export function ExpressionInput({
  variable,
  mode,
  expr,
  modes,
  label,
  className,
}: ExpressionInputProps) {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const input = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const result = resolveVariable(store, variable.id, modes);
  const commit = (text: string) => {
    try {
      const stored = readExpression(store, text);
      engine.service(DOCUMENT_TOKENS).setValue(variable.id, mode, { expr: stored });
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  };
  const field = useCommitField(formatExpression(store, expr), commit);
  const bindings = commitFieldProps<HTMLInputElement>(field);

  /** Puts `{name}` where the caret was: written when the text reads, else left to finish. */
  const insert = (id: string) => {
    const name = formatExpression(store, `{${id}}`);
    const at = Math.min(caret.current ?? field.draft.length, field.draft.length);
    const before = field.draft.slice(0, at);
    const text = `${before}${before && !/\s$/.test(before) ? " " : ""}${name}${field.draft.slice(at)}`;
    if (parsedExpression(text) && !commit(text)) return;
    field.setDraft(text);
    setTimeout(() => {
      input.current?.focus();
      const end = before.length + name.length + 1;
      input.current?.setSelectionRange(end, end);
    }, 0);
  };

  return (
    <FieldBox className={cn("min-w-0 flex-1 gap-1 pl-2", className)}>
      <Sigma className="size-3.5 shrink-0 text-subtle-foreground" />
      <input
        ref={input}
        aria-label={t("expression.label", { label })}
        placeholder="{space/base} * 2"
        {...bindings}
        onBlur={(event) => {
          caret.current = event.currentTarget.selectionStart;
          bindings.onBlur();
        }}
        className="h-full min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
      />
      {field.error ? (
        <span className="shrink-0 truncate text-xs text-destructive" title={field.error}>
          {t("expression.notApplied")}
        </span>
      ) : (
        <span className="shrink-0 text-xs text-subtle-foreground tabular-nums">
          = {result?.type === "number" ? Math.round(result.number * 100) / 100 : "?"}
        </span>
      )}
      <VariablePicker type="number" scopes={[]} value={null} modes={modes} onPick={insert}>
        <IconButton label={t("expression.insert")} size="xs">
          <Braces />
        </IconButton>
      </VariablePicker>
      <ExpressionBuilder
        variable={variable}
        mode={mode}
        expr={expr}
        start={result?.type === "number" ? result.number : 0}
        modes={modes}
      >
        <IconButton label={t("expression.build")} size="xs">
          <Wand2 />
        </IconButton>
      </ExpressionBuilder>
    </FieldBox>
  );
}
