import { ChevronRight, Component } from "lucide-react";

import { PanelAddButton, PanelSection } from "./panel-section";
import { SearchField } from "./search-field";

const COMPONENTS = [
  "Button / Primary",
  "Button / Secondary",
  "Navigation",
  "Card",
  "Input",
  "Badge",
];
const LIBRARIES = ["Cloudy UI kit", "Seal icons"];

/** The left panel's Assets tab: this file's components and the linked libraries. */
export function AssetsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b p-3">
        <SearchField placeholder="Search assets" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PanelSection title="Local components">
          <ul className="grid grid-cols-2 gap-2">
            {COMPONENTS.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer flex-col gap-1.5 rounded-sm p-1 text-left hover:bg-hover"
                >
                  <span className="flex aspect-[4/3] items-center justify-center rounded-sm border bg-surface-sunken text-design">
                    <Component className="size-5" />
                  </span>
                  <span className="truncate text-xs text-foreground">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        </PanelSection>
        <PanelSection title="Libraries" actions={<PanelAddButton label="Add library" />}>
          <ul className="flex flex-col gap-px">
            {LIBRARIES.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="flex h-7 w-full cursor-pointer items-center gap-2 rounded-sm px-2 text-left text-sm text-foreground hover:bg-hover"
                >
                  <span className="flex-1 truncate">{name}</span>
                  <ChevronRight className="size-3.5 text-subtle-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </PanelSection>
      </div>
    </div>
  );
}
