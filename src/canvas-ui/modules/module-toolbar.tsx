import { FloatingPanel, PanelDivider } from "../components/floating-panel";
import { ToolButton } from "../components/tool-button";
import { useEngine, useEngineState } from "../engine-context";
import { useEditorPoint } from "./editor-modules-context";
import type { ModuleToolbarProps } from "./editor-points.types";
import { ExtensionIconView } from "./extension-icon-view";
import { toolbarGroups } from "./toolbar-groups";

/** The tools the modules put on the toolbar, in their groups. */
export function ModuleToolbar({ children }: ModuleToolbarProps) {
  const engine = useEngine();
  const activeTool = useEngineState((state) => state.tool);
  const groups = toolbarGroups(useEditorPoint((points) => points.toolbar));

  return (
    <FloatingPanel role="toolbar" aria-label="Tools" aria-orientation="horizontal">
      {groups.map((group, i) => (
        <div key={group[0]?.group ?? i} className="flex items-center gap-0.5">
          {i > 0 && <PanelDivider />}
          {group.map((entry) => {
            // An element tool whose kind isn't registered falls back to its element type as the label.
            const { label, description } =
              "element" in entry
                ? (engine.elementInfo(entry.element) ?? {
                    label: entry.element,
                    description: undefined,
                  })
                : entry;
            return (
              <ToolButton
                key={entry.tool}
                label={label}
                description={description}
                shortcut={engine.keymap.label(`tool.${entry.tool}`)}
                active={
                  activeTool === entry.tool ||
                  !!entry.subTools?.some((sub) => sub.id === activeTool)
                }
                onClick={() => engine.setTool(entry.tool)}
              >
                <ExtensionIconView icon={entry.icon} />
              </ToolButton>
            );
          })}
        </div>
      ))}
      {children}
    </FloatingPanel>
  );
}
