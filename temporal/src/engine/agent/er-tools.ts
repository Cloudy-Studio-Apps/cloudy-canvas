import type { AgentTool } from "./agent-tool.types";
import { reportApplied } from "./apply-result";
import { asUndoStep, requireBoard } from "./board-access";
import { diagramArg, ER_DIAGRAM_ARG } from "./er-diagram-arg";
import { stringArg } from "./tool-args";

const DIAGRAM_ONLY = { type: "object", properties: { diagram: ER_DIAGRAM_ARG } };

export const erTools: AgentTool[] = [
  {
    name: "list_er_diagrams",
    description:
      "The board's ER diagrams. A board can hold several; each has its own text, layout and " +
      "names (two diagrams may both have a `Cliente` entity).",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const diagrams = requireBoard(host).engine.er.diagrams();
      if (diagrams.length === 0) return "The board has no ER diagrams.";
      return JSON.stringify(
        diagrams.map(({ id, name, label, entityCount }) => ({ id, name, label, entityCount })),
      );
    },
  },
  {
    name: "get_er_text",
    description:
      "One ER (Chen notation) diagram as text. Syntax: `Diagram Name` (optional), " +
      "`Entity Name [weak] { attribute [pk, multi, derived, partial] … }` and " +
      "`Relation name [identifying] { Entity (0,n) as role … }`.",
    inputSchema: DIAGRAM_ONLY,
    run: (host, args) => diagramArg(requireBoard(host).engine.er, args, false).text(),
  },
  {
    name: "apply_er_text",
    description:
      "Replaces one ER diagram with this text as one undo step. Entities, relations and " +
      "attributes matched by name keep their ids and positions; new ones are laid out " +
      "automatically. Read get_er_text first and send the full edited text. Pass `new: true` " +
      "to start a separate diagram instead.",
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
      const { engine } = requireBoard(host);
      const text = stringArg(args, "text");
      const diagram = diagramArg(engine.er, args, true);
      return reportApplied(asUndoStep(engine, () => diagram.applyText(text)));
    },
  },
  {
    name: "relayout_er",
    description: "Lays one ER diagram out again (one undo step).",
    inputSchema: DIAGRAM_ONLY,
    run: (host, args) => {
      diagramArg(requireBoard(host).engine.er, args, false).relayout();
      return "Done.";
    },
  },
];
