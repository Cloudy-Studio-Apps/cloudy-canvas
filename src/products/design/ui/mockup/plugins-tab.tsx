import { Puzzle } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { PanelSection } from "./panel-section";
import { SearchField } from "./search-field";

const PLUGINS = [
  { name: "Color contrast", description: "Check text against its background" },
  { name: "Icon finder", description: "Insert icons from open sets" },
  { name: "Lorem text", description: "Fill text layers with placeholder copy" },
];

/** The left panel's Plugins tab: installed plugins to run. */
export function PluginsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b p-3">
        <SearchField placeholder="Search plugins" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PanelSection title="Installed">
          <ul className="flex flex-col gap-px">
            {PLUGINS.map(({ name, description }) => (
              <li key={name}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-start gap-2 rounded-sm p-2 text-left hover:bg-hover"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-design-soft text-design-foreground">
                    <Puzzle className="size-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-foreground">{name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PanelSection>
        <div className="p-3">
          <Button variant="outline" size="sm" className="w-full">
            Manage plugins
          </Button>
        </div>
      </div>
    </div>
  );
}
