import { Search, X } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type { SearchInputProps } from "./search-input.types";

/** A search box: the icon, the text, a clear button; Escape clears it first. */
export function SearchInput({
  value,
  onChange,
  size = "md",
  className,
  placeholder = "Search",
  onKeyDown,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 rounded-md border border-input bg-surface px-2 text-sm text-foreground transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25",
        size === "sm" ? "h-control-sm" : "h-control",
        className,
      )}
    >
      <Search className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            event.stopPropagation();
            onChange("");
          }
          onKeyDown?.(event);
        }}
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-subtle-foreground [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-hover hover:text-foreground [&_svg]:size-3"
        >
          <X />
        </button>
      )}
    </div>
  );
}
