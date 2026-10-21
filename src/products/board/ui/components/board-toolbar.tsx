import { FloatingPanel, PanelDivider, ToolButton, useEngine, useEngineState } from "@canvas-ui";
import { BOARD_TOOL_GROUPS } from "../board-tools";

export function BoardToolbar() {
  const engine = useEngine();
  const activeTool = useEngineState((state) => state.tool);

  return (
    <FloatingPanel role="toolbar" aria-label="Tools" aria-orientation="horizontal">
      {BOARD_TOOL_GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <PanelDivider />}
          {group.map((item) => {
            const { id, icon: Icon } = item;
            // An element tool whose kind isn't registered falls back to its element type as the label.
            const { label, description } =
              "element" in item
                ? (engine.elementInfo(item.element) ?? {
                    label: item.element,
                    description: undefined,
                  })
                : item;
            return (
              <ToolButton
                key={id}
                label={label}
                description={description}
                shortcut={engine.keymap.label(`tool.${id}`)}
                active={activeTool === id}
                onClick={() => engine.setTool(id)}
              >
                <Icon />
              </ToolButton>
            );
          })}
        </div>
      ))}
    </FloatingPanel>
  );
}
