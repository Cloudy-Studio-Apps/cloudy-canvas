import { ImageOff } from "lucide-react";

import { useService } from "@canvas-ui";
import { getLocale } from "@shared/core";
import { cn } from "@shared/ui/kit";
import { DESIGN_DATA_SOURCES } from "../../model";
import { MAX_NEW_IMAGES } from "../../update";
import { useDataVersion } from "../hooks/use-data-version";
import { failureReasons } from "./image-failure-reasons";
import type { ImageFailuresLineProps } from "./image-failures-line.types";
import { t } from "../../data.i18n";

/**
 * How many pictures the source's last Update on this device couldn't save in the file, how many
 * of them were past the limit one Update saves, and why the others weren't (too large, not a
 * picture, unreadable); the first values in its tooltip; nothing when all were saved.
 */
export function ImageFailuresLine({ sourceId, className }: ImageFailuresLineProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  useDataVersion(sources);
  const failed = sources.imageFailureDetails(sourceId);
  if (failed.length === 0) return null;
  const reasons = failureReasons(failed);
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
        .map(({ value }) => (value.length > 80 ? `${value.slice(0, 80)}…` : value))
        .join("\n")}
    >
      <ImageOff className="mt-0.5 size-3 shrink-0" />
      <span className="flex min-w-0 flex-col">
        <span>{text}</span>
        {reasons && <span className="text-muted-foreground">{reasons}</span>}
      </span>
    </p>
  );
}
