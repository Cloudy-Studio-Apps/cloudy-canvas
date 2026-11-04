import { Bookmark } from "lucide-react";

import type { SectionHeadingRowProps } from "./brochure-page-row.types";

/** A section's name in the page list, above its first page. */
export function SectionHeadingRow({ name }: SectionHeadingRowProps) {
  return (
    <li className="flex items-center gap-1 px-1 pt-2 pb-0.5 text-xs font-semibold text-foreground [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
      <Bookmark />
      <span className="truncate">{name}</span>
    </li>
  );
}
