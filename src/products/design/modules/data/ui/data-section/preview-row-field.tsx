import { useScrubUndo } from "@canvas-ui";
import { NumberInput } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { repeatRows, scopeAt } from "../../repeat";
import { useSetRepeat } from "../repeat-section/use-set-repeat";
import { templateIterator } from "./template-iterator";
import type { PreviewRowFieldProps } from "./preview-row-field.types";
import { t } from "../../data.i18n";

/**
 * For a template, or a layer inside one: which row the template itself shows (1 to the rows
 * shown while designing), its iterator's `previewRow`.
 */
export function PreviewRowField({ nodeId }: PreviewRowFieldProps) {
  const engine = useDesignEngine();
  const found = templateIterator(engine.doc, nodeId);
  const apply = useSetRepeat(found?.frameId ?? "");
  const scrubUndo = useScrubUndo();
  if (!found) return null;
  const count = repeatRows(found.repeat, scopeAt(engine.doc, found.frameId), "design").rows.length;
  if (count === 0) return null;
  const preview = found.repeat.previewRow ?? 0;
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">
        {t("repeat.preview.label")}
      </span>
      <NumberInput
        label={t("repeat.preview.label")}
        value={(preview < count ? preview : 0) + 1}
        suffix={t("repeat.preview.of", { count })}
        min={1}
        max={count}
        decimals={0}
        onChange={(row) => apply({ previewRow: row - 1 })}
        className="min-w-0 flex-1"
        {...scrubUndo}
      />
    </div>
  );
}
