import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { BoardEditor } from "@board/ui";
import { ShareGuest } from "@canvas";
import { useHeldGuest, useStoreState } from "@canvas-ui";
import { DesignEditor } from "@design/ui";
import { shareTransport } from "@platform";
import type { ShareTransport } from "@shared/core";
import { toast } from "@shared/stores/toast-store";
import { JoinMessage } from "./join-message";
import { ReconnectingBanner } from "./reconnecting-banner";
import { useMissingPluginsNotice } from "./use-missing-plugins-notice";
import type { JoinedSessionProps, JoinSessionProps } from "./join-page.types";
import { t } from "./join.i18n";

/** End titles, by why the session ended for this guest. */
const END_TITLES = {
  ended: t("end.ended"),
  removed: t("end.removed"),
  denied: t("end.denied"),
  lost: t("end.lost"),
  failed: t("end.failed"),
} as const;

/**
 * Joins the session in the link and, once the host lets the user in and the file has arrived,
 * shows it in the product's editor. When the session is over, back to Home with why.
 */
export function JoinSession({ ticketText, ticket, identity }: JoinSessionProps) {
  const navigate = useNavigate();
  const leave = useCallback(() => void navigate("/"), [navigate]);
  const guest = useHeldGuest(ticketText, () =>
    ShareGuest.join({
      ticket,
      transport: shareTransport as ShareTransport,
      identity,
      appVersion: __APP_VERSION__,
    }),
  );
  return <JoinedSession guest={guest} onEnd={leave} />;
}

function JoinedSession({ guest, onEnd }: JoinedSessionProps) {
  const state = useStoreState(guest.state);
  const [opened, setOpened] = useState(false);
  useMissingPluginsNotice(state.file);
  if (!opened && state.status === "live") setOpened(true);

  useEffect(() => {
    const { status, end } = state;
    if (status !== "closed" || !end) return;
    if (end.reason !== "left") {
      toast({
        title: END_TITLES[end.reason],
        description: end.message,
        ...(end.reason === "ended" ? {} : { tone: "error" as const }),
      });
    }
    onEnd();
  }, [state, onEnd]);

  const host = state.host?.name ?? t("session.theHost");
  if (!opened) {
    switch (state.status) {
      case "connecting":
        return <JoinMessage title={t("session.connecting")} busy />;
      case "waiting":
        return (
          <JoinMessage
            title={t("session.waiting", { host })}
            description={t("session.waitingHint")}
            busy
          />
        );
      default:
        return (
          <JoinMessage
            title={t("session.opening", {
              host,
              product: t(`session.${state.file?.product ?? "file"}`),
            })}
            busy
          />
        );
    }
  }

  const key = `live:${state.file?.fileId ?? ""}`;
  return (
    <div className="relative h-full">
      {state.file?.product === "design" ? (
        <DesignEditor id={key} live={guest} />
      ) : (
        <BoardEditor id={key} live={guest} />
      )}
      {state.status === "reconnecting" && <ReconnectingBanner host={host} />}
    </div>
  );
}
