import { Droplet, MoveRight } from "lucide-react";

import { PropertyGrid } from "@design/ui/components/panel";
import type { LayerBlurEffect } from "../../effect.types";
import { EffectChoice, ScrubField } from "../fields";
import { EffectBind } from "../effect-bind";
import type { EffectEditorProps } from "../effects.points.types";
import { t } from "../../effects.i18n";

const KINDS = [
  { value: "uniform", label: t("editors.uniform") },
  { value: "progressive", label: t("editors.progressive") },
] as const;

/**
 * A layer blur: even, or progressive from a start point (its own blur) to an end point (the full
 * blur), both placed in the layer's box (drag them on the canvas, or type them in %).
 */
export function LayerBlurEditor({ effect, onChange }: EffectEditorProps<LayerBlurEffect>) {
  const set = (patch: Partial<LayerBlurEffect>, info?: { done: boolean }) =>
    onChange({ ...effect, ...patch }, info);
  const point = (which: "start" | "end", axis: "x" | "y") => (
    <ScrubField
      prefix={`${which === "start" ? "S" : "E"}${axis.toUpperCase()}`}
      label={t(which === "start" ? "editors.start" : "editors.end", { axis })}
      value={effect[which][axis]}
      factor={100}
      suffix="%"
      min={0}
      max={1}
      step={0.01}
      onChange={(v, info) => set({ [which]: { ...effect[which], [axis]: v } }, info)}
    />
  );
  return (
    <div className="flex flex-col gap-2">
      <EffectChoice
        label={t("editors.blurKind")}
        value={effect.progressive ? "progressive" : "uniform"}
        options={KINDS}
        onChange={(kind) => set({ progressive: kind === "progressive" })}
      />
      <PropertyGrid>
        <EffectBind field="radius">
          <ScrubField
            prefix={<Droplet />}
            label={t("editors.blur")}
            min={0}
            value={effect.radius}
            onChange={(radius, info) => set({ radius }, info)}
          />
        </EffectBind>
        {effect.progressive && (
          <ScrubField
            prefix={<MoveRight />}
            label={t("editors.blurStart")}
            min={0}
            value={effect.startRadius}
            onChange={(startRadius, info) => set({ startRadius }, info)}
          />
        )}
        {effect.progressive && (
          <>
            {point("start", "x")}
            {point("start", "y")}
            {point("end", "x")}
            {point("end", "y")}
          </>
        )}
      </PropertyGrid>
    </div>
  );
}
