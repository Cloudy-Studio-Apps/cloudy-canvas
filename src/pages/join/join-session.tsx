import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import { ShareGuest } from "@canvas";
import { useFileTabsModel, useHeldGuest, useStoreState } from "@canvas-ui";
import { shareTransport } from "@platform";
import type { ShareTransport } from "@shared/core";
import { JoinMessage } from "./join-message";
import { openLiveTab } from "./open-live-tab";
import { toastSessionEnd } from "./toast-session-end";
import { useMissingPluginsNotice } from "./use-missing-plugins-notice";
import type { JoinedSessionProps, JoinSessionProps } from "./join-page.types";
import { t } from "./join.i18n";

/**
 * Joins the session in the link and, once the host lets the user in and the file has arrived,
 * opens it in a file tab (`openLiveTab`). A session over before that goes back to Home with why.
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
  const fileTabs = useFileTabsModel();
  /** Given to its tab: what happens to it next is the tab's. */
  const handedOver = useRef(false);
  useMissingPluginsNotice(state.file);

  useEffect(() => {
    if (handedOver.current) return;
    const { status, end } = state;
    if (status === "live") {
      handedOver.current = openLiveTab(fileTabs, guest);
    } else if (status === "closed" && end) {
      toastSessionEnd(end);
      onEnd();
    }
  }, [fileTabs, guest, state, onEnd]);

  const host = state.host?.name ?? t("session.theHost");
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
