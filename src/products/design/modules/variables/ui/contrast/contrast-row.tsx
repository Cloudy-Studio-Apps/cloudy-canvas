import { X } from "lucide-react";

import { resolveVariable } from "@canvas";
import { TokenSwatch, useDocumentTokens } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import { GradeBadge } from "./grade-badge";
import type { ContrastRowProps } from "./contrast-ui.types";

/** One pair: the other color, "text on" or "under" it, and its ratio and grade in each mode. */
export function ContrastRow({ check, from, onRemove }: ContrastRowProps) {
  const { store } = useDocumentTokens();
  const otherId = check.text === from ? check.surface : check.text;
  const other = store.variable(otherId);
  const value = resolveVariable(store, otherId, {});
  if (!other) return null;
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border px-2 py-1.5 text-xs">
      <div className="flex items-center gap-2">
        {value?.type === "color" && <TokenSwatch color={value.color} />}
        <span className="truncate">
          {check.text === from ? "on " : "under "}
          {other.name}
        </span>
        <span className="ml-auto text-[10px] text-subtle-foreground">
          {check.declared ? "paired" : "auto"}
        </span>
        {onRemove && (
          <IconButton size="xs" label="Remove this pair" onClick={onRemove}>
            <X />
          </IconButton>
        )}
      </div>
      {check.results.map((result) => (
        <div key={result.label || "current"} className="flex items-center gap-2">
          <span className="text-muted-foreground">{result.label || "Now"}</span>
          <span className="ml-auto font-mono">{result.ratio.toFixed(1)}:1</span>
          <GradeBadge grade={result.grade} />
        </div>
      ))}
    </div>
  );
}
