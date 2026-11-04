import { ImageOff } from "lucide-react";

import { useService } from "@canvas-ui";
import { getLocale } from "@shared/core";
import { cn } from "@shared/ui/kit";
import { DESIGN_DATA_SOURCES } from "../../model";
import { MAX_NEW_IMAGES } from "../../update";
import { useDataVersion } from "../hooks/use-data-version";
import type { ImageFailuresLineProps } from "./image-failures-line.types";
import { t } from "../../data.i18n";

/**
 * How many pictures the source's last Update on this device couldn't save in the file, and how
 * many of them were past the limit one Update saves; nothing when all were saved.
 */
export function ImageFailuresLine({ sourceId, className }: ImageFailuresLineProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  useDataVersion(sources);
  const failed = sources.imageFailures(sourceId);
  if (failed.length === 0) return null;
  const overLimit = sources.imagesOverLimit(sourceId);
  const limit = MAX_NEW_IMAGES.toLocaleString(getLocale());
  const text =
    overLimit > 0
      ? t("images.failedOverLimit", { count: failed.length, over: overLimit, limit })
      : t("images.failed", { count: failed.length });
  return (
    <p
      className={cn("flex items-start gap-1 text-xs text-warning", className)}
      title={failed
        .slice(0, 20)
        .map((value) => (value.length > 80 ? `${value.slice(0, 80)}…` : value))
        .join("\n")}
    >
      <ImageOff className="mt-0.5 size-3 shrink-0" />
      <span className="min-w-0">{text}</span>
    </p>
  );
}
