import { ColorField } from "@canvas-ui";
import { ArrowDown, ArrowRight, Droplet, Maximize2 } from "lucide-react";

import { CheckboxField } from "@shared/ui/kit";
import { PropertyGrid } from "@design/ui/components/panel";
import { SHADOW_PRESETS } from "../../effect-presets";
import type { DropShadowEffect, InnerShadowEffect } from "../../effect.types";
import { ScrubField } from "../fields";
import { PresetRow } from "./preset-row";
import { EffectBind } from "../effect-bind";
import type { EffectEditorProps } from "../effects.points.types";
import { t } from "../../effects.i18n";

/** A drop or inner shadow: elevation presets, its color, offset, blur and spread. */
export function ShadowEditor<E extends DropShadowEffect | InnerShadowEffect>({
  effect,
  onChange,
}: EffectEditorProps<E>) {
  const set = (patch: Partial<DropShadowEffect>, info?: { done: boolean }) =>
    onChange({ ...effect, ...patch }, info);
  return (
    <div className="flex flex-col gap-2">
      {effect.type === "drop-shadow" && (
        <PresetRow
          label={t("editors.elevation")}
          presets={SHADOW_PRESETS}
          onPick={(i) => set({ ...SHADOW_PRESETS[i]!.look })}
        />
      )}
      <EffectBind field="color">
        <ColorField
          label={t("editors.shadowColor")}
          color={effect.color}
          opacity={effect.opacity}
          onChange={({ color, opacity }, info) => set({ color, opacity }, info)}
        />
      </EffectBind>
      <PropertyGrid>
        <EffectBind field="x">
          <ScrubField
            prefix={<ArrowRight />}
            label={t("editors.xOffset")}
            value={effect.x}
            onChange={(x, info) => set({ x }, info)}
          />
        </EffectBind>
        <EffectBind field="y">
          <ScrubField
            prefix={<ArrowDown />}
            label={t("editors.yOffset")}
            value={effect.y}
            onChange={(y, info) => set({ y }, info)}
          />
        </EffectBind>
        <EffectBind field="blur">
          <ScrubField
            prefix={<Droplet />}
            label={t("editors.blur")}
            min={0}
            value={effect.blur}
            onChange={(blur, info) => set({ blur }, info)}
          />
        </EffectBind>
        <EffectBind field="spread">
          <ScrubField
            prefix={<Maximize2 />}
            label={t("editors.spread")}
            value={effect.spread}
            onChange={(spread, info) => set({ spread }, info)}
          />
        </EffectBind>
      </PropertyGrid>
      {effect.type === "drop-shadow" && (
        <CheckboxField
          label={t("editors.showBehind")}
          checked={effect.showBehind}
          onChange={(showBehind) => set({ showBehind })}
        />
      )}
    </div>
  );
}
