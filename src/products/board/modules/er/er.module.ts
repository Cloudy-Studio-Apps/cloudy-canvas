import { Network } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardAgentTools, boardCanvas, boardMigrations } from "../../board-points";
import { ErAggregateKind } from "./aggregate";
import { ErAttributeKind } from "./attribute";
import { ErConstraintKind } from "./constraint";
import { ErEntityKind } from "./entity";
import { erTools } from "./er.agent-tools";
import { ErTool } from "./er.tool";
import { ErIsaKind } from "./isa";
import { ErLinks } from "./links";
import { enterErMode, ER_MODE, ER_MODE_ID } from "./mode";
import {
  migrateErDiagrams,
  prepareErCopies,
  pruneEr,
  resolveErElements,
  splitErDiagrams,
  withErMembers,
} from "./model";
import { ErRelationKind } from "./relation";
import { ErPanel } from "./ui/er-panel";
import { ErModeToolbar } from "./ui/er-mode";
import { ErPalette } from "./ui/er-palette";
import { ErQuickAddMenu } from "./ui/er-quick-add";
import { ErRelationPrompt } from "./ui/er-relation-prompt";

/**
 * ER diagrams: the element kinds, the lines between them, the tool (E), the ER panel and the agent
 * tools, plus the hooks that keep a diagram whole (derived boxes, members, copies, deletions).
 */
export const erModule = defineModule({
  id: "er",
  // A section takes its contents first; then each ER element takes its attributes along.
  after: ["section"],
  register(host) {
    host.contribute(
      boardCanvas.kinds,
      new ErEntityKind(),
      new ErRelationKind(),
      new ErAttributeKind(),
      new ErIsaKind(),
      new ErAggregateKind(),
      new ErConstraintKind(),
    );
    host.contribute(boardCanvas.tools, {
      id: "er",
      create: (ctx) => new ErTool(ctx),
      keys: [{ key: "e" }],
    });
    // The ER mode; entered from the mode switcher, by double-clicking an ER shape or with the
    // panel's Edit diagram.
    host.contribute(boardCanvas.modes, ER_MODE);
    host.contribute(boardCanvas.editElement, enterErMode);
    host.contribute(boardCanvas.links, () => new ErLinks());
    // Aggregation boxes and constraints follow the ER elements they're about.
    host.contribute(boardCanvas.resolveElements, (elements) => resolveErElements(elements));
    // An ER element takes its attributes along, and dragging an aggregation box takes what it holds.
    host.contribute(boardCanvas.withMembers, (ids, elements, purpose) =>
      withErMembers(ids, elements, purpose === "move"),
    );
    // ER elements that belonged to deleted ones go with them, and parts of a diagram the deletion
    // cut off from the rest become diagrams of their own.
    host.contribute(boardCanvas.onRemove, (doc, _removed, before) => {
      pruneEr(doc);
      splitErDiagrams(doc, before);
    });
    // Copies get their own diagrams.
    host.contribute(boardCanvas.prepareCopies, prepareErCopies);
    host.contribute(boardMigrations, { id: "er.diagrams", migrate: migrateErDiagrams });
    host.contribute(boardAgentTools, { id: "er", tools: () => erTools });

    host.contribute(boardEditor.tools, {
      tool: "er",
      element: "er-entity",
      icon: Network,
      toolbar: { group: 1, order: 100 },
      library: { keywords: ["entity", "relation", "chen"] },
    });
    host.contribute(boardEditor.sidePanels, { id: "er.panel", order: 20, component: ErPanel });
    // The element types, to click or drag onto the board while a diagram is being edited.
    host.contribute(boardEditor.overlays, { id: "er.palette", component: ErPalette });
    host.contribute(boardEditor.modes, {
      id: ER_MODE_ID,
      label: "ER diagrams",
      description: "Only ER diagrams can be selected, with their toolbar, palette and panel.",
      icon: Network,
      order: 10,
      toolbar: ErModeToolbar,
    });
    // What to create where a connect dot was dropped on empty board.
    host.contribute(boardEditor.overlays, { id: "er.quickAdd", component: ErQuickAddMenu });
    // What kind of relation a connect dot dropped on another entity makes.
    host.contribute(boardEditor.overlays, { id: "er.relationPrompt", component: ErRelationPrompt });
  },
});
