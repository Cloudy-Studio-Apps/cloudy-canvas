import { resolveVariable } from "@canvas";
import { cn } from "@shared/ui/lib/utils";
import { TokenSwatch } from "./token-swatch";
import type { VariableValueProps } from "./tokens.types";
import { useDocumentTokens } from "./use-document-tokens";

/** What a variable resolves to in `modes`: a swatch, or its number. */
export function VariableValue({ variable, modes, round, className }: VariableValueProps) {
  const { store } = useDocumentTokens();
  const value = resolveVariable(store, variable.id, modes);
  if (!value) return <span className={cn("text-xs text-destructive", className)}>?</span>;
  if (value.type === "color") {
    return <TokenSwatch color={value.color} round={round} className={className} />;
  }
  if (value.type !== "number") return null;
  return (
    <span className={cn("min-w-4 text-xs text-muted-foreground tabular-nums", className)}>
      {Math.round(value.number * 100) / 100}
    </span>
  );
}
