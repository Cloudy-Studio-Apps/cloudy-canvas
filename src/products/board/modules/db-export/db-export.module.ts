import { defineModule } from "@shared/core";
import { BUILT_IN_CODE_TARGETS, codeTargets } from "./targets";
import { registerDbExportCommands } from "./db-export.commands";
import { boardCodeTargets } from "./db-export.points";
import { registerDbExportSections } from "./db-export.sections";
import * as dbExportApi from ".";
import * as dbExportUi from "./ui";

/**
 * Database schema code export: the targets (frameworks and their versions), the Export code
 * command in `db-export.commands.ts` and its dialog, menu item and panel button in
 * `db-export.sections.ts`.
 */
export const dbExportModule = defineModule({
  id: "db-export",
  tier: "feature",
  requires: ["db"],
  exports: { ...dbExportApi, ...dbExportUi },
  register(host) {
    // The frameworks the schema exports to: the built-ins here, plugins' next to them.
    host.contribute(boardCodeTargets, ...BUILT_IN_CODE_TARGETS);
    codeTargets.useSource(() => host.get(boardCodeTargets));
    registerDbExportCommands(host);
    registerDbExportSections(host);
  },
});
