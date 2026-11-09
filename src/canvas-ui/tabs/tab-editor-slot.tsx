import { useMemo } from "react";

import { cn } from "@shared/ui/lib/utils";
import { ReconnectingBanner } from "../share/reconnecting-banner";
import { TabContext } from "./tab-context";
import type { TabEditorSlotProps } from "./tab-host.types";

/**
 * One tab's editor, filling the window, in its `TabContext`. A tab that isn't on screen stays
 * mounted (its engine and state kept) at the same size, so its camera's viewport stays right, but
 * invisible, inert and out of the pointer's way; its editor suspends the engine
 * (`useSuspendWhenHidden`). A joined live session shows the reconnecting banner over it.
 */
export function TabEditorSlot({ tabs, tab, active, Editor }: TabEditorSlotProps) {
  const context = useMemo(() => ({ tabs, tabId: tab.id }), [tabs, tab.id]);
  return (
    <div
      className={cn("absolute inset-0", !active && "pointer-events-none invisible")}
      aria-hidden={!active}
      inert={!active}
    >
      <TabContext value={context}>
        <Editor tabId={tab.id} />
        {tab.live && <ReconnectingBanner guest={tab.live} />}
      </TabContext>
    </div>
  );
}
