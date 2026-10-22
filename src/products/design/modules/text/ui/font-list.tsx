import { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { FieldBox } from "@design/ui/components/panel";
import type { FontListProps } from "./font-picker.types";

/** Rows shown at once; typing narrows the list to what matters. */
const MAX_ROWS = 200;

const SOURCES = [
  { source: "installed", title: "Installed" },
  { source: "google", title: "Google Fonts" },
] as const;

/** A searchable list of families, installed ones first (shown in their own font). */
export function FontList({ families, current, onPick }: FontListProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = families.filter((item) => item.family.toLowerCase().includes(needle));

  return (
    <div className="flex w-64 flex-col gap-2 p-2">
      <FieldBox>
        <Search className="size-3.5 shrink-0 text-subtle-foreground" />
        <input
          aria-label="Search fonts"
          placeholder="Search fonts"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle-foreground"
        />
      </FieldBox>
      <div className="max-h-80 overflow-y-auto">
        {matches.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No font has that name.
          </p>
        )}
        {SOURCES.map(({ source, title }) => {
          const list = matches.filter((item) => item.source === source).slice(0, MAX_ROWS);
          if (list.length === 0) return null;
          return (
            <section key={source} className="pb-1">
              <h3 className="px-2 py-1 text-xs text-muted-foreground">{title}</h3>
              <ul>
                {list.map((item) => (
                  <li key={item.family}>
                    <button
                      type="button"
                      onClick={() => onPick(item)}
                      style={
                        source === "installed" ? { fontFamily: `"${item.family}"` } : undefined
                      }
                      className={cn(
                        "flex h-7 w-full cursor-pointer items-center truncate rounded-sm px-2 text-left text-sm text-foreground hover:bg-hover",
                        item.family === current &&
                          "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
                      )}
                    >
                      {item.family}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
