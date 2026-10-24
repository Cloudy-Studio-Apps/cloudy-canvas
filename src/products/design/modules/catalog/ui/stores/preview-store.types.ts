export interface BrochurePreviewState {
  /** The spread shown (its position among the spreads), or `null` while the preview is closed. */
  spread: number | null;
  open: (spread?: number) => void;
  show: (spread: number) => void;
  close: () => void;
}
