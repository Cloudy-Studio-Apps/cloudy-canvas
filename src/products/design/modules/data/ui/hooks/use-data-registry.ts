import { useMemo } from "react";

import { useEditorModules } from "@canvas-ui";
import { dataFormats, dataSourceTypes } from "../../data.points";
import { dataSourceForms } from "../data.points";
import type { DataRegistry } from "./use-data-registry.types";

/** The source types, formats and settings forms the modules registered (they never change). */
export function useDataRegistry(): DataRegistry {
  const { host } = useEditorModules();
  return useMemo(
    () => ({
      types: [...host.get(dataSourceTypes)],
      formats: [...host.get(dataFormats)],
      forms: [...host.get(dataSourceForms)],
    }),
    [host],
  );
}
