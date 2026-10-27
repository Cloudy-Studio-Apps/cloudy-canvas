import { Minus } from "lucide-react";

import type { BindableField } from "@canvas";
import { readStrokeStyle } from "../../styles/stroke-style";
import type { StrokeStyleValue } from "../../styles/stroke-style.types";
import { BindSlot, NumberField } from "@design/ui/components/panel";
import type { StyleEditorProps } from "../core.points.types";
import { StyleBindingScope } from "./style-binding-scope";
import { StyleEditorFrame } from "./style-editor-frame";
import { useStyleWriter } from "./use-style-writer";
import { Field, SegmentedControl } from "@shared/ui/kit";
import { ALIGNS, CAPS, JOINS, StrokePreview } from "../sections/stroke";
import { StrokeStyleDashes } from "./stroke-style-dashes";
import { t } from "../../core.i18n";

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
    ? { path, type: "number", scopes: ["stroke-weight"], label: t("fields.strokeWeight") }
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
              label={t("fields.strokeWeight")}
              min={0}
              value={value.strokeWeight}
              onCommit={(strokeWeight) => set({ strokeWeight, strokeWeights: null })}
            />
          </BindSlot>
          <Field label={t("styles.position")}>
            <SegmentedControl
              label={t("stroke.position")}
              value={value.strokeAlign}
              onChange={(strokeAlign) => set({ strokeAlign })}
              options={ALIGNS}
              size="sm"
              fullWidth
            />
          </Field>
          <StrokeStyleDashes value={value} onChange={set} />
          <Field label={t("stroke.endsAndCorners")}>
            <div className="flex gap-1">
              <SegmentedControl
                label={t("stroke.cap")}
                value={value.strokeCap}
                onChange={(cap) => set({ strokeCap: cap as StrokeStyleValue["strokeCap"] })}
                options={CAPS}
                iconOnly
                size="sm"
              />
              <SegmentedControl
                label={t("stroke.join")}
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
              label={t("stroke.miter")}
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
