import { Droplet, MoveRight } from "lucide-react";

import { PropertyGrid } from "@design/ui/components/panel";
import type { EffectEditorProps } from "@design/ui/modules";
import type { LayerBlurEffect } from "../../effect.types";
import { EffectChoice, ScrubField } from "../fields";

const KINDS = [
  { value: "uniform", label: "Uniform" },
  { value: "progressive", label: "Progressive" },
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
      label={`${which === "start" ? "Start" : "End"} ${axis}`}
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
        label="Blur kind"
        value={effect.progressive ? "progressive" : "uniform"}
        options={KINDS}
        onChange={(kind) => set({ progressive: kind === "progressive" })}
      />
      <PropertyGrid>
        <ScrubField
          prefix={<Droplet />}
          label="Blur"
          min={0}
          value={effect.radius}
          onChange={(radius, info) => set({ radius }, info)}
        />
        {effect.progressive && (
          <ScrubField
            prefix={<MoveRight />}
            label="Blur at the start"
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
