import { useLayoutEffect } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_DATA_SOURCES } from "../../model";
import { platformDataServices } from "./data-services";
import { useDataRegistry } from "./use-data-registry";

/**
 * The session hook that hands the data sources the registered types and formats and this
 * device's services while the editor is open (`null` once it closes). A layout effect, so it is
 * set before any panel's effect asks the sources for something.
 */
export function useDataServices(): void {
  const sources = useService(DESIGN_DATA_SOURCES);
  const { types, formats } = useDataRegistry();
  useLayoutEffect(() => {
    sources.setContext({ types, formats, services: platformDataServices });
    return () => sources.setContext(null);
  }, [sources, types, formats]);
}
