import { useDesignEngine } from "@design/ui/design-engine-context";
import { repeatRows, scopeAt } from "../../repeat";
import { useSetRepeat } from "../repeat-section/use-set-repeat";
import { PreviewRowInput } from "./preview-row-input";
import { templateIterator } from "./template-iterator";
import type { PreviewRowFieldProps } from "./preview-row-field.types";

/**
 * For a template, or a layer inside one: which row the template itself shows (1 to the rows
 * shown while designing), its iterator's `previewRow`.
 */
export function PreviewRowField({ nodeId }: PreviewRowFieldProps) {
  const engine = useDesignEngine();
  const found = templateIterator(engine.doc, nodeId);
  const apply = useSetRepeat(found?.frameId ?? "");
  if (!found) return null;
  const count = repeatRows(found.repeat, scopeAt(engine.doc, found.frameId), "design").rows.length;
  if (count === 0) return null;
  return (
    <PreviewRowInput
      count={count}
      value={found.repeat.previewRow ?? 0}
      onChange={(row) => apply({ previewRow: row })}
    />
  );
}
