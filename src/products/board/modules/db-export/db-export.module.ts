import { defineModule } from "@shared/core";
import { BUILT_IN_CODE_TARGETS, codeTargets } from "./targets";
import { boardCodeTargets } from "./db-export.points";
import * as dbExportApi from ".";

/** Database schema code export: the targets (frameworks and their versions). */
export const dbExportModule = defineModule({
  id: "db-export",
  tier: "feature",
  requires: ["db"],
  exports: { ...dbExportApi },
  register(host) {
    // The frameworks the schema exports to: the built-ins here, plugins' next to them.
    host.contribute(boardCodeTargets, ...BUILT_IN_CODE_TARGETS);
    codeTargets.useSource(() => host.get(boardCodeTargets));
  },
});
