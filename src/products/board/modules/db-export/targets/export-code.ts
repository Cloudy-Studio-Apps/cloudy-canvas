import { toCodeSchema, type SchemaSource } from "../model";
import type { CodeOptionValue, CodeOutput, CodeTargetDefinition } from "./code-target.types";
import type { ExportCodeRequest } from "./export-code.types";

/**
 * Runs a target on the board's schema: what the dialog and the agent tools call. Single mode reads
 * the whole schema (so the table's relations and enums resolve) and keeps only warnings about that
 * table; project mode exports the tables with `ids`, or all of them.
 */
export function exportCode(
  source: SchemaSource,
  target: CodeTargetDefinition,
  request: ExportCodeRequest,
): CodeOutput {
  const single = request.table !== undefined;
  const { schema, warnings } = toCodeSchema(source, single ? undefined : request.ids);
  const tableName = single ? source.tables().find((t) => t.id === request.table)?.name : undefined;
  const profile = target.profiles.find((p) => p.id === request.profile) ??
    target.profiles[0] ?? {
      id: "",
      label: target.label,
      flags: {},
    };
  const options: Record<string, CodeOptionValue> = {};
  for (const option of target.options) {
    options[option.id] = request.options?.[option.id] ?? option.default;
  }
  const output = target.generate(schema, {
    mode: single ? "single" : "project",
    table: tableName ?? null,
    profile,
    options,
    now: request.now,
  });
  const all = [...warnings, ...output.warnings];
  return {
    files: output.files,
    warnings: single ? all.filter((w) => w.table === undefined || w.table === tableName) : all,
  };
}
