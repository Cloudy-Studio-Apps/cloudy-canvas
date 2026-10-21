import type { AgentTool } from "./agent-tool.types";
import { reportApplied } from "./apply-result";
import { asUndoStep, requireBoard } from "./board-access";
import { stringArg } from "./tool-args";

const NO_ARGS = { type: "object", properties: {} };

export const erTools: AgentTool[] = [
  {
    name: "get_er_text",
    description:
      "The board's ER (Chen notation) diagram as text. Syntax: " +
      "`Entity Name [weak] { attribute [pk, multi, derived, partial] … }` and " +
      "`Relation name [identifying] { Entity (0,n) as role … }`.",
    inputSchema: NO_ARGS,
    run: (host) => requireBoard(host).engine.er.text(),
  },
  {
    name: "apply_er_text",
    description:
      "Replaces the ER diagram with this text as one undo step. Entities, relations and " +
      "attributes matched by name keep their ids and positions; new ones are laid out " +
      "automatically. Read get_er_text first and send the full edited text.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: { text: { type: "string", description: "ER diagram source." } },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const text = stringArg(args, "text");
      return reportApplied(asUndoStep(engine, () => engine.er.applyText(text)));
    },
  },
  {
    name: "relayout_er",
    description: "Lays the whole ER diagram out again (one undo step).",
    inputSchema: NO_ARGS,
    run: (host) => {
      requireBoard(host).engine.er.relayout();
      return "Done.";
    },
  },
];
