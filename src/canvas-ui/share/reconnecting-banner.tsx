import { LoaderCircle } from "lucide-react";

import type { ReconnectingBannerProps } from "./reconnecting-banner.types";
import { useStoreState } from "./use-store-state";
import { t } from "./share.i18n";

/** Over a joined session's editor while the connection to the host is being restored. */
export function ReconnectingBanner({ guest }: ReconnectingBannerProps) {
  const state = useStoreState(guest.state);
  if (state.status !== "reconnecting") return null;
  const host = state.host?.name ?? t("reconnecting.theHost");
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-3 z-50 flex justify-center"
    >
      <div className="flex items-center gap-2 rounded-card border bg-surface px-3 py-2 text-sm shadow-soft">
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
        {t("reconnecting.message", { host })}
      </div>
    </div>
  );
}
