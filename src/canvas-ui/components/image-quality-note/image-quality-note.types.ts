export interface ImageQualityNoteProps {
  /** The picture's asset; nothing shows without one. */
  assetId: string | null;
  className?: string;
}

/** What `ImageQualityNote` says (see `imageQualityText`). */
export interface ImageQualityText {
  label: string;
  /** A second, quieter line (how large it shows now), if any. */
  detail: string | null;
  tooltip: string;
}
