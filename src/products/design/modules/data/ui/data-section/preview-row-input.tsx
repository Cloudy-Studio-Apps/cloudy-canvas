import { ChevronLeft, ChevronRight } from "lucide-react";

import { useScrubUndo } from "@canvas-ui";
import { IconButton, NumberInput } from "@shared/ui/kit";
import type { PreviewRowInputProps } from "./preview-row-input.types";
import { t } from "../../data.i18n";

/**
 * Which row a template shows, ◀ n of N ▶: for a card repeater's template and a brochure's
 * repeating section or page alike.
 */
export function PreviewRowInput({ count, value, onChange }: PreviewRowInputProps) {
  const scrubUndo = useScrubUndo();
  const row = value >= 0 && value < count ? value : 0;
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">
        {t("repeat.preview.label")}
      </span>
      <IconButton
        size="xs"
        label={t("repeat.preview.previous")}
        disabled={row === 0}
        onClick={() => onChange(row - 1)}
      >
        <ChevronLeft />
      </IconButton>
      <NumberInput
        label={t("repeat.preview.label")}
        value={row + 1}
        suffix={t("repeat.preview.of", { count })}
        min={1}
        max={count}
        decimals={0}
        onChange={(next) => onChange(next - 1)}
        className="min-w-0 flex-1"
        {...scrubUndo}
      />
      <IconButton
        size="xs"
        label={t("repeat.preview.next")}
        disabled={row >= count - 1}
        onClick={() => onChange(row + 1)}
      >
        <ChevronRight />
      </IconButton>
    </div>
  );
}
