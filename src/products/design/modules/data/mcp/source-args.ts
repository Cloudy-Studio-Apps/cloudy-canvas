import { optionalString, type ToolArgs } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_DATA_SOURCES } from "../model";
import type { SettingSpec } from "../settings";
import type { DataSourceElement, SettingValue } from "../source";
import type { DataSourceType } from "../data.points.types";

/** The JSON schema of the `source` argument every source tool takes. */
export const SOURCE_SCHEMA = {
  type: "string",
  description: "The data source's id (data_sources_list, or data_source_add for a new one).",
};

/** The data source an agent named (`source`, an id). */
export function readSource(engine: DesignWorkspace, args: ToolArgs): DataSourceElement {
  const id = optionalString(args, "source");
  const source = id === undefined ? undefined : engine.service(DESIGN_DATA_SOURCES).get(id);
  if (!source) throw new Error(`No data source ${id ?? ""}. Call data_sources_list.`);
  return source;
}

/** The registered source type an agent named, or an error listing the ones there are. */
export function requireType(types: DataSourceType[], id: string): DataSourceType {
  const type = types.find((t) => t.id === id);
  if (!type) {
    const known = types.map((t) => t.id).join(", ") || "none (no editor is open)";
    throw new Error(`Unknown source type "${id}". Use one of: ${known}.`);
  }
  return type;
}

/** `format` is `"auto"` or the id of a registered format. */
export function checkFormat(formats: { id: string }[], format: string): void {
  if (format === "auto" || formats.some((f) => f.id === format)) return;
  const known = ["auto", ...formats.map((f) => f.id)].join(", ");
  throw new Error(`Unknown format "${format}". Use one of: ${known}.`);
}

function isSettingValue(value: unknown): value is SettingValue {
  if (value === null) return true;
  if (["string", "number", "boolean"].includes(typeof value)) return true;
  return (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value as object).every((v) => typeof v === "string")
  );
}

/** Setting values an agent gave under `key`, each checked, with keys limited to `specs`. */
export function readSettingValues(
  args: ToolArgs,
  key: string,
  specs: SettingSpec[],
  what: string,
): Record<string, SettingValue> | undefined {
  const given = args[key];
  if (given === undefined || given === null) return undefined;
  if (typeof given !== "object" || Array.isArray(given))
    throw new Error(`"${key}" must be an object.`);
  const known = specs.map((s) => s.key);
  const values: Record<string, SettingValue> = {};
  for (const [name, value] of Object.entries(given)) {
    if (!known.includes(name)) {
      throw new Error(
        `${what} has no setting "${name}"${known.length ? ` (it has: ${known.join(", ")})` : ""}.`,
      );
    }
    if (!isSettingValue(value)) {
      throw new Error(
        `"${key}.${name}" must be text, a number, true/false, null or an object of text.`,
      );
    }
    values[name] = value;
  }
  return values;
}

/** The secret keys a type's settings can take: its secret settings and `pairs.name` of secret pairs. */
export function readSecretValues(
  args: ToolArgs,
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
): Record<string, string> | undefined {
  const given = args.secrets;
  if (given === undefined || given === null) return undefined;
  if (typeof given !== "object" || Array.isArray(given))
    throw new Error('"secrets" must be an object.');
  const allowed = new Set<string>();
  for (const spec of specs) {
    if (spec.kind === "secret") allowed.add(spec.key);
    else if (spec.kind === "pairs" && spec.secretValues) {
      const names = settings[spec.key];
      if (names && typeof names === "object") {
        for (const name of Object.keys(names)) allowed.add(`${spec.key}.${name}`);
      }
    }
  }
  const secrets: Record<string, string> = {};
  for (const [key, value] of Object.entries(given)) {
    if (!allowed.has(key)) {
      const list = [...allowed].join(", ") || "none";
      throw new Error(`"secrets.${key}" isn't a secret of this source. Its secrets: ${list}.`);
    }
    if (typeof value !== "string") throw new Error(`"secrets.${key}" must be text.`);
    secrets[key] = value;
  }
  return secrets;
}

/** Runs `edit` as one undo step, also when it awaits (the service's own checkpoints join it). */
export async function inUndoStep<T>(engine: DesignWorkspace, edit: () => Promise<T>): Promise<T> {
  const release = engine.doc.holdCheckpoints();
  try {
    return await edit();
  } finally {
    release();
  }
}
