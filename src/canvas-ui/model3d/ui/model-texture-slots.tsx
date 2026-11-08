import { t } from "../model3d.i18n";
import { ModelTextureRow } from "./model-texture-row";
import type { ModelTextureSlotsProps } from "./model-panel.types";

/** The model's materials, each with the picture assigned to it. */
export function ModelTextureSlots({ textures, disabled, onChange }: ModelTextureSlotsProps) {
  if (textures.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("panel.texture.empty")}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {textures.map((slot) => (
        <ModelTextureRow
          key={slot.name}
          slot={slot}
          disabled={disabled}
          onChoose={(assetId) =>
            onChange(
              textures.map((s) => (s.name === slot.name ? { ...s, assetId, embedded: false } : s)),
            )
          }
        />
      ))}
    </ul>
  );
}
