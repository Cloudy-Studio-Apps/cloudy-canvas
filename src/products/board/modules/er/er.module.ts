import { defineModule } from "@shared/core";
import { boardEditor, registerBoardMode } from "@board/ui/modules";
import { boardCanvas, boardMcpTools, boardMigrations } from "../../board-points";
import { BUILT_IN_ER_CONSTRUCTS, BUILT_IN_ER_STANDARDS, erConstructs, erStandards } from "./base";
import { registerErCanvas } from "./er.canvas";
import { registerErCommands } from "./er.commands";
import { erTools } from "./er.mcp";
import { erMode } from "./er.mode";
import { boardErConstructs, boardErStandards } from "./er.points";
import { registerErSections } from "./er.sections";
import { enterErMode } from "./mode";
import { migrateErDiagrams } from "./model";
import { ErPalette } from "./ui/er-palette";
import * as erApi from ".";

/**
 * ER diagrams: the element kinds, the lines between them, the tool (E) and the hooks that keep a
 * diagram whole (derived boxes, members, copies, deletions) in `er.canvas.ts`; the ER mode in
 * `er.mode.ts` (one `defineBoardMode` object) and its palette; commands in `er.commands.ts`; the ER panel, menus and dialogs in
 * `er.sections.ts`; the standards, migrations and agent tools here.
 */
export const erModule = defineModule({
  id: "er",
  tier: "feature",
  // Uses db's DBML language and tables and geo's ellipse; `uses`, not `requires`, because
  // connectors are `after` er and db and geo come after connectors.
  uses: ["db", "geo"],
  // A section takes its contents first; then each ER element takes its attributes along.
  after: ["section"],
  exports: { ...erApi },
  register(host) {
    // The standards diagrams follow: the built-ins here, plugins' next to them. Read once the
    // modules have loaded, so every module's count.
    host.contribute(boardErStandards, ...BUILT_IN_ER_STANDARDS);
    erStandards.useSource(() => host.get(boardErStandards));
    // What standards may forbid: the built-ins here, plugins' next to them.
    host.contribute(boardErConstructs, ...BUILT_IN_ER_CONSTRUCTS);
    erConstructs.useSource(() => host.get(boardErConstructs));
    registerErCanvas(host);
    registerBoardMode(host, erMode);
    // Double-clicking an ER shape (or Enter) enters the ER mode.
    host.contribute(boardCanvas.editElement, enterErMode);
    // The element types, to click or drag onto the board while a diagram is being edited (in the
    // ER mode, or with an ER shape selected or the ER tool on): not one of the mode's overlays.
    host.contribute(boardEditor.overlays, { id: "er.palette", component: ErPalette });
    registerErCommands(host);
    registerErSections(host);
    host.contribute(boardMigrations, { id: "er.diagrams", migrate: migrateErDiagrams });
    host.contribute(boardMcpTools, { id: "er", tools: () => erTools });
  },
});
