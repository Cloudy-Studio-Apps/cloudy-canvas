import { useMemo } from "react";
import { useParams } from "react-router";

import { shareTransport } from "@platform";
import { readShareTicket } from "@shared/core";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { JoinMessage } from "./join-message";
import { JoinNameForm } from "./join-name-form";
import { JoinSession } from "./join-session";
import { t } from "./join.i18n";

/** `/join/:ticket`: a live session's link, opened as a guest. */
export function JoinPage() {
  const { ticket: ticketText = "" } = useParams<{ ticket: string }>();
  const ticket = useMemo(() => readShareTicket(ticketText), [ticketText]);
  const name = useCollaborationStore((s) => s.name);
  const color = useCollaborationStore((s) => s.color);
  const identity = useMemo(() => ({ name, color }), [name, color]);

  let content;
  if (!shareTransport) {
    content = <JoinMessage title={t("page.desktopOnly")} />;
  } else if (!ticket) {
    content = <JoinMessage title={t("page.invalidTitle")} description={t("page.invalidHint")} />;
  } else if (!name) {
    content = <JoinNameForm />;
  } else {
    content = (
      <JoinSession key={ticketText} ticketText={ticketText} ticket={ticket} identity={identity} />
    );
  }
  return <div className="h-full bg-background">{content}</div>;
}
