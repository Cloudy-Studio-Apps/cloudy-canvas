import { Search } from "lucide-react";

import type { SearchFieldProps } from "./search-field.types";

/** The search box at the top of a left panel tab. */
export function SearchField({ placeholder }: SearchFieldProps) {
  return (
    <label className="flex h-7 items-center gap-2 rounded-sm border border-transparent bg-muted px-2 text-xs focus-within:border-ring focus-within:bg-surface hover:border-border">
      <Search className="size-3.5 shrink-0 text-subtle-foreground" />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle-foreground"
      />
    </label>
  );
}
