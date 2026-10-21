import type { LucideIcon } from "lucide-react";

import type { ToolId } from "@engine";

/**
 * A toolbar button. Tools that create an element take their label and description from the
 * element's kind; the others give their own.
 */
export type BoardToolItem = { id: ToolId; icon: LucideIcon } & (
  { element: string } | { label: string; description: string }
);
