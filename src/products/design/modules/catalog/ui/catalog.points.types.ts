import type { LucideIcon } from "lucide-react";

import type { PageItemDefinition } from "../model/page-items/page-item-definition.types";

/** A page item the Catalog's Page items list offers: its definition and its icon. */
export interface PageItemEntry extends PageItemDefinition {
  icon: LucideIcon;
}
