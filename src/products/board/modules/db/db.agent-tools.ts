import { asUndoStep, stringArg } from "@canvas";

import { DB_SCHEMA, type DbSchema } from "./schema";
import type { DbTableElement } from "./table";
import { reportApplied } from "../../agent/apply-result";
import { requireBoard } from "../../agent/board-access";
import type { BoardAgentTool } from "../../agent/board-agent.types";

const NO_ARGS = { type: "object", properties: {} };
const TEXT = { type: "string", description: "DBML source." };
const TABLE = { type: "string", description: "Table id or name." };

/** The database schema, read and written as DBML. */
export const dbTools: BoardAgentTool[] = [
  {
    name: "get_schema_dbml",
    description:
      "The board's database schema (every table, enum, relation, index and DBML sticky note) as DBML.",
    inputSchema: NO_ARGS,
    run: (host) => requireBoard(host).engine.service(DB_SCHEMA).schemaDbml(),
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
      const schema = engine.service(DB_SCHEMA);
      const dbml = stringArg(args, "dbml");
      return reportApplied(
        asUndoStep(engine.doc, () => schema.applySchemaDbml(dbml, { createMissingTables: true })),
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
      const schema = engine.service(DB_SCHEMA);
      const dbml = stringArg(args, "dbml");
      return reportApplied(asUndoStep(engine.doc, () => schema.importSchemaDbml(dbml)));
    },
  },
  {
    name: "tidy_schema",
    description:
      "Lays the schema's tables and enums out again (one undo step): each group of linked cards " +
      "in columns that read left to right with few crossings. With a table, only that table and " +
      "the cards linked to it move.",
    inputSchema: { type: "object", properties: { table: TABLE } },
    run: (host, args) => {
      const schema = requireBoard(host).engine.service(DB_SCHEMA);
      const table = typeof args.table === "string" ? findTable(schema, args.table) : null;
      schema.tidy(table ? schema.connectedTo(table.id) : undefined);
      return "Done.";
    },
  },
  {
    name: "get_table_dbml",
    description: "One table as DBML.",
    inputSchema: { type: "object", required: ["table"], properties: { table: TABLE } },
    run: (host, args) => {
      const schema = requireBoard(host).engine.service(DB_SCHEMA);
      return schema.tableDbml(findTable(schema, stringArg(args, "table")).id);
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
      const schema = engine.service(DB_SCHEMA);
      const table = findTable(schema, stringArg(args, "table"));
      const dbml = stringArg(args, "dbml");
      return reportApplied(
        asUndoStep(engine.doc, () =>
          schema.applyTableDbml(table.id, dbml, { createMissingTables: true }),
        ),
      );
    },
  },
];

function findTable(schema: DbSchema, ref: string): DbTableElement {
  const table = schema.table(ref) ?? schema.tables().find((t) => t.name === ref);
  if (!table) throw new Error(`No table with id or name "${ref}".`);
  return table;
}
