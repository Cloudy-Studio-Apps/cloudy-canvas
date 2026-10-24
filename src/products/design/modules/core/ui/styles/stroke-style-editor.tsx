import { Minus } from "lucide-react";

import type { BindableField } from "@canvas";
import { readStrokeStyle, type StrokeStyleValue } from "@design";
import { BindSlot, NumberField } from "@design/ui/components/panel";
import { StyleBindingScope, StyleEditorFrame, useStyleWriter } from "@design/ui/components/styles";
import type { StyleEditorProps } from "@design/ui/modules";
import { Field, SegmentedControl } from "@shared/ui/kit";
import { ALIGNS, CAPS, JOINS, StrokePreview } from "../sections/stroke";
import { StrokeStyleDashes } from "./stroke-style-dashes";

/** What a stroke style starts from when its stored value lacks a field. */
const BASE: StrokeStyleValue = {
  strokeWeight: 1,
  strokeWeights: null,
  strokeAlign: "inside",
  strokeCap: "none",
  strokeJoin: "miter",
  strokeMiterAngle: 28.96,
  strokeDashes: [],
};

const NO_LAYERS: never[] = [];

/** A stroke style's weight takes a number variable. */
function strokeField(path: string): BindableField | undefined {
  return path === "strokeWeight"
    ? { path, type: "number", scopes: ["stroke-weight"], label: "Stroke weight" }
    : undefined;
}

/**
 * A stroke style's settings (weight, position, dashes, ends, corners) with a live preview; the
 * layers using it follow every change.
 */
export function StrokeStyleEditor({ style, onDelete }: StyleEditorProps) {
  const writer = useStyleWriter(style);
  const value: StrokeStyleValue = { ...BASE, ...readStrokeStyle(style.value) };
  const set = (patch: Partial<StrokeStyleValue>) => writer.write({ ...value, ...patch });

  return (
    <StyleEditorFrame style={style} onDelete={onDelete}>
      <StyleBindingScope style={style} fieldOf={strokeField}>
        <div className="flex flex-col gap-2.5">
          <StrokePreview node={value} />
          <BindSlot nodes={NO_LAYERS} path="strokeWeight">
            <NumberField
              prefix={<Minus />}
              label="Stroke weight"
              min={0}
              value={value.strokeWeight}
              onCommit={(strokeWeight) => set({ strokeWeight, strokeWeights: null })}
            />
          </BindSlot>
          <Field label="Position">
            <SegmentedControl
              label="Stroke position"
              value={value.strokeAlign}
              onChange={(strokeAlign) => set({ strokeAlign })}
              options={ALIGNS}
              size="sm"
              fullWidth
            />
          </Field>
          <StrokeStyleDashes value={value} onChange={set} />
          <Field label="Ends and corners">
            <div className="flex gap-1">
              <SegmentedControl
                label="Stroke cap"
                value={value.strokeCap}
                onChange={(cap) => set({ strokeCap: cap as StrokeStyleValue["strokeCap"] })}
                options={CAPS}
                iconOnly
                size="sm"
              />
              <SegmentedControl
                label="Stroke join"
                value={value.strokeJoin}
                onChange={(join) => set({ strokeJoin: join as StrokeStyleValue["strokeJoin"] })}
                options={JOINS}
                iconOnly
                size="sm"
              />
            </div>
          </Field>
          {value.strokeJoin === "miter" && (
            <NumberField
              prefix="∠"
              label="Miter angle: sharper corners are beveled"
              suffix="°"
              min={1}
              max={180}
              value={value.strokeMiterAngle}
              onCommit={(strokeMiterAngle) => set({ strokeMiterAngle })}
            />
          )}
        </div>
      </StyleBindingScope>
    </StyleEditorFrame>
  );
}
