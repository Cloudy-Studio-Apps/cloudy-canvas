import type { LucideIcon } from "lucide-react";

/**
 * A toolbar button. Tools that create an element take their label and description from the
 * element's kind; the others give their own.
 */
export type BoardToolItem = {
  id: string;
  icon: LucideIcon;
  /** Tools picked from this button's options panel, which keep it active (e.g. the eraser). */
  subTools?: BoardSubTool[];
} & ({ element: string } | { label: string; description: string });

/** A tool reached through another tool's button, listed with its own shortcut. */
export interface BoardSubTool {
  id: string;
  label: string;
}
