import { ColorField } from "@canvas-ui";
import { Grid3x3, Sparkles } from "lucide-react";

import { PropertyGrid } from "@design/ui/components/panel";
import type { NoiseEffect } from "../../effect.types";
import { EffectChoice, ScrubField } from "../fields";
import type { EffectEditorProps } from "../effects.points.types";
import { t } from "../../effects.i18n";

const MODES = [
  { value: "mono", label: t("editors.mono") },
  { value: "duo", label: t("editors.duo") },
  { value: "multi", label: t("editors.multi") },
] as const;

/** Noise: one color, two or many; grain size, how much of the layer it covers, its opacity. */
export function NoiseEditor({ effect, onChange }: EffectEditorProps<NoiseEffect>) {
  const set = (patch: Partial<NoiseEffect>, info?: { done: boolean }) =>
    onChange({ ...effect, ...patch }, info);
  return (
    <div className="flex flex-col gap-2">
      <EffectChoice
        label={t("editors.noiseColors")}
        value={effect.noiseType}
        options={MODES}
        onChange={(noiseType) => set({ noiseType })}
      />
      {effect.noiseType !== "multi" && (
        <ColorField
          label={t("editors.noiseColor")}
          color={effect.color}
          opacity={effect.opacity}
          onChange={({ color, opacity }, info) => set({ color, opacity }, info)}
        />
      )}
      {effect.noiseType === "duo" && (
        <ColorField
          label={t("editors.secondNoiseColor")}
          color={effect.secondColor}
          onChange={(next, info) => set({ secondColor: next.color }, info)}
        />
      )}
      <PropertyGrid>
        <ScrubField
          prefix={<Grid3x3 />}
          label={t("editors.grainSize")}
          min={0.1}
          step={0.1}
          value={effect.size}
          onChange={(size, info) => set({ size }, info)}
        />
        <ScrubField
          prefix={<Sparkles />}
          label={t("editors.density")}
          value={effect.density}
          factor={100}
          suffix="%"
          min={0}
          max={1}
          step={0.01}
          onChange={(density, info) => set({ density }, info)}
        />
        {effect.noiseType === "multi" && (
          <ScrubField
            prefix="α"
            label={t("editors.opacity")}
            value={effect.opacity}
            factor={100}
            suffix="%"
            min={0}
            max={1}
            step={0.01}
            onChange={(opacity, info) => set({ opacity }, info)}
          />
        )}
      </PropertyGrid>
    </div>
  );
}
