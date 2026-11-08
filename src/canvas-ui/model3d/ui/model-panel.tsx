import { RotateCcw } from "lucide-react";

import { ZOOM_RANGE } from "@canvas";
import { Button, Field, NumberInput, Section } from "@shared/ui/kit";
import { t } from "../model3d.i18n";
import { ModelRotationFields } from "./model-rotation-fields";
import { ModelTextureSlots } from "./model-texture-slots";
import type { ModelPanelProps } from "./model-panel.types";
import { useModelPanel } from "./use-model-panel";

/** The size in megabytes with one decimal. */
function megabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/**
 * The properties of a 3D model, the same in both products: its file, rotation, zoom, textures,
 * "Edit in 3D" and "Convert to PNG". A change starts the live edit and goes to its draft.
 */
export function ModelPanel({ engine, id, data, onConvert }: ModelPanelProps) {
  const panel = useModelPanel(engine, id, data);
  const off = !panel.editable;
  return (
    <div className="flex flex-col">
      <Section title={t("panel.model")}>
        <p className="truncate text-xs text-foreground" title={data.fileName}>
          {data.fileName}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("panel.size", { size: megabytes(data.fileSize) })}
        </p>
        {panel.reason && <p className="mt-1.5 text-xs text-muted-foreground">{panel.reason}</p>}
      </Section>
      <Section title={t("panel.rotation")}>
        <ModelRotationFields
          angle={panel.angle}
          disabled={off}
          onChange={(angle) => panel.change({ angle })}
        />
      </Section>
      <Section title={t("panel.view")}>
        <div className="flex items-end gap-2">
          <Field label={t("panel.zoom")} className="flex-1">
            <NumberInput
              label={t("panel.zoom")}
              suffix="%"
              value={panel.zoom}
              factor={100}
              decimals={0}
              min={ZOOM_RANGE.min * 100}
              max={ZOOM_RANGE.max * 100}
              step={5}
              disabled={off}
              onChange={(zoom) => panel.change({ zoom })}
            />
          </Field>
          <Button variant="outline" size="sm" disabled={off} onClick={panel.reset}>
            <RotateCcw />
            {t("panel.reset")}
          </Button>
        </div>
      </Section>
      <Section title={t("panel.textures")}>
        <ModelTextureSlots
          textures={panel.textures}
          disabled={off}
          onChange={(textures) => panel.change({ textures })}
        />
      </Section>
      <Section title={t("panel.actions")} className="border-b-0">
        <div className="flex flex-col gap-1.5">
          <Button variant="outline" size="sm" disabled={off || panel.live} onClick={panel.edit}>
            {t("panel.edit")}
          </Button>
          <Button variant="outline" size="sm" disabled={engine.doc.isReadOnly} onClick={onConvert}>
            {t("panel.convert")}
          </Button>
        </div>
      </Section>
    </div>
  );
}
