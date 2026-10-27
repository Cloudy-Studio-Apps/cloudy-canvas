import { Grid3x3, Move } from "lucide-react";

import { CheckboxField } from "@shared/ui/kit";
import { PropertyGrid } from "@design/ui/components/panel";
import type { TextureEffect } from "../../effect.types";
import { ScrubField } from "../fields";
import type { EffectEditorProps } from "../effects.points.types";
import { t } from "../../effects.i18n";

/** Texture: how big its grain is, how far it pushes the edges, and whether it stays inside. */
export function TextureEditor({ effect, onChange }: EffectEditorProps<TextureEffect>) {
  const set = (patch: Partial<TextureEffect>, info?: { done: boolean }) =>
    onChange({ ...effect, ...patch }, info);
  return (
    <div className="flex flex-col gap-2">
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
          prefix={<Move />}
          label={t("editors.roughness")}
          min={0}
          step={0.1}
          value={effect.radius}
          onChange={(radius, info) => set({ radius }, info)}
        />
      </PropertyGrid>
      <CheckboxField
        label={t("editors.clipToShape")}
        checked={effect.clipToShape}
        onChange={(clipToShape) => set({ clipToShape })}
      />
    </div>
  );
}
