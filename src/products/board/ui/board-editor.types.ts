import type { ShareGuest } from "@canvas";

export interface BoardEditorProps {
  id: string;
  /** A live session joined as a guest: its board instead of a file (`id` is then a key only). */
  live?: ShareGuest;
}
