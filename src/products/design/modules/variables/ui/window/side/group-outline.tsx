import { resolveVariable } from "@canvas";
import { cssColor } from "../css-color";
import { groupLabel, typeGlyph } from "../group-kinds";
import { variablesByGroup } from "../group-paths";
import { jumpToGroup } from "../jump-to-group";
import { useBoard } from "../use-board";
import type { GroupOutlineProps } from "./side.types";
import { t } from "../../../variables.i18n";

/**
 * The open collection's groups under it: a color group by three of its swatches, a number group by
 * its kind's glyph, with its count; a click scrolls the board to it.
 */
export function GroupOutline({ collection }: GroupOutlineProps) {
  const { store } = useBoard();
  const groups = variablesByGroup(store.variables(collection.id));
  if (groups.size === 0) return null;
  return (
    <div className="mb-1.5 ml-2 flex flex-col border-l border-border pl-1.5">
      {[...groups].map(([group, items]) => {
        const first = items[0];
        return (
          <button
            key={group}
            type="button"
            onClick={() => jumpToGroup(group)}
            title={`${group || t("common.ungrouped")} · ${groupLabel(store, items)}`}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {first && first.type !== "color" ? (
              <span className="w-4 text-center text-[11px]">{typeGlyph(first)}</span>
            ) : (
              <span className="flex gap-px">
                {items.slice(0, 3).map((v) => {
                  const value = resolveVariable(store, v.id, {});
                  return (
                    <i
                      key={v.id}
                      className="block h-2.5 w-1.5 rounded-[1px]"
                      style={{
                        backgroundColor:
                          value?.type === "color" ? cssColor(value.color) : undefined,
                      }}
                    />
                  );
                })}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate">{group || t("common.ungrouped")}</span>
            <span className="text-[11px] text-subtle-foreground">{items.length}</span>
          </button>
        );
      })}
    </div>
  );
}
