import { PanelRightClose } from "lucide-react";

import {
  HistoryControls,
  ShareButton,
  ToolButton,
  useEditorModules,
  useEngineState,
  ZoomMenu,
} from "@canvas-ui";
import { DESIGN_LAYOUT } from "../../design-layout";
import { designEditor } from "../../modules";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import { PropertySections } from "./property-sections";
import { t } from "../../design-ui.i18n";

/**
 * The right panel: history, sharing and the button that hides it, then a
 * row with the zoom and the sections, or the active tool's sidebar (`toolSidebars`), or the current
 * mode's (`modePanels`). Export is in the main menu's File, the context menus and its section.
 */
export function PropertiesPanel() {
  const setOpen = useDesignPanelStore((state) => state.setRightOpen);
  const { host } = useEditorModules();
  const tool = useEngineState((state) => state.tool);
  const mode = useEngineState((state) => state.mode);
  // The active tool's sidebar (e.g. the frame presets) replaces the sections while it's on, and
  // a mode's (e.g. the Catalog's brochure, with any sections it keeps) while the mode is.
  const ToolSidebar = host.find(designEditor.toolSidebars, tool)?.component;
  const panel = ToolSidebar ? undefined : host.find(designEditor.modePanels, mode);
  const ModeSidebar = panel?.sidebar;

  return (
    <aside
      aria-label={t("properties.label")}
      className="flex shrink-0 flex-col border-l bg-surface"
      style={{ width: DESIGN_LAYOUT.rightPanel }}
    >
      <header className="flex h-12 items-center gap-0.5 border-b px-2">
        <HistoryControls />
        <div className="flex-1" />
        <ShareButton product="design" look="button" />
        <ToolButton label={t("properties.hide")} side="bottom" onClick={() => setOpen(false)}>
          <PanelRightClose />
        </ToolButton>
      </header>

      {/* Every scroll area ends in 300px of room, so the last controls scroll clear of the
          toolbar and mode switcher floating over the canvas's bottom edge. */}
      {ToolSidebar ? (
        <div className="min-h-0 flex-1 overflow-y-auto pb-75">
          <ToolSidebar />
        </div>
      ) : ModeSidebar ? (
        <div className="min-h-0 flex-1 overflow-y-auto pb-75">
          <ModeSidebar />
          {panel.keepSections && <PropertySections only={panel.keepSections} />}
        </div>
      ) : (
        <>
          <div className="flex h-11 shrink-0 items-center justify-end border-b px-2">
            <ZoomMenu side="bottom" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-75">
            <PropertySections />
          </div>
        </>
      )}
    </aside>
  );
}
