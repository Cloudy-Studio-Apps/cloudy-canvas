import { FloatingPanel, PanelDivider } from "../components/floating-panel";
import { ToolButton } from "../components/tool-button";
import { useEngine, useEngineState } from "../engine-context";
import { useEditorPoint } from "./editor-modules-context";
import type { ModuleToolbarProps } from "./editor-points.types";
import { ExtensionIconView } from "./extension-icon-view";
import { ModeSwitcher } from "./mode-switcher";
import { PhoneToolbar, PhoneToolGrid } from "./phone-toolbar";
import { ToolMenuButton } from "./tool-menu-button";
import { useIsPhone } from "@shared/ui/hooks/use-is-phone";
import { useEditorMode } from "./use-editor-mode";
import { toolbarGroups, toolbarItems, toolInfo } from "./tool-entries";
import { t } from "./modules.i18n";

/**
 * The tools the modules place on the toolbar, in their groups (tools sharing a menu as one), then
 * the buttons for the selection (`selectionActions`, with the select tool); or a tool mode's own
 * toolbar while one of its tools is on (`toolbars`), or the current mode's (`modes`). The mode
 * switcher sits beside it when there's more than one mode. A phone gets `PhoneToolbar` instead,
 * with the tools in its sheet.
 */
export function ModuleToolbar({ children }: ModuleToolbarProps) {
  return (
    <div className="pointer-events-none flex max-w-full items-center gap-2">
      <ToolbarForMode>{children}</ToolbarForMode>
      <ModeSwitcher />
    </div>
  );
}

/** The toolbar the active tool or the current mode calls for, else the main one. */
function ToolbarForMode({ children }: ModuleToolbarProps) {
  const engine = useEngine();
  const phone = useIsPhone();
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

  const selectionActions = showsActions
    ? actions.map(({ id, component: Action }) => <Action key={id} />)
    : null;
  if (phone) {
    return (
      <PhoneToolbar actions={selectionActions}>
        <PhoneToolGrid groups={groups} />
        {children && <div className="grid grid-cols-4 gap-1">{children}</div>}
      </PhoneToolbar>
    );
  }

  return (
    <FloatingPanel
      role="toolbar"
      aria-label={t("tools")}
      aria-orientation="horizontal"
      scrollsOnPhones
    >
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
      {selectionActions && (
        <div className="flex items-center gap-0.5">
          <PanelDivider />
          {selectionActions}
        </div>
      )}
      {children && <PanelDivider />}
      {children}
    </FloatingPanel>
  );
}
