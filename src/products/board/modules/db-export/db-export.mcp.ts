import {
  optionalChoice,
  optionalRecord,
  optionalString,
  stringArg,
  stringList,
  type ToolArgs,
} from "@canvas";

import { DB_SCHEMA, type DbSchema } from "../db";
import { requireBoard } from "../../mcp/board-access";
import type { BoardMcpTool } from "../../mcp/board-mcp.types";
import {
  codeTargets,
  exportCode,
  type CodeOptionValue,
  type CodeTargetDefinition,
} from "./targets";

const NO_ARGS = { type: "object", properties: {} };

/** The database schema as framework code (read-only: nothing on the board changes). */
export const dbExportTools: BoardMcpTool[] = [
  {
    name: "list_code_targets",
    description:
      "The frameworks the database schema exports to as code (export_schema_code): each target's " +
      "id, its versions (profiles, newest first) and its options with their defaults.",
    inputSchema: NO_ARGS,
    run: () => ({
      targets: codeTargets.list().map((target) => ({
        id: target.id,
        label: target.label,
        profiles: target.profiles.map(({ id, label }) => ({ id, label })),
        options: target.options.map((option) => ({
          id: option.id,
          kind: option.kind,
          default: option.default,
          ...(option.kind === "select" ? { choices: option.choices.map((c) => c.value) } : {}),
        })),
      })),
    }),
  },
  {
    name: "export_schema_code",
    description:
      "The board's database schema as a framework's files (models, migrations, entities, DDL), " +
      "returned as { files: [{ path, content, language }], warnings }; nothing is written. " +
      "mode single returns one table's model (tables must name exactly one), project the " +
      "framework's whole structure for the named tables or, without tables, the whole schema. " +
      "Warnings are ids with params (what the target couldn't express). See list_code_targets.",
    inputSchema: {
      type: "object",
      required: ["target"],
      properties: {
        target: { type: "string", description: "Target id, e.g. laravel, postgres." },
        version: { type: "string", description: "Profile id; the newest when omitted." },
        options: { type: "object", description: "The target's options by id." },
        tables: {
          type: "array",
          items: { type: "string" },
          description: "Table or enum names; the whole schema when omitted.",
        },
        mode: {
          type: "string",
          enum: ["single", "project"],
          description: "single when exactly one table is named and mode is omitted.",
        },
      },
    },
    run: (host, args) => {
      const schema = requireBoard(host).engine.service(DB_SCHEMA);
      const target = targetArg(args);
      const version = optionalString(args, "version");
      if (version !== undefined && !target.profiles.some((p) => p.id === version)) {
        throw new Error(
          `Unknown version "${version}" for ${target.id}; use one of: ` +
            `${target.profiles.map((p) => p.id).join(", ")}.`,
        );
      }
      const options = optionsArg(args, target);
      const ids =
        args.tables === undefined ? undefined : namedIds(schema, stringList(args, "tables"));
      const mode = optionalChoice(args, "mode", ["single", "project"] as const);
      const singleTable = ids?.length === 1 ? schema.table(ids[0] ?? "") : undefined;
      const single = mode === "single" || (mode === undefined && singleTable !== undefined);
      if (single && !singleTable)
        throw new Error('mode "single" needs exactly one table in "tables".');
      const output = exportCode(schema, target, {
        ...(single && singleTable ? { table: singleTable.id } : ids ? { ids } : {}),
        ...(version !== undefined ? { profile: version } : {}),
        options,
        now: new Date(),
      });
      return output;
    },
  },
];

function targetArg(args: ToolArgs): CodeTargetDefinition {
  const id = stringArg(args, "target");
  const target = codeTargets.get(id);
  if (!target) {
    throw new Error(
      `Unknown target "${id}"; use one of: ${codeTargets
        .list()
        .map((t) => t.id)
        .join(", ")}.`,
    );
  }
  return target;
}

function optionsArg(args: ToolArgs, target: CodeTargetDefinition): Record<string, CodeOptionValue> {
  const given = optionalRecord(args, "options") ?? {};
  const options: Record<string, CodeOptionValue> = {};
  for (const [id, value] of Object.entries(given)) {
    const option = target.options.find((o) => o.id === id);
    if (!option) {
      throw new Error(
        `Unknown option "${id}" for ${target.id}; it has: ` +
          `${target.options.map((o) => o.id).join(", ") || "none"}.`,
      );
    }
    if (option.kind === "switch" && typeof value !== "boolean") {
      throw new Error(`Option "${id}" must be true or false.`);
    }
    if (option.kind === "select" && !option.choices.some((c) => c.value === value)) {
      throw new Error(
        `Option "${id}" must be one of: ${option.choices.map((c) => c.value).join(", ")}.`,
      );
    }
    options[id] = value as CodeOptionValue;
  }
  return options;
}

function namedIds(schema: DbSchema, names: readonly string[]): string[] {
  const cards = [...schema.tables(), ...schema.enums()];
  return names.map((name) => {
    const card = cards.find((c) => c.name === name) ?? cards.find((c) => c.id === name);
    if (!card) throw new Error(`No table or enum named "${name}".`);
    return card.id;
  });
}
