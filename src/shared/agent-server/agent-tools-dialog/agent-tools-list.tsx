import { useMemo, useState } from "react";

import { SearchInput } from "@shared/ui/kit";
import { AgentToolSectionView } from "./agent-tool-section";
import type { AgentToolsListProps } from "./agent-tools-dialog.types";

/** The tools by section, filtered by a search on their names and descriptions. */
export function AgentToolsList({ sections }: AgentToolsListProps) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return sections;
    return sections
      .map((section) => ({
        ...section,
        tools: section.tools.filter((tool) => {
          const text = `${tool.name} ${tool.description}`.toLowerCase();
          return words.every((word) => text.includes(word));
        }),
      }))
      .filter((section) => section.tools.length > 0);
  }, [sections, query]);

  return (
    <>
      <div className="px-4 py-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search tools"
          aria-label="Search tools"
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto border-t border-border">
        {shown.length > 0 ? (
          shown.map((section) => <AgentToolSectionView key={section.id} section={section} />)
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {sections.length > 0 ? "No tools match." : "No tools are available here."}
          </p>
        )}
      </div>
    </>
  );
}
