import { useState } from "react";
import { X } from "lucide-react";

import { openAbout } from "@shared/about";
import { useHomeStore } from "@shared/stores/home-store";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { SealsVideo } from "@shared/ui/brand/seals-video";
import { IconButton } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import { t } from "../home.i18n";

/**
 * The seals, still until hovered (or focused), under the create tiles. A click opens About, where
 * they hop again; the × hides them for good (`useHomeStore`), with a line to bring them back.
 */
export function SealCard() {
  const hidden = useHomeStore((s) => s.sealsHidden);
  const setHidden = useHomeStore((s) => s.setSealsHidden);
  const [active, setActive] = useState(false);

  if (hidden) {
    return (
      <p className="flex justify-center gap-1.5 text-xs text-muted-foreground">
        {t("seals.hidden")}
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: an inline text link */}
        <button
          type="button"
          className="cursor-pointer underline underline-offset-2 hover:text-foreground"
          onClick={() => setHidden(false)}
        >
          {t("seals.restore")}
        </button>
      </p>
    );
  }

  return (
    <div
      className="group relative min-h-32 flex-1 overflow-hidden rounded-card border bg-surface-sunken"
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
    >
      <SealsVideo playing={active} preload="metadata" className="absolute inset-0" />
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the whole video is the button */}
      <button
        type="button"
        aria-label={t("seals.label")}
        onClick={openAbout}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        className="absolute inset-0 cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-inset"
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-surface/85 px-2 py-1 text-xs font-medium shadow-soft backdrop-blur-sm",
          "transition-opacity duration-200",
          active && "opacity-0",
        )}
      >
        <SealLogo size={16} variant="mark" />
        {t("seals.caption")}
      </span>
      <IconButton
        label={t("seals.hide")}
        size="xs"
        onClick={() => setHidden(true)}
        className="absolute top-1.5 right-1.5 bg-surface/80 opacity-0 backdrop-blur-sm group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X />
      </IconButton>
    </div>
  );
}
