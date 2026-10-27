import { Fragment } from "react";

import { ImageQualityNote } from "@canvas-ui";
import { isPlaceholderPaint } from "../../node/placeholder-paint";
import { removedAt } from "../../node/stack-bindings";
import { PaintField } from "@design/ui/components/panel";
import type { PaintStackEditorProps } from "./paint-stack-editor.types";
import { t } from "../../core.i18n";

/**
 * A paint stack, topmost first like the layers, each picture with a note on how sharp the canvas
 * shows it: the Fills and Strokes sections' list and a color style's editor.
 */
export function PaintStackEditor({
  paints,
  mixed,
  label,
  allowImage,
  onChange,
  bindPrefix,
  handlesField,
  size,
  children,
}: PaintStackEditorProps) {
  if (mixed) {
    return <p className="text-xs text-muted-foreground">{t("paints.mixedHint")}</p>;
  }
  if (paints.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {[...paints.entries()].reverse().map(([i, paint]) => (
        <Fragment key={i}>
          <PaintField
            paint={paint}
            label={label}
            allowImage={allowImage}
            target={handlesField ? { field: handlesField, index: i } : undefined}
            bindPath={`${bindPrefix}.${i}.color`}
            size={size}
            onChange={(next, info) =>
              onChange((current) => current.map((p, j) => (j === i ? next : p)), info)
            }
            onRemove={() =>
              onChange((current) => current.filter((_, j) => j !== i), undefined, removedAt(i))
            }
          />
          {paint.type === "image" && !isPlaceholderPaint(paint) && (
            <ImageQualityNote assetId={paint.assetId} className="px-1" />
          )}
        </Fragment>
      ))}
      {children}
    </div>
  );
}
