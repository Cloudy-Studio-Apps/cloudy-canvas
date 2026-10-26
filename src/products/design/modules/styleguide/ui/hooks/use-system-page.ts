import { useMemo, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_PAGES, systemPageOf, type SystemPage } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** The design's system page as it changes (`undefined` while the file has no tokens). */
export function useSystemPage(): SystemPage | undefined {
  const engine = useDesignEngine();
  const pages = useService(DESIGN_PAGES);
  const version = useSyncExternalStore(pages.subscribe, pages.getVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- read again when the pages change
  return useMemo(() => systemPageOf(engine.doc), [engine, version]);
}
