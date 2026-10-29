import { useEffect } from "react";
import { X } from "lucide-react";

import { PaintingSeal } from "@shared/ui/brand/painting-seal";
import { Button, IconButton } from "@shared/ui/kit";
import { t } from "../../viewer.i18n";
import type { MadeWithCardProps } from "./made-with-card.types";

/** Where "Get Cloudy Canvas" leads: the latest release, with the installers. */
const DOWNLOAD_URL = "https://github.com/Cloudy-Studio-Apps/cloudy-canvas/releases/latest";
const AUTHOR_URL = "https://darkredgm.com/";

/**
 * The card under the brand bar saying the board was made with Cloudy Canvas, with where to get
 * it. Shown when the file opens; the logo toggles it, and ✕ or Esc closes it. It doesn't block
 * the board.
 */
export function MadeWithCard({ onClose }: MadeWithCardProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={t("madeWith.title")}
      className="pointer-events-auto absolute top-16 left-3 w-80 max-w-[calc(100vw-1.5rem)] rounded-lg border bg-surface p-4 shadow-lg"
    >
      <div className="absolute top-2 right-2">
        <IconButton label={t("panel.close")} size="sm" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <PaintingSeal width={120} className="mb-3" />
      <p className="text-sm font-semibold">{t("madeWith.title")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("madeWith.text")}</p>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" asChild>
          <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
            {t("madeWith.get")}
          </a>
        </Button>
        <a
          href={AUTHOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {t("madeWith.author")}
        </a>
      </div>
    </div>
  );
}
