import type { ColorChangeInfo } from "@canvas-ui";
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
  /** 0–1: the picker shows its opacity slider; left out for colors without one. */
  opacity?: number;
  label: string;
  /** Each step of a drag and its end; the steps of one drag are one undo step. */
  onChange: (color: string, opacity: number, info: ColorChangeInfo) => void;
}

/** A hover action; takes a trigger's props and ref too (it opens the variable picker). */
export interface ExpressionInputProps {
  variable: VariableRecord;
  /** `DEFAULT_VALUE`, or a mode id. */
  mode: string;
  /** The stored expression (references by id). */
  expr: string;
  /** The modes its result is shown in. */
  modes: ModeContext;
  label: string;
  className?: string;
}

export interface ActionButtonProps extends ComponentProps<"button"> {
  label: string;
  /** Always visible, not only on hover. */
  shown?: boolean;
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

/** A text or true/false variable's own value for one mode. */
export interface PlainValueInputProps<T> {
  value: T;
  label: string;
  onChange: (value: T) => void;
  className?: string;
}
