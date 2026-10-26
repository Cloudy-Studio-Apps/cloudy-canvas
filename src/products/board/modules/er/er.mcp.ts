import { asUndoStep, stringArg } from "@canvas";

import { ER_MODEL } from "./model";
import { reportApplied } from "../../mcp/apply-result";
import { requireBoard } from "../../mcp/board-access";
import type { BoardMcpTool } from "../../mcp/board-mcp.types";
import { diagramArg, ER_DIAGRAM_ARG } from "./er-diagram-arg";

const DIAGRAM_ONLY = { type: "object", properties: { diagram: ER_DIAGRAM_ARG } };

/** ER diagrams, read and written as text (see `docs/er-language.md`). */
export const erTools: BoardMcpTool[] = [
  {
    name: "list_er_diagrams",
    description:
      "The board's ER diagrams. A board can hold several; each has its own text, layout and " +
      "names (two diagrams may both have a `Cliente` entity).",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const diagrams = requireBoard(host).engine.service(ER_MODEL).diagrams();
      return diagrams.map(({ id, name, label, entityCount }) => ({ id, name, label, entityCount }));
    },
  },
  {
    name: "get_er_text",
    description:
      "One ER (Chen notation) diagram as text. Syntax: `Diagram Name [standard: …]` (optional), " +
      "`Entity Name [weak] { attribute [pk, ak, multi, derived, partial] … }`, " +
      "`Relation name [identifying, id, existence, associative] { Entity.joinAttr (0,n) as role … }`, " +
      "`Isa Parent { Child … }`, `Union Category { Superclass … }`, `Aggregate Name { relation }` " +
      "and `Constraint …` (see the app's docs/er-language.md).",
    inputSchema: DIAGRAM_ONLY,
    run: (host, args) =>
      diagramArg(requireBoard(host).engine.service(ER_MODEL), args, false).text(),
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
      const { engine } = requireBoard(host);
      const er = engine.service(ER_MODEL);
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
      const { engine } = requireBoard(host);
      const er = engine.service(ER_MODEL);
      const diagram = diagramArg(er, args, false);
      asUndoStep(engine.doc, () => diagram.relayout());
      return "Done.";
    },
  },
  {
    name: "check_er_diagram",
    description:
      "Checks one ER diagram against the rules of the ER model and of the standard it follows " +
      "(its `Diagram [standard: …]`): missing keys, weak entities without an identifying " +
      "relation or partial key, relations with one side, hierarchies with one child, and " +
      "constructs the standard doesn't have. Errors come first; each names the shape to fix.",
    inputSchema: DIAGRAM_ONLY,
    run: (host, args) => {
      const er = requireBoard(host).engine.service(ER_MODEL);
      return diagramArg(er, args, false)
        .check()
        .map(({ severity, rule, message, shapeId }) => ({ severity, rule, message, shapeId }));
    },
  },
  {
    name: "er_to_tables",
    description:
      "Turns one ER diagram into database tables on the board (DBML, one undo step): entities " +
      "become tables keyed by their keys, multivalued attributes and many-to-many or larger " +
      "relations their own tables, the other relations foreign keys (to the join attribute when " +
      "a participant names one), weak entities are keyed by their owner. Tables with the same " +
      "names are updated. Pass `preview: true` to get the DBML without writing it.",
    inputSchema: {
      type: "object",
      properties: {
        diagram: ER_DIAGRAM_ARG,
        hierarchies: {
          type: "string",
          enum: ["per-entity", "single"],
          description:
            "How hierarchies become tables: a table per entity, children keyed by the parent " +
            "(default), or one table with every column and a discriminator.",
        },
        preview: { type: "boolean", description: "Only return the DBML." },
      },
    },
    run: (host, args) => {
      const er = requireBoard(host).engine.service(ER_MODEL);
      const diagram = diagramArg(er, args, false);
      const strategy = args.hierarchies === "single" ? "single" : "per-entity";
      const hierarchies = Object.fromEntries(
        diagram.shapes().isas.map((isa) => [isa.id, strategy] as const),
      );
      if (args.preview === true) return diagram.tablesPreview({ hierarchies });
      const { dbml, tables, warnings, applied } = diagram.createTables({ hierarchies });
      if (!applied.ok) throw new Error(applied.error.message);
      return { tables, warnings, dbml };
    },
  },
  {
    name: "convert_relation_to_entity",
    description:
      "Replaces an ER relation (two sides or more, not held by an aggregation) with an entity " +
      "named after it and a two-way relation per side: each side keeps its cardinality, the new " +
      "entity's side is (1,1), and the relation's attributes move to the entity. One undo step; " +
      "returns the new entity's id.",
    inputSchema: {
      type: "object",
      required: ["relation"],
      properties: { relation: { type: "string", description: "The relation's id." } },
    },
    run: (host, args) => {
      const er = requireBoard(host).engine.service(ER_MODEL);
      const id = stringArg(args, "relation");
      const diagram = er.diagramOf(id);
      if (!diagram) throw new Error(`No ER relation has the id "${id}".`);
      const entity = er.diagram(diagram).edits.convertToEntity(id);
      if (!entity)
        throw new Error(
          "That relation can't be converted (it needs two sides and no aggregation).",
        );
      return { entity };
    },
  },
];
