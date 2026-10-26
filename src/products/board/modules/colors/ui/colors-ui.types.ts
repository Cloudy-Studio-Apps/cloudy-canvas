import type { CollectionRecord, VariableRecord } from "@canvas";
import type { ColorSource } from "@board";

export interface CollectionColorsProps {
  collection: CollectionRecord;
  /** Its color variables. */
  colors: readonly VariableRecord[];
}

export interface ColorRowProps {
  variable: VariableRecord;
  onDelete: (variable: VariableRecord) => void;
}

export interface ColorValuePopoverProps {
  variable: VariableRecord;
}

export interface InlineRenameProps {
  /** What the button and the field are named ("Rename group"). */
  label: string;
  /** The name now (a group's full path). */
  value: string;
  onRename: (name: string) => void;
}

export interface DeleteCollectionDialogProps {
  /** The collection asked about, or `null` (closed). */
  collection: CollectionRecord | null;
  onClose: () => void;
}

export interface DeleteColorDialogProps {
  /** The color asked about, or `null` (closed). */
  variable: VariableRecord | null;
  onClose: () => void;
}

/** A picked file's colors, waiting to be imported. */
export interface ColorImportSource extends ColorSource {
  /** The file's name. */
  name: string;
}

export interface ImportColorsDialogProps {
  /** The file to import from, or `null` (closed). */
  source: ColorImportSource | null;
  onClose: () => void;
}

export interface ImportColorsBodyProps {
  source: ColorImportSource;
  onClose: () => void;
}
