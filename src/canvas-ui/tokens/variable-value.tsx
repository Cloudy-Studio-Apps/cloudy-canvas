import { resolveVariable, valueIn } from "@canvas";
import { cn } from "@shared/ui/lib/utils";
import { TokenSwatch } from "./token-swatch";
import type { VariableValueProps } from "./tokens.types";
import { useDocumentTokens } from "./use-document-tokens";
import { t } from "./tokens.i18n";

/**
 * What a variable resolves to in `modes`: a swatch, its number (marked ƒ when an expression works
 * it out), its text, or True/False.
 */
export function VariableValue({ variable, modes, round, className }: VariableValueProps) {
  const { store } = useDocumentTokens();
  const value = resolveVariable(store, variable.id, modes);
  if (!value) return <span className={cn("text-xs text-destructive", className)}>?</span>;
  if (value.type === "color") {
    return <TokenSwatch color={value.color} round={round} className={className} />;
  }
  if (value.type === "string") {
    return (
      <span
        className={cn("max-w-24 truncate text-xs text-muted-foreground", className)}
        title={value.string}
      >
        “{value.string}”
      </span>
    );
  }
  if (value.type === "boolean") {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        {value.boolean ? t("value.true") : t("value.false")}
      </span>
    );
  }
  if (value.type !== "number") return null;
  const own = valueIn(store, variable.id, modes);
  return (
    <span className={cn("min-w-4 text-xs text-muted-foreground tabular-nums", className)}>
      {own && "expr" in own ? <span className="mr-0.5 italic opacity-60">ƒ</span> : null}
      {Math.round(value.number * 100) / 100}
    </span>
  );
}
