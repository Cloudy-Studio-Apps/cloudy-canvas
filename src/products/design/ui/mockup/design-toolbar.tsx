import { useState } from "react";
import {
  ChevronDown,
  Frame,
  Hand,
  MessageCircle,
  MousePointer2,
  PenTool,
  Square,
  Type,
} from "lucide-react";

import { FloatingPanel, PanelDivider, ToolButton } from "@canvas-ui";

const TOOLS = [
  { id: "move", label: "Move", shortcut: "V", icon: MousePointer2, menu: true },
  { id: "hand", label: "Hand", shortcut: "H", icon: Hand, menu: false },
  { id: "frame", label: "Frame", shortcut: "F", icon: Frame, menu: true, group: true },
  { id: "shape", label: "Rectangle", shortcut: "R", icon: Square, menu: true },
  { id: "pen", label: "Pen", shortcut: "P", icon: PenTool, menu: true },
  { id: "text", label: "Text", shortcut: "T", icon: Type, menu: false },
  { id: "comment", label: "Comment", shortcut: "C", icon: MessageCircle, menu: false, group: true },
];

/** The floating toolbar at the bottom of the canvas. */
export function DesignToolbar() {
  const [tool, setTool] = useState("move");

  return (
    <FloatingPanel className="gap-0">
      {TOOLS.map(({ id, label, shortcut, icon: Icon, menu, group }) => (
        <div key={id} className="flex items-center">
          {group && <PanelDivider className="mx-1.5" />}
          <ToolButton
            label={label}
            shortcut={shortcut}
            active={tool === id}
            onClick={() => setTool(id)}
          >
            <Icon />
          </ToolButton>
          {menu && (
            <button
              type="button"
              aria-label={`More ${label.toLowerCase()} tools`}
              className="flex h-9 w-3.5 cursor-pointer items-center justify-center rounded-sm text-subtle-foreground hover:bg-hover hover:text-foreground"
            >
              <ChevronDown className="size-3" />
            </button>
          )}
        </div>
      ))}
    </FloatingPanel>
  );
}
