import { defineModule } from "@shared/core";
import { designCanvas } from "../../design-points";
import { DataSourceKind } from "./source";
import * as dataApi from ".";
import * as dataUi from "./ui";

/**
 * Data: sources of data (a file, a link, a sheet) a design's layers can be filled from. For now
 * only the source record; the sources, bindings and iterators come in later tasks.
 */
export const dataModule = defineModule({
  id: "data",
  tier: "core",
  requires: ["core", "pages", "frame"],
  uses: ["text", "image", "auto-layout"],
  exports: { ...dataApi, ...dataUi },
  register(host) {
    host.contribute(designCanvas.kinds, new DataSourceKind());
  },
});
