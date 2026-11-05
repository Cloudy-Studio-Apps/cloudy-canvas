import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

import { useService } from "@canvas-ui";
import { Button } from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { DESIGN_DATA_SOURCES } from "../../model";
import { fieldPaths, isIncluded, shapedPath, type DataShape } from "../../table";
import { t } from "../../data.i18n";
import { translatedError } from "./error-text";
import { ShapeFieldRow } from "./shape-field-row";
import { withIncluded, withRenamed } from "./shape-edits";
import type { ShapeStepProps } from "./shape-step.types";

/**
 * The optional step between finding the rows and their fields: "Add a step to shape the data"
 * while there is none (and an Update found data); then each field as read, kept or not, with a
 * new name, and Remove step. Each change is one `setShape` (no fetch); where the rows are stays
 * the Rows come from setting.
 */
export function ShapeStep({ source }: ShapeStepProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const assetId = source.snapshot?.assetId;
  // The fields as read, once per snapshot.
  const paths = useMemo(
    () => (assetId ? fieldPaths(sources.rawRows(source.id)) : []),
    [sources, source.id, assetId],
  );
  const shape = source.shape;

  const apply = (next: DataShape | null) => {
    sources.setShape(source.id, next).catch((error: unknown) => {
      notifyError(t("shape.failed"), translatedError(error));
    });
  };

  if (!shape) {
    if (paths.length === 0) return null;
    return (
      <div className="flex flex-col items-start gap-1">
        <Button size="xs" variant="outline" onClick={() => apply({ rename: {} })}>
          <Plus />
          {t("shape.add")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("shape.addHint")}</p>
      </div>
    );
  }

  const kept = paths.filter((path) => isIncluded(shapedPath(path, shape), shape)).length;
  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{t("shape.title")}</span>
        <Button size="xs" variant="ghost" onClick={() => apply(null)}>
          <Trash2 />
          {t("shape.remove")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t("shape.rowsNote")}</p>
      <p className="text-xs text-muted-foreground">
        {t("shape.kept", { count: kept, total: paths.length })}
      </p>
      <ul className="flex flex-col">
        {paths.map((path) => (
          <ShapeFieldRow
            key={path}
            path={path}
            name={shape.rename[path] ?? ""}
            kept={isIncluded(shapedPath(path, shape), shape)}
            onKeep={(keep) => apply(withIncluded(shape, paths, path, keep))}
            onRename={(name) => {
              if (name.trim() === (shape.rename[path] ?? "")) return;
              apply(withRenamed(shape, path, name));
            }}
          />
        ))}
      </ul>
    </div>
  );
}
