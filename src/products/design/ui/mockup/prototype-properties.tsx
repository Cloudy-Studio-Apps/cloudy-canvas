import { ChevronDown, MousePointerClick } from "lucide-react";

import { PanelAddButton, PanelSection } from "./panel-section";
import type { PrototypePropertiesProps } from "./prototype-properties.types";

/** The right panel's Prototype tab: the selected frame's interactions, or the page's flows. */
export function PrototypeProperties({ frame }: PrototypePropertiesProps) {
  if (!frame) {
    return (
      <>
        <PanelSection title="Device">
          <button
            type="button"
            className="flex h-7 w-full cursor-pointer items-center justify-between rounded-sm bg-muted px-2 text-xs text-foreground hover:bg-hover"
          >
            Desktop · 1440 × 900
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        </PanelSection>
        <PanelSection title="Flows" actions={<PanelAddButton label="Add flow" />}>
          <p className="text-xs text-muted-foreground">
            Select a frame and add a starting point to create a flow.
          </p>
        </PanelSection>
      </>
    );
  }

  return (
    <>
      <PanelSection
        title="Flow starting point"
        actions={<PanelAddButton label="Add starting point" />}
      />
      <PanelSection title="Interactions" actions={<PanelAddButton label="Add interaction" />}>
        <div className="flex items-center gap-2 rounded-sm bg-muted px-2 py-1.5 text-xs text-foreground">
          <MousePointerClick className="size-3.5 text-muted-foreground" />
          On click
          <span className="text-muted-foreground">→</span>
          <span className="truncate">Features</span>
        </div>
      </PanelSection>
      <PanelSection title="Scroll behavior">
        <button
          type="button"
          className="flex h-7 w-full cursor-pointer items-center justify-between rounded-sm bg-muted px-2 text-xs text-foreground hover:bg-hover"
        >
          Scroll with parent
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PanelSection>
    </>
  );
}
