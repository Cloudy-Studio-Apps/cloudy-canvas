import { AgentToolRow } from "./agent-tool-row";
import type { AgentToolSectionViewProps } from "./agent-tools-dialog.types";

/** A product's or plugin's tools under its title. */
export function AgentToolSectionView({ section }: AgentToolSectionViewProps) {
  return (
    <section>
      <h3 className="sticky top-0 border-b border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted-foreground">
        {section.title} · {section.tools.length}
      </h3>
      <ul className="divide-y divide-border">
        {section.tools.map((tool) => (
          <AgentToolRow key={tool.name} tool={tool} />
        ))}
      </ul>
    </section>
  );
}
