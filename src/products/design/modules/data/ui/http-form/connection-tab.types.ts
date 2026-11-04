import type { ConnectionDraft } from "./connection-draft.types";

/** What each tab of the Connection dialog gets: the draft, and how to change it. */
export interface ConnectionTabProps {
  draft: ConnectionDraft;
  onChange: (draft: ConnectionDraft) => void;
}
