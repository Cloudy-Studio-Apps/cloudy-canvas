import type { ReactNode } from "react";

import type {
  DocumentTokens,
  ImportChoice,
  ModeContext,
  TokenGroupNode,
  TokenScope,
  TokenStore,
  VariableRecord,
  VariableType,
} from "@canvas";

/** The open document's variables: the facade that edits them and what they are now. */
export interface DocumentTokensState {
  tokens: DocumentTokens;
  store: TokenStore;
}

export interface TokenSwatchProps {
  /** A token color (`#RRGGBBAA`) or any CSS hex. */
  color: string;
  /** A circle (Figma's color rows) instead of a square. */
  round?: boolean;
  className?: string;
}

export interface TokenGroupAccordionProps<T extends { id: string; name: string } = VariableRecord> {
  group: TokenGroupNode<T>;
  /** Remembers which groups are open (per section). */
  storageKey: string;
  renderVariable: (variable: T) => ReactNode;
  /** Extra content in a group's header (e.g. a menu). */
  renderGroupActions?: (group: TokenGroupNode<T>) => ReactNode;
  /** Groups start open (search results). */
  defaultOpen?: boolean;
}

/** A group's body inside `TokenGroupAccordion`, with its open state. */
export interface GroupBodyProps<
  T extends { id: string; name: string } = VariableRecord,
> extends TokenGroupAccordionProps<T> {
  open: Set<string>;
  toggle: (path: string) => void;
  depth: number;
}

export interface VariablePickerProps {
  type: VariableType;
  /** The field's scopes: variables limited to other scopes aren't offered. */
  scopes: readonly TokenScope[];
  /** The variable bound now, marked in the list. */
  value: string | null;
  /** The modes values are shown in. */
  modes: ModeContext;
  onPick: (variableId: string) => void;
  /** The trigger (rendered as the popover's anchor). */
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  /** Below the list (e.g. a link to where the variables are managed); picking it closes the list. */
  footer?: ReactNode;
}

export interface VariableChipProps {
  /** The bound variable, or `null` when the selection's bindings differ ("Mixed"). */
  variableId: string | null;
  modes: ModeContext;
  type: VariableType;
  scopes: readonly TokenScope[];
  onPick: (variableId: string) => void;
  onDetach: () => void;
  className?: string;
}

export interface VariableValueProps {
  variable: VariableRecord;
  modes: ModeContext;
  /** Colors as circles. */
  round?: boolean;
  className?: string;
}

export interface ImportConflictsProps {
  /** The incoming names that are taken (`Collection/path`, a style's name). */
  names: readonly string[];
  choice: ImportChoice;
  onChoice: (choice: ImportChoice) => void;
}
