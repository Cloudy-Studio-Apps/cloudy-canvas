import { Library } from "lucide-react";

import { cn } from "@shared/ui/kit";
import type { LibraryBadgeProps } from "./tokens.types";
import { t } from "./tokens.i18n";

/** The small mark on a library item: it comes from the project library `name`. */
export function LibraryBadge({ name, className }: LibraryBadgeProps) {
  const label = t("source.fromLibrary", { name });
  return (
    <Library
      role="img"
      aria-label={label}
      className={cn("size-3 shrink-0 text-subtle-foreground", className)}
    >
      <title>{label}</title>
    </Library>
  );
}
