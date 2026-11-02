import { DialogClose } from "@shared/ui/components/ui/dialog";
import { useEngine, useEngineState } from "../../engine-context";
import { ExtensionIconView } from "../extension-icon-view";
import { toolInfo } from "../tool-entries";
import { PhoneToolCell } from "./phone-tool-cell";
import { isQuickTool } from "./quick-tools";
import type { PhoneToolGridProps } from "./phone-toolbar.types";

/** The sheet's tools, in the toolbar's groups, but what the bar always shows. Picking one closes it. */
export function PhoneToolGrid({ groups }: PhoneToolGridProps) {
  const engine = useEngine();
  const activeTool = useEngineState((state) => state.tool);
  return groups.map((group, i) => {
    const entries = group.filter((entry) => !isQuickTool(entry.tool));
    if (entries.length === 0) return null;
    return (
      <div key={group[0]?.toolbar.group ?? i} className="grid grid-cols-4 gap-1">
        {entries.map((entry) => (
          <DialogClose key={entry.tool} asChild>
            <PhoneToolCell
              icon={<ExtensionIconView icon={entry.icon} className="size-5" />}
              label={toolInfo(entry, engine).label}
              active={
                activeTool === entry.tool || !!entry.subTools?.some((sub) => sub.id === activeTool)
              }
              onClick={() => engine.setTool(entry.tool)}
            />
          </DialogClose>
        ))}
      </div>
    );
  });
}
