import { remapStackBindings, withoutBindingsUnder, type BindableField } from "@canvas";
import { readPaintStyle } from "../../styles/paint-style";
import { solidPaint } from "../../node/solid-paint";
import { PanelAddButton } from "@design/ui/components/panel";
import type { StyleEditorProps } from "../core.points.types";
import { StyleBindingScope } from "./style-binding-scope";
import { StyleEditorFrame } from "./style-editor-frame";
import { useStyleWriter } from "./use-style-writer";
import { PaintStackEditor } from "../sections/paint-stack-editor";
import type { PaintStackEditorProps } from "../sections/paint-stack-editor.types";
import { t } from "../../core.i18n";

/** A new paint in a color style. */
const NEW_PAINT = "#D9D9D9";

/** A paint's color in a color style takes any color variable. */
function paintField(path: string): BindableField | undefined {
  return /^paints\.\d+(\.stops\.\d+)?\.color$/.test(path)
    ? { path, type: "color", scopes: [], label: t("styles.color") }
    : undefined;
}

/**
 * A color style's paints, edited like a layer's fills (their colors can be variables); the
 * layers using it follow every change.
 */
export function PaintStyleEditor({ style, onDelete }: StyleEditorProps) {
  const writer = useStyleWriter(style);
  const paints = readPaintStyle(style.value)?.paints ?? [];
  const onChange: PaintStackEditorProps["onChange"] = (change, info, map) => {
    const bindings =
      map === undefined
        ? undefined
        : map === null
          ? withoutBindingsUnder(style.bindings ?? {}, "paints")
          : remapStackBindings(style.bindings ?? {}, "paints", map);
    writer.write({ paints: change(paints) }, info, bindings);
  };

  return (
    <StyleEditorFrame style={style} onDelete={onDelete}>
      <StyleBindingScope style={style} fieldOf={paintField}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("styles.paints")}</span>
            <PanelAddButton
              label={t("styles.addPaint")}
              onClick={() => onChange((current) => [...current, solidPaint(NEW_PAINT)])}
            />
          </div>
          <PaintStackEditor
            paints={paints}
            mixed={false}
            label={t("styles.paint")}
            allowImage
            onChange={onChange}
            bindPrefix="paints"
          />
        </div>
      </StyleBindingScope>
    </StyleEditorFrame>
  );
}
