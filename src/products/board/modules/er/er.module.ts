import { defineModule } from "@shared/core";
import { boardMcpTools, boardMigrations } from "../../board-points";
import { BUILT_IN_ER_CONSTRUCTS, BUILT_IN_ER_STANDARDS, erConstructs, erStandards } from "./base";
import { registerErCanvas } from "./er.canvas";
import { registerErCommands } from "./er.commands";
import { erTools } from "./er.mcp";
import { registerErMode } from "./er.mode";
import { boardErConstructs, boardErStandards } from "./er.points";
import { registerErSections } from "./er.sections";
import { migrateErDiagrams } from "./model";

/**
 * ER diagrams: the element kinds, the lines between them, the tool (E) and the hooks that keep a
 * diagram whole (derived boxes, members, copies, deletions) in `er.canvas.ts`; the ER mode in
 * `er.mode.ts`; commands in `er.commands.ts`; the ER panel, menus and dialogs in
 * `er.sections.ts`; the standards, migrations and agent tools here.
 */
export const erModule = defineModule({
  id: "er",
  // A section takes its contents first; then each ER element takes its attributes along.
  after: ["section"],
  register(host) {
    // The standards diagrams follow: the built-ins here, plugins' next to them. Read once the
    // modules have loaded, so every module's count.
    host.contribute(boardErStandards, ...BUILT_IN_ER_STANDARDS);
    erStandards.useSource(() => host.get(boardErStandards));
    // What standards may forbid: the built-ins here, plugins' next to them.
    host.contribute(boardErConstructs, ...BUILT_IN_ER_CONSTRUCTS);
    erConstructs.useSource(() => host.get(boardErConstructs));
    registerErCanvas(host);
    registerErMode(host);
    registerErCommands(host);
    registerErSections(host);
    host.contribute(boardMigrations, { id: "er.diagrams", migrate: migrateErDiagrams });
    host.contribute(boardMcpTools, { id: "er", tools: () => erTools });
  },
});
