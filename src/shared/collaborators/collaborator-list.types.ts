import type { ReactNode } from "react";

import type { Collaborator, CollaboratorKind } from "@shared/core";

export interface CollaboratorListProps {
  /** Only collaborators of this kind (the Agents menu lists agents). */
  kind?: CollaboratorKind;
  /** Only collaborators of this presence source (the Agents menu: this app's own agents). */
  source?: string;
  /** Picking a row follows it (in an editor; not on Home). */
  followable?: boolean;
  /** Buttons shown after a row (an editor's undo of an agent's last step). */
  actions?: (collaborator: Collaborator) => ReactNode;
}
