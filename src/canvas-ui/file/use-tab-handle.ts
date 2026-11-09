import { useEffect } from "react";

import { tabHandles } from "../tabs/tab-handles";
import type { TabHandle } from "../tabs/tab-handles.types";
import type { TabHandleParts } from "./use-tab-handle.types";

/**
 * Registers the file's handle for its tab (`tabHandles`) while the editor is mounted. `flush` and
 * `finish` also wait for the save running now, so nothing is still being written after them.
 */
export function useTabHandle(
  tabId: string,
  { save, autosave, capture, queue, needsSave }: TabHandleParts,
): void {
  useEffect(() => {
    const settled = async (work: () => Promise<void>) => {
      await work();
      await queue.current;
    };
    const handle: TabHandle = {
      save,
      flush: () => settled(autosave.flush),
      finish: () => settled(autosave.finish),
      closed: autosave.closed,
      capture,
      needsSave,
    };
    return tabHandles.set(tabId, handle);
  }, [tabId, save, autosave, capture, queue, needsSave]);
}
