import { shortcutLabel } from "@engine";
import { BOARD_TOOL_GROUPS } from "../board-tools";
import { useEngine, useEngineState } from "../engine/engine-context";
import { FloatingPanel, PanelDivider } from "./floating-panel";
import { ToolButton } from "./tool-button";

export function BoardToolbar() {
  const engine = useEngine();
  const activeTool = useEngineState((state) => state.tool);

  return (
    <FloatingPanel role="toolbar" aria-label="Tools" aria-orientation="horizontal">
      {BOARD_TOOL_GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <PanelDivider />}
          {group.map(({ id, label, icon: Icon }) => (
            <ToolButton
              key={id}
              label={label}
              shortcut={shortcutLabel(`tool.${id}`)}
              active={activeTool === id}
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
