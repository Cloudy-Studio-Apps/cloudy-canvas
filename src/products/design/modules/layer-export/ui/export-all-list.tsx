import { useDesignEngine } from "@design/ui/design-engine-context";
import { Checkbox } from "@shared/ui/kit";
import { layerNameOf, type DesignNode } from "../../core";
import { t } from "../layer-export.i18n";
import { hasSize } from "../node-exports";
import type { ExportAllListProps } from "./export-all.types";

/** What a layer will make: its saved rows, or the dialog's default. */
function rowsLabel({ exports }: DesignNode): string {
  if (exports.length === 0) return t("all.default");
  return exports
    .map(({ format, scale }) => {
      const type = format.toUpperCase();
      return hasSize(format) ? `${scale}x ${type}` : type;
    })
    .join(", ");
}

/** The layers Export all will make files of, each with a tick, under their pages' names. */
export function ExportAllList({ groups, named, skipped, onToggle }: ExportAllListProps) {
  const { kinds } = useDesignEngine();
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-md border border-border p-2">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          {named && <h3 className="text-xs font-medium text-muted-foreground">{group.name}</h3>}
          {group.items.map((node) => (
            <div key={node.id} className="flex min-w-0 items-center justify-between gap-3">
              <Checkbox
                checked={!skipped.has(node.id)}
                onCheckedChange={(checked) => onToggle(node.id, checked)}
                label={<span className="truncate text-xs">{layerNameOf(node, kinds)}</span>}
              />
              <span className="shrink-0 text-xs text-subtle-foreground">{rowsLabel(node)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
