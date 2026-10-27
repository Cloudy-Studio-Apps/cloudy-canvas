import { Search } from "lucide-react";

import { Input } from "@shared/ui/kit";
import { useVariablesWindowStore } from "../variables-window-store";
import { ModeChips } from "./mode-chips";
import { t } from "../../../variables.i18n";

/** The board's top: search, and the modes it draws. */
export function BoardToolbar() {
  const { query, setQuery } = useVariablesWindowStore();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-56 max-w-full">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("board.search")}
          aria-label={t("board.search")}
          className="h-7 pl-7 text-xs"
        />
      </div>
      <ModeChips />
    </div>
  );
}
