import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@shared/ui/components/ui/button";
import { Input } from "@shared/ui/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { useEditorModules } from "@canvas-ui";
import { useBoardEngine } from "../../board-engine-context";
import { LIBRARY_TABS } from "./library-catalog";
import { shownSections } from "./library-filter";
import { LibrarySectionView } from "./library-section";
import type { LibraryItem, LibraryPanelProps, LibraryTabInfo } from "./library.types";

/** Widgets, templates, lists and more, in tabs with one search for all of them. */
export function LibraryPanel({ onClose }: LibraryPanelProps) {
  const engine = useBoardEngine();
  const { host } = useEditorModules();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<LibraryTabInfo["id"]>("all");
  const sections = useMemo(
    () => shownSections(host, engine, tab, query.trim()),
    [host, engine, tab, query],
  );

  const pick = (item: LibraryItem) => {
    if (!item.run) return;
    item.run(engine);
    onClose();
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 border-b px-3 pt-3 pb-2">
        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search widgets, templates and more"
              aria-label="Search the library"
              className="pl-8"
            />
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        </div>
        <Tabs value={tab} onValueChange={(value) => setTab(value as LibraryTabInfo["id"])}>
          <TabsList className="w-full">
            {LIBRARY_TABS.map((info) => (
              <TabsTrigger key={info.id} value={info.id}>
                {info.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex h-[420px] flex-col gap-3 overflow-y-auto p-3">
        {sections.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing matches your search.
          </p>
        ) : (
          sections.map(({ section, items }) => (
            <LibrarySectionView key={section.id} section={section} items={items} onPick={pick} />
          ))
        )}
      </div>
    </div>
  );
}
