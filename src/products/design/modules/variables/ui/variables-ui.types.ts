import type { ComponentProps, ReactNode } from "react";

import type {
  CollectionRecord,
  ModeContext,
  StyleRecord,
  TokenGroupNode,
  VariableRecord,
} from "@canvas";
import type { TokenSource } from "@canvas-ui";
import type { LibraryEntry } from "@shared/core";
import type { StyleTypeEntry } from "../../core/ui";

export interface VariableRowProps {
  variable: VariableRecord;
  modes: ModeContext;
  editing: boolean;
  setEditing: (open: boolean) => void;
  onDelete: () => void;
  /** Where it comes from, when the list is grouped by source (a file using libraries). */
  source?: TokenSource;
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
  /** Where the collection comes from, when grouped by source. */
  source?: TokenSource;
}

export interface SidebarCollectionProps extends SidebarGroupsProps {
  collection: CollectionRecord;
  /** Its name above its groups (several collections, or grouped by source). */
  caption: boolean;
  source?: TokenSource;
}

/** A text or true/false variable's own value for one mode. */
export interface PlainValueInputProps<T> {
  value: T;
  label: string;
  onChange: (value: T) => void;
  className?: string;
}

export interface MoveToLibraryMenuProps {
  /** The file's own variables, collections or styles it moves. */
  ids: readonly string[];
  /** What is right-clicked. */
  children: ReactNode;
}

export interface StyleSourceListProps {
  /** Where they come from; unset in a file without libraries. */
  source?: TokenSource;
  styles: readonly StyleRecord[];
  /** The style types, in order. */
  types: readonly StyleTypeEntry[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onDelete: (id: string) => void;
}

/** The file's project libraries for its libraries menu (`useFileLibraries`). */
export interface FileLibraries {
  /** The project's libraries are open (switches work only then). */
  ready: boolean;
  projectName: string;
  /** The project's libraries, in its order. */
  entries: LibraryEntry[];
  /** The ones the file uses. */
  used: ReadonlySet<string>;
  /** The ones whose file can't be read now. */
  unreadable: ReadonlySet<string>;
  /** How many layers use a library's variables and styles. */
  users: (libraryId: string) => number;
  /** Turns a library on or off for the file. */
  setUsed: (libraryId: string, on: boolean) => void;
}

/** A library the right-click menu can move items to. */
export interface MoveTarget {
  id: string;
  label: string;
  select: () => void;
}

/** `useMoveToLibrary`'s menu items and the confirmation to render. */
export interface MoveToLibrary {
  targets: MoveTarget[];
  dialog: ReactNode;
}
