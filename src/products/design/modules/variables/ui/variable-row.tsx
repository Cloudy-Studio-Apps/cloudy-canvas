import { CornerDownRight } from "lucide-react";

import { hasOverrides, tokenLeafOf, valueIn } from "@canvas";
import { useDocumentTokens, VariableValue } from "@canvas-ui";
import { cn, Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import { VariableEditor } from "./variable-editor";
import { typeGlyph } from "./window/group-kinds";
import type { VariableRowProps } from "./variables-ui.types";
import { t } from "../variables.i18n";

/** A variable in the panel: its value on this page, its name, what it aliases; click edits it. */
export function VariableRow({ variable, modes, editing, setEditing, onDelete }: VariableRowProps) {
  const { store } = useDocumentTokens();
  const value = valueIn(store, variable.id, modes);
  const alias = value && "alias" in value ? store.variable(value.alias) : undefined;

  return (
    <Popover open={editing} onOpenChange={setEditing}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onKeyDown={(event) => {
            if (event.key === "Delete" || event.key === "Backspace") onDelete();
          }}
          className={cn(
            "flex h-7 w-full items-center gap-2 rounded-md px-1.5 text-left text-xs hover:bg-muted",
            editing && "bg-primary/10",
            variable.hidden && "text-muted-foreground",
          )}
          title={variable.description || variable.name}
        >
          {variable.type === "color" ? (
            <VariableValue variable={variable} modes={modes} round />
          ) : (
            <span className="w-4 shrink-0 text-center text-[11px] text-muted-foreground">
              {typeGlyph(variable)}
            </span>
          )}
          <span className="min-w-0 truncate">{tokenLeafOf(variable.name)}</span>
          {variable.type !== "color" && (
            <VariableValue variable={variable} modes={modes} className="text-subtle-foreground" />
          )}
          <span className="flex-1" />
          {hasOverrides(variable) && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-primary"
              title={t("row.variesBy", {
                axis: store.axis(variable.axisId ?? "")?.name ?? t("row.mode"),
              })}
            />
          )}
          {alias && (
            <span className="flex max-w-24 items-center gap-0.5 truncate text-subtle-foreground">
              <CornerDownRight className="size-3 shrink-0" />
              {tokenLeafOf(alias.name)}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="max-h-[80vh] w-80 overflow-y-auto">
        <VariableEditor variable={variable} onDelete={onDelete} />
      </PopoverContent>
    </Popover>
  );
}
