import { evaluateExpression, formatExpression, parsedExpression, resolveVariable } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import type { FormulaPreviewProps } from "./expression-builder.types";

/** What a formula reads as text (with names) and what it works out to in `modes`. */
export function FormulaPreview({ expr, modes }: FormulaPreviewProps) {
  const { store } = useDocumentTokens();
  const tree = parsedExpression(expr);
  const result = tree
    ? evaluateExpression(tree, (ref) => {
        const value = resolveVariable(store, ref, modes);
        return value?.type === "number" ? value.number : null;
      })
    : null;
  return (
    <div className="flex items-baseline gap-2 rounded-md bg-surface-sunken px-2 py-1.5 text-xs">
      <code className="min-w-0 flex-1 font-mono break-words text-muted-foreground">
        {formatExpression(store, expr)}
      </code>
      <span className="shrink-0 font-medium tabular-nums">
        = {result === null ? "?" : Math.round(result * 100) / 100}
      </span>
    </div>
  );
}
