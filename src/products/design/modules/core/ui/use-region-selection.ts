import { useSyncExternalStore } from "react";

import { REGION_SELECTION } from "../node/region-selection";
import type { RegionTarget } from "../node/region-selection.types";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** The vector areas picked in the vector edit mode, if any (re-renders when they change). */
export function useRegionSelection(): RegionTarget | null {
  const store = useDesignEngine().service(REGION_SELECTION);
  useSyncExternalStore(store.subscribe, store.getVersion);
  return store.target;
}
