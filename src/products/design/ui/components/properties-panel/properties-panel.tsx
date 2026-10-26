import { PanelRightClose } from "lucide-react";

import {
  HistoryControls,
  ShareButton,
  ToolButton,
  useEditorModules,
  useEngineState,
  ZoomMenu,
} from "@canvas-ui";
import { CollaboratorStack } from "@shared/collaborators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { DESIGN_LAYOUT } from "../../design-layout";
import { designEditor } from "../../modules";
import { useDesignPanelStore } from "../../stores/design-panel-store";
import { PropertySections } from "./property-sections";

/**
 * The right panel: history, collaborators, sharing and the button that hides it, then the
 * Design/Prototype tabs and the zoom, or the active tool's sidebar (`toolSidebars`), or the current
 * mode's (`modeSidebars`). Export is in the main menu's File, the context menus and its section.
 */
export function PropertiesPanel() {
  const tab = useDesignPanelStore((state) => state.propertiesTab);
  const setTab = useDesignPanelStore((state) => state.setPropertiesTab);
  const setOpen = useDesignPanelStore((state) => state.setRightOpen);
  const { host } = useEditorModules();
  const tool = useEngineState((state) => state.tool);
  const mode = useEngineState((state) => state.mode);
  // The active tool's sidebar (e.g. the frame presets) replaces the sections while it's on, and
  // a mode's (e.g. the Catalog's brochure) while the mode is.
  const ToolSidebar =
    host.find(designEditor.toolSidebars, tool)?.component ??
    host.find(designEditor.modeSidebars, mode)?.component;

  return (
    <aside
      aria-label="Properties"
      className="flex shrink-0 flex-col border-l bg-surface"
      style={{ width: DESIGN_LAYOUT.rightPanel }}
    >
      <header className="flex h-12 items-center gap-0.5 border-b px-2">
        <HistoryControls />
        <CollaboratorStack followable className="ml-0.5" />
        <div className="flex-1" />
        <ShareButton product="design" look="button" />
        <ToolButton label="Hide properties panel" side="bottom" onClick={() => setOpen(false)}>
          <PanelRightClose />
        </ToolButton>
      </header>

      {/* Every scroll area ends in 300px of room, so the last controls scroll clear of the
          toolbar and mode switcher floating over the canvas's bottom edge. */}
      {ToolSidebar ? (
        <div className="min-h-0 flex-1 overflow-y-auto pb-75">
          <ToolSidebar />
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value === "prototype" ? "prototype" : "design")}
          className="min-h-0 flex-1 gap-0"
        >
          <div className="flex h-11 shrink-0 items-center justify-between border-b px-2">
            <TabsList className="h-7">
              <TabsTrigger value="design" className="px-2.5 text-xs">
                Design
              </TabsTrigger>
              <TabsTrigger value="prototype" className="px-2.5 text-xs">
                Prototype
              </TabsTrigger>
            </TabsList>
            <ZoomMenu side="bottom" />
          </div>
          <TabsContent value="design" className="min-h-0 overflow-y-auto pb-75">
            <PropertySections tab="design" />
          </TabsContent>
          <TabsContent value="prototype" className="min-h-0 overflow-y-auto pb-75">
            <PropertySections tab="prototype" />
          </TabsContent>
        </Tabs>
      )}
    </aside>
  );
}
