import { Switch } from "@shared/ui/components/ui/switch";
import type { AgentToolRowProps } from "./agent-tools-dialog.types";

/** One tool: its name and what it does, with a switch that's always on (tools can't be turned off yet). */
export function AgentToolRow({ tool }: AgentToolRowProps) {
  return (
    <li className="flex items-start justify-between gap-4 px-4 py-2.5">
      <div className="min-w-0 space-y-0.5">
        <p className="font-mono text-sm break-all">{tool.name}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground" title={tool.description}>
          {tool.description}
        </p>
      </div>
      <Switch checked disabled aria-label={`${tool.name} is available`} className="mt-0.5" />
    </li>
  );
}
