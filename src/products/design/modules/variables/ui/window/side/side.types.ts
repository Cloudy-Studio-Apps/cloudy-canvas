import type { CollectionRecord } from "@canvas";
import type { TokenSource } from "@canvas-ui";

export interface GroupOutlineProps {
  collection: CollectionRecord;
}

export interface CollectionItemProps {
  collection: CollectionRecord;
  onDelete: (collection: CollectionRecord) => void;
  /** Where it comes from, when the column is grouped by source (a file using libraries). */
  source?: TokenSource;
}

export interface DeleteCollectionDialogProps {
  /** The collection to delete; `null` closes it. */
  collection: CollectionRecord | null;
  onClose: () => void;
}
