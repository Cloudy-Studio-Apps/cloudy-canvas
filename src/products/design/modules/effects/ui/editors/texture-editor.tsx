import { Grid3x3, Move } from "lucide-react";

import { PropertyGrid } from "@design/ui/components/panel";
import type { EffectEditorProps } from "@design/ui/modules";
import type { TextureEffect } from "../../effect.types";
import { EffectToggle, ScrubField } from "../fields";

/** Texture: how big its grain is, how far it pushes the edges, and whether it stays inside. */
export function TextureEditor({ effect, onChange }: EffectEditorProps<TextureEffect>) {
  const set = (patch: Partial<TextureEffect>, info?: { done: boolean }) =>
    onChange({ ...effect, ...patch }, info);
  return (
    <div className="flex flex-col gap-2">
      <PropertyGrid>
        <ScrubField
          prefix={<Grid3x3 />}
          label="Grain size"
          min={0.1}
          step={0.1}
          value={effect.size}
          onChange={(size, info) => set({ size }, info)}
        />
        <ScrubField
          prefix={<Move />}
          label="Roughness"
          min={0}
          step={0.1}
          value={effect.radius}
          onChange={(radius, info) => set({ radius }, info)}
        />
      </PropertyGrid>
      <EffectToggle
        label="Clip to shape"
        checked={effect.clipToShape}
        onChange={(clipToShape) => set({ clipToShape })}
      />
    </div>
  );
}
