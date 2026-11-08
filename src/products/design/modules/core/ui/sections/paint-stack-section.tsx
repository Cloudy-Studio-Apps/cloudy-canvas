import { useRef } from "react";

import type { ColorChangeInfo } from "@canvas-ui";
import type { Paint } from "../../node/paint.types";
import { PanelAddButton, PanelSection } from "@design/ui/components/panel";
import { PaintStackEditor } from "./paint-stack-editor";
import type { PaintStackMap } from "./paint-stack-editor.types";
import type { PaintStackSectionProps } from "./paint-stack-section.types";
import { t } from "../../core.i18n";

/**
 * A section editing paint stacks (`PaintStackEditor`) of one or more targets: layers' fills or
 * strokes, or a vector's areas. When the stacks differ, "+" replaces them all with one. A color
 * drag is one undo step.
 */
export function PaintStackSection({
  title,
  stacks,
  onChange,
  newPaint,
  allowImage,
  actions,
  hideAdd,
  replacement,
  note,
  bindPrefix,
  handlesField,
  size,
  children,
}: PaintStackSectionProps) {
  const first = stacks[0] ?? [];
  const mixed = stacks.some((stack) => JSON.stringify(stack) !== JSON.stringify(first));
  const label = title.replace(/s$/, "");
  /** Whether a drag in the picker is going on: its steps join the undo step of its first one. */
  const dragging = useRef(false);

  const setPaints = (
    paints: (current: readonly Paint[]) => Paint[],
    info: ColorChangeInfo = { done: true },
    map?: PaintStackMap,
  ) => {
    const checkpoint = !dragging.current;
    dragging.current = !info.done;
    onChange(paints, checkpoint, map);
  };

  return (
    <PanelSection
      title={title}
      actions={
        <>
          {actions}
          {!hideAdd && (
            <PanelAddButton
              label={t("paints.add", { name: label.toLowerCase() })}
              onClick={() =>
                setPaints(
                  (current) => (mixed ? [newPaint()] : [...current, newPaint()]),
                  undefined,
                  mixed ? null : undefined,
                )
              }
            />
          )}
        </>
      }
    >
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      {replacement !== undefined ? (
        <div className="flex flex-col gap-1.5">
          {replacement}
          {children}
        </div>
      ) : (
        <PaintStackEditor
          paints={first}
          mixed={mixed}
          label={label}
          allowImage={allowImage}
          onChange={setPaints}
          bindPrefix={bindPrefix}
          handlesField={handlesField}
          size={size}
        >
          {children}
        </PaintStackEditor>
      )}
    </PanelSection>
  );
}
