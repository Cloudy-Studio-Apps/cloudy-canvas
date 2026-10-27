import { Heart } from "lucide-react";

import { SealLogo } from "@shared/ui/brand/seal-logo";
import { t } from "../settings.i18n";

/** Cloudy Studio's dedication. Edit the words here. */
export function DedicationCard() {
  return (
    <section
      aria-labelledby="dedication-heading"
      className="relative overflow-hidden rounded-card border bg-surface bg-linear-to-br from-accent-soft to-transparent to-70% p-6 shadow-soft"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <SealLogo size={64} className="shrink-0" />
        <div className="space-y-3">
          <h2
            id="dedication-heading"
            className="flex items-center gap-2 text-base font-semibold tracking-tight"
          >
            {t("dedication.title")}
            <Heart aria-hidden="true" className="size-4 fill-accent text-accent" />
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {t("dedication.body")}
          </p>
          <p className="text-sm font-medium">— DarkRedgm</p>
        </div>
      </div>
    </section>
  );
}
