/** The hotspots' outlines in the player. */
export interface PlayerHints {
  /** Outlined now: kept on, or flashing after a missed click. */
  shown: boolean;
  /** Kept on (the hotspots button, H). */
  pinned: boolean;
  toggle: () => void;
  /** After a missed click: shows them for 700 ms, when the flow's `hints` is on. */
  flash: () => void;
}
