import type { ReactNode } from "react";

export interface CreateTileProps {
  /** The icon chip on the left. */
  icon: ReactNode;
  title: string;
  /** One line under the title (cut with an ellipsis when it doesn't fit). */
  hint: ReactNode;
  onSelect: () => void;
  /** Dashed and flat: a secondary action (Open file). */
  dashed?: boolean;
  /** For a shortcut, e.g. `Control+O`. */
  keyShortcuts?: string;
}
