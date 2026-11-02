import { useState } from "react";
import { LayoutGrid } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { FloatingPanel, PanelDivider } from "../../components/floating-panel";
import { ToolButton } from "../../components/tool-button";
import { useEngine, useEngineState } from "../../engine-context";
import { useOptionalEditorPoint } from "../editor-modules-context";
import { ExtensionIconView } from "../extension-icon-view";
import { toolInfo } from "../tool-entries";
import { t } from "../modules.i18n";
import { isQuickTool, QUICK_TOOLS } from "./quick-tools";
import type { PhoneToolbarProps } from "./phone-toolbar.types";

/**
 * The toolbar on a phone: select, hand, the tool used last and a button for the sheet, which holds
 * every other tool (what the main toolbar or the mode's would show). So tools added by modules and
 * plugins never make the bar longer. Any tool getting picked closes the sheet.
 */
export function PhoneToolbar({ children, actions, trailing }: PhoneToolbarProps) {
  const engine = useEngine();
  const activeTool = useEngineState((state) => state.tool);
  const tools = useOptionalEditorPoint((points) => points.tools);
  const [open, setOpen] = useState(false);
  const [seenTool, setSeenTool] = useState(activeTool);
  const [lastTool, setLastTool] = useState<string | null>(null);

  const activeEntry = tools.find(
    (entry) => entry.tool === activeTool || entry.subTools?.some((sub) => sub.id === activeTool),
  );
  if (activeTool !== seenTool) {
    setSeenTool(activeTool);
    setOpen(false);
    if (activeEntry && !isQuickTool(activeEntry.tool)) setLastTool(activeEntry.tool);
  }

  const shown = [...QUICK_TOOLS, ...(lastTool ? [lastTool] : [])];
  return (
    <>
      <FloatingPanel role="toolbar" aria-label={t("tools")} scrollsOnPhones>
        {shown.map((tool) => {
          const entry = tools.find((candidate) => candidate.tool === tool);
          if (!entry) return null;
          return (
            <ToolButton
              key={tool}
              label={toolInfo(entry, engine).label}
              active={entry === activeEntry}
              onClick={() => engine.setTool(tool)}
            >
              <ExtensionIconView icon={entry.icon} />
            </ToolButton>
          );
        })}
        <PanelDivider />
        <ToolButton label={t("allTools")} active={open} onClick={() => setOpen(true)}>
          <LayoutGrid />
        </ToolButton>
        {actions && (
          <>
            <PanelDivider />
            {actions}
          </>
        )}
        {trailing && (
          <>
            <PanelDivider />
            {trailing}
          </>
        )}
      </FloatingPanel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-auto bottom-0 left-0 max-h-[70dvh] max-w-full translate-x-0 translate-y-0 gap-3 overflow-y-auto rounded-b-none border-x-0 border-b-0 p-4 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4">
          <DialogTitle className="pr-8 text-sm font-medium">{t("allTools")}</DialogTitle>
          <DialogDescription className="sr-only">{t("allToolsHint")}</DialogDescription>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
