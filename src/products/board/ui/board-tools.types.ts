import type { LucideIcon } from "lucide-react";

/**
 * A toolbar button. Tools that create an element take their label and description from the
 * element's kind; the others give their own.
 */
export type BoardToolItem = { id: string; icon: LucideIcon } & (
  { element: string } | { label: string; description: string }
);
