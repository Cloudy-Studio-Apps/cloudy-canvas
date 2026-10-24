import type { ComponentProps } from "react";

import type { ModeContext, TokenGroupNode, VariableRecord } from "@canvas";

export interface VariableRowProps {
  variable: VariableRecord;
  modes: ModeContext;
  editing: boolean;
  setEditing: (open: boolean) => void;
  onDelete: () => void;
}

export interface VariableEditorProps {
  variable: VariableRecord;
  onDelete: () => void;
}

export interface ValueFieldProps {
  variable: VariableRecord;
  /** `DEFAULT_VALUE`, or a mode id (its axis's base mode edits the default). */
  mode: string;
  /** Names the field ("Light value"). */
  label: string;
  /** A table cell: no box until hovered or focused. */
  cell?: boolean;
  className?: string;
}

export interface DeleteVariablesDialogProps {
  /** The variables to delete; `null` closes it. */
  ids: string[] | null;
  onClose: () => void;
}

export interface NewVariableMenuProps {
  /** Opens the new variable's editor. */
  onCreated: (id: string) => void;
  /** The collection new variables go in (the first when unset). */
  collectionId?: string;
  /** The group new variables go in. */
  group?: string;
}

export interface GroupActionsProps {
  collectionId: string;
  group: TokenGroupNode;
  onCreated: (id: string) => void;
}

export interface SwatchInputProps {
  /** `#rrggbb`. */
  color: string;
  label: string;
  onCommit: (color: string) => void;
}

/** A hover action; takes a trigger's props and ref too (it opens the variable picker). */
export interface ActionButtonProps extends ComponentProps<"button"> {
  label: string;
}

export interface AdvancedSettingsProps {
  variable: VariableRecord;
}

export interface SidebarGroupsProps {
  modes: ModeContext;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onDelete: (ids: string[]) => void;
}

export interface SidebarGroupRowProps extends SidebarGroupsProps {
  collectionId: string;
  group: string;
  items: readonly VariableRecord[];
}
