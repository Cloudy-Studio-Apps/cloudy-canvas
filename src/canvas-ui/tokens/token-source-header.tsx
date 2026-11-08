import { FileText, Library } from "lucide-react";

import { Badge, cn } from "@shared/ui/kit";
import type { TokenSourceHeaderProps } from "./tokens.types";
import { t } from "./tokens.i18n";

/**
 * A source's heading in a list grouped by where items come from: a library's name with a
 * "Library" badge, or "This file" with "Local"; a library's note says edits reach every file
 * using it (or, while its items can't be edited, why).
 */
export function TokenSourceHeader({ source, note = true, className }: TokenSourceHeaderProps) {
  const library = source.libraryId !== null;
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex h-6 items-center gap-1.5 text-xs font-medium">
        {library ? (
          <Library className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate">
          {library ? source.name : t("source.thisFile")}
        </span>
        <Badge variant="outline" className="px-1 py-0 text-[10px]">
          {library ? t("source.libraryBadge") : t("source.localBadge")}
        </Badge>
      </div>
      {library && note && (
        <p className="text-[11px] text-subtle-foreground">
          {source.editable ? t("source.sharedNote") : t("source.readOnlyNote")}
        </p>
      )}
    </div>
  );
}
