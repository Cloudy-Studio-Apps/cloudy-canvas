import type { StyleRecord } from "@canvas";
import type { TextNodeElement } from "@design";

export interface TextStyleEditorProps {
  style: StyleRecord;
  onDelete: () => void;
}

export interface TextStyleControlProps {
  texts: readonly TextNodeElement[];
}

export interface TextStyleListProps {
  /** The style the selection uses, marked. */
  current: string | null;
  onPick: (styleId: string) => void;
}
