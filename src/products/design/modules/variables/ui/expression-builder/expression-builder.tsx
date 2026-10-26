import { useState } from "react";

import { DOCUMENT_TOKENS, formatExpression, formulaOf, formulaText, type Formula } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import type { ExpressionBuilderProps } from "./expression-builder.types";
import { FormulaEditor } from "./formula-editor";
import { FormulaPreview } from "./formula-preview";

/** A formula that only starts from a number. */
const startingAt = (value: number): Formula => ({
  start: { kind: "number", value },
  steps: [],
  rounding: "none",
  min: null,
  max: null,
});

/**
 * The visual way to write an expression: pick what it starts from and add steps with variables
 * picked from the list, with the result shown as it's built; Apply writes it as one undo step.
 * An expression written by hand in another shape shows as text, with Start over.
 */
export function ExpressionBuilder({
  variable,
  mode,
  expr,
  start,
  modes,
  children,
}: ExpressionBuilderProps) {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Formula | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDraft(expr === null ? startingAt(start) : formulaOf(expr));
    setError(null);
  };
  const apply = () => {
    if (!draft) return;
    try {
      engine.service(DOCUMENT_TOKENS).setValue(variable.id, mode, { expr: formulaText(draft) });
      setOpen(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) reset();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex max-h-[min(36rem,80vh)] w-80 flex-col gap-3 overflow-y-auto p-3"
      >
        <div>
          <h4 className="text-sm font-semibold">Work out {variable.name}</h4>
          <p className="text-xs text-muted-foreground">
            Build it from other variables: when they change, it follows.
          </p>
        </div>
        {draft ? (
          <>
            <FormulaEditor
              formula={draft}
              onChange={(next) => {
                setDraft(next);
                setError(null);
              }}
              modes={modes}
            />
            <FormulaPreview expr={formulaText(draft)} modes={modes} />
          </>
        ) : (
          <div className="flex flex-col gap-2 text-xs">
            <p className="text-muted-foreground">
              This expression is written in a way the builder can't show. Edit it as text, or start
              over here.
            </p>
            {expr ? (
              <code className="rounded-md bg-surface-sunken px-2 py-1.5 font-mono break-words">
                {formatExpression(store, expr)}
              </code>
            ) : null}
            <Button
              variant="outline"
              size="xs"
              className="self-start"
              onClick={() => setDraft(startingAt(start))}
            >
              Start over
            </Button>
          </div>
        )}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="xs" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="xs" disabled={!draft} onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
