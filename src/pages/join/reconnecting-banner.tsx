import { LoaderCircle } from "lucide-react";

import type { ReconnectingBannerProps } from "./join-page.types";
import { t } from "./join.i18n";

/** Over the editor while the connection to the host is being restored. */
export function ReconnectingBanner({ host }: ReconnectingBannerProps) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-3 z-50 flex justify-center"
    >
      <div className="flex items-center gap-2 rounded-card border bg-surface px-3 py-2 text-sm shadow-soft">
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
        {t("session.reconnecting", { host })}
      </div>
    </div>
  );
}
