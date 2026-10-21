export interface StickerRecentsState {
  /** Sticker ids, most recently used first; the wheel shows them. */
  recents: string[];
  /** Moves a sticker to the front. */
  use: (id: string) => void;
}
