import type { LucideIcon } from "lucide-react";

/** What a library holds, as the sidebar's Content section and a library's page list it. */
export type LibraryKind = "colors" | "text" | "images" | "svg" | "components" | "effects";

export interface LibraryKindInfo {
  kind: LibraryKind;
  icon: LucideIcon;
}
