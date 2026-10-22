import { useState } from "react";

import { DesignRail } from "./design-rail";
import type { DesignRailTab } from "./design-rail.types";
import type { DesignEditorMockupProps } from "./design-editor-mockup.types";
import { DesignToolbar } from "./design-toolbar";
import { LeftPanel } from "./left-panel";
import { MOCK_FRAMES } from "./mock-data";
import { MockCanvas } from "./mock-canvas";
import { PropertiesPanel } from "./properties-panel";

/**
 * Static layout of the design editor, to settle the look before wiring the engine: docked layers
 * and properties panels around the canvas, and a floating toolbar. Selection is local state.
 */
export function DesignEditorMockup({ fileName, onHome }: DesignEditorMockupProps) {
  const [tab, setTab] = useState<DesignRailTab>("layers");
  const [selectedId, setSelectedId] = useState<string | null>("hero");
  const frame = MOCK_FRAMES.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="flex h-full overflow-hidden bg-background text-foreground">
      <DesignRail tab={tab} onTabChange={setTab} onHome={onHome} />
      <LeftPanel tab={tab} fileName={fileName} selectedId={selectedId} onSelect={setSelectedId} />
      <main className="relative min-w-0 flex-1">
        <MockCanvas selectedId={selectedId} onSelect={setSelectedId} />
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <DesignToolbar />
        </div>
      </main>
      <PropertiesPanel frame={frame} />
    </div>
  );
}
