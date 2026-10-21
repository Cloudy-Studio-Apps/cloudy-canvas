import { asUndoStep, stringArg } from "@canvas";

import { reportApplied } from "./apply-result";
import { requireBoard } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";
import { diagramArg, ER_DIAGRAM_ARG } from "./er-diagram-arg";

const DIAGRAM_ONLY = { type: "object", properties: { diagram: ER_DIAGRAM_ARG } };

/** ER diagrams, read and written as text (see `docs/er-language.md`). */
export const erTools: BoardAgentTool[] = [
  {
    name: "list_er_diagrams",
    description:
      "The board's ER diagrams. A board can hold several; each has its own text, layout and " +
      "names (two diagrams may both have a `Cliente` entity).",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const diagrams = requireBoard(host).er.diagrams();
      return diagrams.map(({ id, name, label, entityCount }) => ({ id, name, label, entityCount }));
    },
  },
  {
    name: "get_er_text",
    description:
      "One ER (Chen notation) diagram as text. Syntax: `Diagram Name` (optional), " +
      "`Entity Name [weak] { attribute [pk, multi, derived, partial] … }` and " +
      "`Relation name [identifying] { Entity (0,n) as role … }`.",
    inputSchema: DIAGRAM_ONLY,
    run: (host, args) => diagramArg(requireBoard(host).er, args, false).text(),
  },
  {
    name: "apply_er_text",
    description:
      "Replaces one ER diagram with this text as one undo step. Entities, relations and " +
      "attributes matched by name keep their ids and positions; new ones are laid out " +
      "automatically. Entities a relation names but nothing defines are created. Read " +
      "get_er_text first and send the full edited text. Pass `new: true` to start a separate " +
      "diagram instead.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string", description: "ER diagram source." },
        diagram: ER_DIAGRAM_ARG,
        new: { type: "boolean", description: "Create a new diagram from the text." },
      },
    },
    run: (host, args) => {
      const { engine, er } = requireBoard(host);
      const text = stringArg(args, "text");
      const diagram = diagramArg(er, args, true);
      return reportApplied(
        asUndoStep(engine.doc, () => diagram.applyText(text, { createMissing: true })),
      );
    },
  },
  {
    name: "relayout_er",
    description: "Lays one ER diagram out again (one undo step).",
    inputSchema: DIAGRAM_ONLY,
    run: (host, args) => {
      const { engine, er } = requireBoard(host);
      const diagram = diagramArg(er, args, false);
      asUndoStep(engine.doc, () => diagram.relayout());
      return "Done.";
    },
  },
];
