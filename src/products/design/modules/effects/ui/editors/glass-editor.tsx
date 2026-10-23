import { Droplet, Rainbow, Sun, SunDim, WavesHorizontal, Layers, Sparkle } from "lucide-react";

import { PropertyGrid } from "@design/ui/components/panel";
import type { EffectEditorProps } from "@design/ui/modules";
import { GLASS_PRESETS } from "../../effect-presets";
import type { GlassEffect } from "../../effect.types";
import { ScrubField } from "../fields";
import { PresetRow } from "./preset-row";

/** Glass: presets, the light (angle, intensity, splay), the lens (refraction, depth, dispersion) and frost. */
export function GlassEditor({ effect, onChange }: EffectEditorProps<GlassEffect>) {
  const set = (patch: Partial<GlassEffect>, info?: { done: boolean }) =>
    onChange({ ...effect, ...patch }, info);
  const share = (
    key: "lightIntensity" | "refraction" | "dispersion" | "splay",
    label: string,
    icon: React.ReactNode,
  ) => (
    <ScrubField
      prefix={icon}
      label={label}
      value={effect[key]}
      factor={100}
      suffix="%"
      min={0}
      max={1}
      step={0.01}
      onChange={(v, info) => set({ [key]: v }, info)}
    />
  );
  return (
    <div className="flex flex-col gap-2">
      <PresetRow
        label="Look"
        presets={GLASS_PRESETS}
        onPick={(i) => set({ ...GLASS_PRESETS[i]!.look })}
      />
      <PropertyGrid>
        <ScrubField
          prefix={<Sun />}
          label="Light angle"
          suffix="°"
          value={effect.lightAngle}
          onChange={(lightAngle, info) =>
            set({ lightAngle: ((lightAngle % 360) + 360) % 360 }, info)
          }
        />
        {share("lightIntensity", "Light intensity", <SunDim />)}
        {share("refraction", "Refraction", <WavesHorizontal />)}
        <ScrubField
          prefix={<Layers />}
          label="Depth"
          min={0}
          value={effect.depth}
          onChange={(depth, info) => set({ depth }, info)}
        />
        {share("dispersion", "Dispersion", <Rainbow />)}
        <ScrubField
          prefix={<Droplet />}
          label="Frost"
          min={0}
          value={effect.frost}
          onChange={(frost, info) => set({ frost }, info)}
        />
        {share("splay", "Splay", <Sparkle />)}
      </PropertyGrid>
    </div>
  );
}
