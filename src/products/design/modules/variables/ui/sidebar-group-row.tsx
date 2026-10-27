import { ChevronRight, SquareArrowOutUpRight } from "lucide-react";
import { useState } from "react";

import { resolveVariable } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import { VariableRow } from "./variable-row";
import { cssColor } from "./window/css-color";
import { groupLabel, typeGlyph } from "./window/group-kinds";
import { openWindowAt } from "./window/jump-to-group";
import type { SidebarGroupRowProps } from "./variables-ui.types";
import { t } from "../variables.i18n";

/**
 * A group in the properties panel, as the Variables window's outline shows it (swatches or its
 * number kind, its count); it unfolds to its variables, and ↗ opens the window at it.
 */
export function SidebarGroupRow({
  collectionId,
  group,
  items,
  modes,
  editingId,
  setEditingId,
  onDelete,
}: SidebarGroupRowProps) {
  const { store } = useDocumentTokens();
  const [open, setOpen] = useState(false);
  const first = items[0];
  return (
    <div className="flex flex-col">
      <div className="group/row flex h-7 items-center gap-1 rounded-md pr-0.5 hover:bg-muted">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          title={`${group || t("common.ungrouped")} · ${groupLabel(store, items)}`}
          className="flex h-full min-w-0 flex-1 items-center gap-1.5 pl-1 text-left text-xs"
        >
          <ChevronRight
            className={cn(
              "size-3 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          {first && first.type !== "color" ? (
            <span className="w-4 shrink-0 text-center text-[11px] text-muted-foreground">
              {typeGlyph(first)}
            </span>
          ) : (
            <span className="flex shrink-0 gap-px">
              {items.slice(0, 3).map((v) => {
                const value = resolveVariable(store, v.id, modes);
                return (
                  <i
                    key={v.id}
                    className="block h-3 w-1.5 rounded-[1px]"
                    style={{
                      backgroundColor: value?.type === "color" ? cssColor(value.color) : undefined,
                    }}
                  />
                );
              })}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">{group || t("common.ungrouped")}</span>
          <span className="text-[11px] text-subtle-foreground">{items.length}</span>
        </button>
        <button
          type="button"
          aria-label={group ? t("sidebar.openGroup", { group }) : t("sidebar.openThisGroup")}
          title={t("sidebar.open")}
          onClick={() => openWindowAt(collectionId, group)}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover/row:opacity-100 hover:bg-surface hover:text-foreground"
        >
          <SquareArrowOutUpRight className="size-3" />
        </button>
      </div>
      {open && (
        <div className="ml-4 flex flex-col">
          {items.map((variable) => (
            <VariableRow
              key={variable.id}
              variable={variable}
              modes={modes}
              editing={editingId === variable.id}
              setEditing={(on) => setEditingId(on ? variable.id : null)}
              onDelete={() => onDelete([variable.id])}
            />
          ))}
        </div>
      )}
    </div>
  );
}
