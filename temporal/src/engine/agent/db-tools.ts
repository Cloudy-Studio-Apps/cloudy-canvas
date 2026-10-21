import type { CanvasEngine } from "../canvas-engine";
import type { DbTableShape } from "../document";
import type { AgentTool } from "./agent-tool.types";
import { reportApplied } from "./apply-result";
import { asUndoStep, requireBoard } from "./board-access";
import { stringArg } from "./tool-args";

const NO_ARGS = { type: "object", properties: {} };
const TEXT = { type: "string", description: "DBML source." };
const TABLE = { type: "string", description: "Table id or name." };

export const dbTools: AgentTool[] = [
  {
    name: "get_schema_dbml",
    description:
      "The board's database schema (every table, enum, relation, index and DBML sticky note) as DBML.",
    inputSchema: NO_ARGS,
    run: (host) => requireBoard(host).engine.db.schemaDbml(),
  },
  {
    name: "apply_schema_dbml",
    description:
      "Replaces the whole schema with this DBML as one undo step: tables and enums missing from " +
      "the text are removed, new ones are placed on the board, and those matched by name keep " +
      "their ids and positions. Tables named by refs but not defined are created. Read " +
      "get_schema_dbml first and send the full edited text.",
    inputSchema: { type: "object", required: ["dbml"], properties: { dbml: TEXT } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const dbml = stringArg(args, "dbml");
      return reportApplied(
        asUndoStep(engine, () => engine.db.applySchemaDbml(dbml, { createMissingTables: true })),
      );
    },
  },
  {
    name: "import_schema_dbml",
    description:
      "Merges DBML into the schema as one undo step: tables and enums are added or updated by " +
      "name and nothing else is removed.",
    inputSchema: { type: "object", required: ["dbml"], properties: { dbml: TEXT } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const dbml = stringArg(args, "dbml");
      return reportApplied(asUndoStep(engine, () => engine.db.importSchemaDbml(dbml)));
    },
  },
  {
    name: "get_table_dbml",
    description: "One table as DBML.",
    inputSchema: { type: "object", required: ["table"], properties: { table: TABLE } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      return engine.db.tableDbml(findTable(engine, stringArg(args, "table")).id);
    },
  },
  {
    name: "apply_table_dbml",
    description:
      "Replaces one table with this DBML (a single Table block) as one undo step; columns matched " +
      "by name keep their ids, so relations survive.",
    inputSchema: {
      type: "object",
      required: ["table", "dbml"],
      properties: { table: TABLE, dbml: TEXT },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const table = findTable(engine, stringArg(args, "table"));
      const dbml = stringArg(args, "dbml");
      return reportApplied(
        asUndoStep(engine, () =>
          engine.db.applyTableDbml(table.id, dbml, { createMissingTables: true }),
        ),
      );
    },
  },
];

function findTable(engine: CanvasEngine, ref: string): DbTableShape {
  const table = engine.db.table(ref) ?? engine.db.tables().find((t) => t.name === ref);
  if (!table) throw new Error(`No table with id or name "${ref}".`);
  return table;
}
