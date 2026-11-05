import { CommitInput } from "@canvas-ui";
import { Checkbox, cn } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import type { ShapeFieldRowProps } from "./shape-field-row.types";

/** One field of the shape step: kept or not, its path as read and its new name. */
export function ShapeFieldRow({ path, name, kept, onKeep, onRename }: ShapeFieldRowProps) {
  return (
    <li className={cn("flex min-w-0 items-center gap-2 py-0.5", !kept && "opacity-55")}>
      <Checkbox
        checked={kept}
        onCheckedChange={onKeep}
        aria-label={t("shape.keep", { field: path })}
      />
      <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={path}>
        {path}
      </code>
      <CommitInput
        aria-label={t("shape.rename", { field: path })}
        placeholder={path}
        value={name}
        onCommit={onRename}
        disabled={!kept}
        className="h-6 w-28 shrink-0 text-xs"
      />
    </li>
  );
}
