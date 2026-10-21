import { Hand, Highlighter, MousePointer2, StickyNote, Type, type LucideIcon } from "lucide-react";

import type { CanvasEngine, EngineState, ToolId } from "@engine";
import { Separator } from "@ui/components/ui/separator";
import { FloatingPanel } from "./floating-panel";
import { ToolButton } from "./tool-button";

const TOOL_GROUPS: { id: ToolId; label: string; shortcut: string; icon: LucideIcon }[][] = [
  [
    { id: "select", label: "Select", shortcut: "V", icon: MousePointer2 },
    { id: "hand", label: "Hand", shortcut: "H", icon: Hand },
  ],
  [
    { id: "marker", label: "Marker", shortcut: "M", icon: Highlighter },
    { id: "sticky", label: "Sticky note", shortcut: "S", icon: StickyNote },
    { id: "text", label: "Text", shortcut: "T", icon: Type },
  ],
];

export function BoardToolbar({ engine, state }: { engine: CanvasEngine; state: EngineState }) {
  return (
    <FloatingPanel role="toolbar" aria-label="Tools" aria-orientation="horizontal">
      {TOOL_GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <Separator orientation="vertical" className="mx-1 h-6!" />}
          {group.map(({ id, label, shortcut, icon: Icon }) => (
            <ToolButton
              key={id}
              label={label}
              shortcut={shortcut}
              active={state.tool === id}
              onClick={() => engine.setTool(id)}
            >
              <Icon />
            </ToolButton>
          ))}
        </div>
      ))}
    </FloatingPanel>
  );
}
