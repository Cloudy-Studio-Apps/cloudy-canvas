import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { cn } from "@shared/ui/lib/utils";
import { useImageQuality } from "../../use-image-quality";
import { imageQualityText } from "./image-quality-text";
import type { ImageQualityNoteProps } from "./image-quality-note.types";

/**
 * A small note on how sharp the canvas shows a picture: the copy it draws from against the
 * original's size, and how large it shows now, with a tooltip saying why (the canvas stays fast;
 * exports and Catalog mode use the original).
 */
export function ImageQualityNote({ assetId, className }: ImageQualityNoteProps) {
  const quality = useImageQuality(assetId);
  const text = quality && imageQualityText(quality);
  if (!text) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p
          tabIndex={0}
          className={cn(
            "flex cursor-default items-start gap-1.5 rounded-sm text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          <span className="flex min-w-0 flex-col tabular-nums">
            <span>{text.label}</span>
            {text.detail && <span className="opacity-80">{text.detail}</span>}
          </span>
        </p>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-64">
        {text.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
