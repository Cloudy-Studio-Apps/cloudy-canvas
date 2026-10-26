import type { ReactNode } from "react";

import type { BindableField, StyleRecord } from "@canvas";

export interface DeleteTokensDialogProps {
  /** The variables or styles to delete; `null` closes it. */
  ids: string[] | null;
  onClose: () => void;
}

/** A style binding of the selection (or of a text range): what's bound and how to change it. */
export interface StyleBinding {
  /** The style every target uses; `null`: different ones; `undefined`: none. */
  bound: string | null | undefined;
  /** Applies a style (`null` detaches it, keeping the look), one undo step. */
  bind: (styleId: string | null) => void;
}

export interface StyleControlProps {
  binding: StyleBinding;
  styleType: string;
  /** The picker's create item, e.g. "Create style from these fills". */
  createLabel: string;
  /** Makes a style from the selection; its id, or `null`. */
  create: () => string | null;
  /** Shows the bound style's name beside the button (the Typography header). */
  showName?: boolean;
  /** The button's name; "Styles" by default. */
  label?: string;
}

export interface StyleListProps {
  styleType: string;
  /** The style the selection uses, marked. */
  current: string | null;
  onPick: (styleId: string) => void;
}

export interface StyleChipProps {
  binding: StyleBinding;
}

export interface StyleRowProps {
  style: StyleRecord;
  editing: boolean;
  setEditing: (open: boolean) => void;
  onDelete: () => void;
}

export interface StyleEditorPopoverProps {
  style: StyleRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  /** What opens it. */
  children: ReactNode;
}

export interface StyleBindingScopeProps {
  style: StyleRecord;
  /** The bindable field at a path of the style's value, or `undefined` when it has none there. */
  fieldOf: (path: string) => BindableField | undefined;
  children: ReactNode;
}

export interface StyleEditorFrameProps {
  style: StyleRecord;
  onDelete: () => void;
  /** The style's own controls, between its name and its description. */
  children: ReactNode;
}

/** A style editor's value writes: a drag's steps join one undo step. */
export interface StyleValueWriter {
  write: (
    value: Record<string, unknown>,
    info?: { done: boolean },
    bindings?: Record<string, string>,
  ) => void;
}
