import type { ShareGuest } from "@canvas";

export interface DesignEditorProps {
  id: string;
  /** A live session joined as a guest: its design instead of a file (`id` is then a key only). */
  live?: ShareGuest;
}
