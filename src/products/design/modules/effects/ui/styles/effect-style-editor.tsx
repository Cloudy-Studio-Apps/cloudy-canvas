import { remapStackBindings, withoutBindingsUnder, type BindableField } from "@canvas";
import { useEditorModules } from "@canvas-ui";
import { readEffectStyle } from "../../../core";
import {
  StyleBindingScope,
  StyleEditorFrame,
  useStyleWriter,
  type StyleEditorProps,
} from "../../../core/ui";
import { AddEffectMenu } from "../add-effect-menu";
import { EffectStackEditor } from "../effect-stack-editor";
import type { EffectStackEditorProps } from "../effects-ui.types";
import { designEffectTypes } from "../effects.points";

const NO_LAYERS: never[] = [];
const NUMBERS = new Set(["x", "y", "blur", "spread", "radius"]);

/** An effect's color takes a color variable, its offsets, blur and spread number ones. */
function effectField(path: string): BindableField | undefined {
  const match = /^effects\.\d+\.(\w+)$/.exec(path);
  const key = match?.[1];
  if (key === "color") return { path, type: "color", scopes: ["effect-color"], label: "Color" };
  if (key && NUMBERS.has(key)) {
    return { path, type: "number", scopes: ["effect-value"], label: key };
  }
  return undefined;
}

/**
 * An effect style's effects, edited like a layer's (their colors and numbers can be variables,
 * resolved in each layer's modes); the layers using it follow every change.
 */
export function EffectStyleEditor({ style, onDelete }: StyleEditorProps) {
  const { host } = useEditorModules();
  const types = [...host.get(designEffectTypes)].sort((a, b) => a.order - b.order);
  const writer = useStyleWriter(style);
  const effects = readEffectStyle(style.value)?.effects ?? [];
  const onChange: EffectStackEditorProps["onChange"] = (change, info, map) => {
    const bindings =
      map === undefined
        ? undefined
        : map === null
          ? withoutBindingsUnder(style.bindings ?? {}, "effects")
          : remapStackBindings(style.bindings ?? {}, "effects", map);
    writer.write({ effects: change(effects) }, info, bindings);
  };

  return (
    <StyleEditorFrame style={style} onDelete={onDelete}>
      <StyleBindingScope style={style} fieldOf={effectField}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Effects</span>
            <AddEffectMenu
              types={types}
              onAdd={(entry) => onChange((current) => [...current, entry.create()])}
            />
          </div>
          <EffectStackEditor
            effects={effects}
            mixed={false}
            onChange={onChange}
            nodes={NO_LAYERS}
          />
        </div>
      </StyleBindingScope>
    </StyleEditorFrame>
  );
}
