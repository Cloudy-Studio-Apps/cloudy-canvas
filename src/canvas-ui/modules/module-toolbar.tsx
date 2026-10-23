import { FloatingPanel, PanelDivider } from "../components/floating-panel";
import { ToolButton } from "../components/tool-button";
import { useEngine, useEngineState } from "../engine-context";
import { useEditorPoint } from "./editor-modules-context";
import type { ModuleToolbarProps } from "./editor-points.types";
import { ExtensionIconView } from "./extension-icon-view";
import { ModeSwitcher } from "./mode-switcher";
import { ToolMenuButton } from "./tool-menu-button";
import { useEditorMode } from "./use-editor-mode";
import { toolbarGroups, toolbarItems, toolInfo } from "./tool-entries";

/**
 * The tools the modules place on the toolbar, in their groups (tools sharing a menu as one), then
 * the buttons for the selection (`selectionActions`, with the select tool); or a tool mode's own
 * toolbar while one of its tools is on (`toolbars`), or the current mode's (`modes`). The mode
 * switcher sits beside it when there's more than one mode.
 */
export function ModuleToolbar({ children }: ModuleToolbarProps) {
  return (
    <div className="pointer-events-none flex items-center gap-2">
      <ToolbarForMode>{children}</ToolbarForMode>
      <ModeSwitcher />
    </div>
  );
}

/** The toolbar the active tool or the current mode calls for, else the main one. */
function ToolbarForMode({ children }: ModuleToolbarProps) {
  const engine = useEngine();
  const activeTool = useEngineState((state) => state.tool);
  const groups = toolbarGroups(useEditorPoint((points) => points.tools));
  const selected = useEngineState((state) => state.selectionCount > 0);
  const actions = [...useEditorPoint((points) => points.selectionActions)].sort(
    (a, b) => a.order - b.order,
  );
  const showsActions = selected && activeTool === "select" && actions.length > 0;
  // A mode's toolbar (e.g. vector editing) stands in while one of its tools is on.
  const Mode = useEditorPoint((points) => points.toolbars).find((mode) =>
    mode.tools.includes(activeTool),
  )?.component;
  const modeToolbar = useEditorMode().entry?.toolbar;
  if (Mode) return <Mode />;
  const ModeToolbar = modeToolbar;
  if (ModeToolbar) return <ModeToolbar />;

  return (
    <FloatingPanel role="toolbar" aria-label="Tools" aria-orientation="horizontal">
      {groups.map((group, i) => (
        <div key={group[0]?.toolbar.group ?? i} className="flex items-center gap-0.5">
          {i > 0 && <PanelDivider />}
          {toolbarItems(group).map((item) => {
            if ("entries" in item) return <ToolMenuButton key={item.menu} entries={item.entries} />;
            const entry = item;
            const { label, description } = toolInfo(entry, engine);
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
      {showsActions && (
        <div className="flex items-center gap-0.5">
          <PanelDivider />
          {actions.map(({ id, component: Action }) => (
            <Action key={id} />
          ))}
        </div>
      )}
      {children}
    </FloatingPanel>
  );
}
