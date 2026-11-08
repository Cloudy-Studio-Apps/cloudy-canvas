import { Box } from "lucide-react";

import { cn } from "@shared/ui/kit";
import { ImageChooseButton } from "../../images";
import { newModelAssetId } from "@canvas";
import { t } from "../model3d.i18n";
import { useAssetUrl } from "../../use-asset-url";
import type { ModelTextureRowProps } from "./model-panel.types";

/** One material: its texture's thumbnail, name, state and a button to choose another picture. */
export function ModelTextureRow({ slot, disabled, onChoose }: ModelTextureRowProps) {
  const url = useAssetUrl(slot.assetId);
  const missing = slot.file !== null && slot.assetId === null && !slot.embedded;
  const status = missing
    ? t("panel.texture.missing")
    : slot.assetId !== null
      ? null
      : slot.embedded
        ? t("panel.texture.embedded")
        : t("panel.texture.none");
  return (
    <li className="flex items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {url ? (
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <Box className="size-3.5 text-muted-foreground" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs text-foreground" title={slot.name}>
          {slot.name}
        </span>
        {status && (
          <span className={cn("text-xs", missing ? "text-destructive" : "text-muted-foreground")}>
            {status}
          </span>
        )}
      </span>
      <ImageChooseButton
        variant="outline"
        size="xs"
        replace={slot.assetId !== null}
        id={newModelAssetId}
        title={t("panel.texture.choose", { name: slot.name })}
        disabled={disabled}
        onChoose={onChoose}
      />
    </li>
  );
}
