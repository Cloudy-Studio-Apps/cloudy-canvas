import type { CollectionRecord } from "@canvas";

export interface GroupOutlineProps {
  collection: CollectionRecord;
}

export interface CollectionItemProps {
  collection: CollectionRecord;
  onDelete: (collection: CollectionRecord) => void;
}

export interface DeleteCollectionDialogProps {
  /** The collection to delete; `null` closes it. */
  collection: CollectionRecord | null;
  onClose: () => void;
}
