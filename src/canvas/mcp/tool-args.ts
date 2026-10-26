import type { ToolArgs } from "./mcp-tool.types";

export function stringArg(args: ToolArgs, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value === "") {
    throw new Error(`"${key}" must be a non-empty string.`);
  }
  return value;
}

export function optionalString(args: ToolArgs, key: string): string | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`"${key}" must be a string.`);
  return value;
}

export function optionalNumber(args: ToolArgs, key: string): number | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`"${key}" must be a number.`);
  }
  return value;
}

export function optionalBoolean(args: ToolArgs, key: string): boolean | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "boolean") throw new Error(`"${key}" must be true or false.`);
  return value;
}

/** One of `choices`, or `undefined` when absent. */
export function optionalChoice<T extends string>(
  args: ToolArgs,
  key: string,
  choices: readonly T[],
): T | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (!choices.includes(value as T)) {
    throw new Error(`"${key}" must be one of: ${choices.join(", ")}.`);
  }
  return value as T;
}

export function stringList(args: ToolArgs, key: string): string[] {
  const value = args[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`"${key}" must be an array of strings.`);
  }
  return value;
}

export function optionalRecord(args: ToolArgs, key: string): ToolArgs | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (!isToolArgs(value)) throw new Error(`"${key}" must be an object.`);
  return value;
}

export function recordList(args: ToolArgs, key: string): ToolArgs[] {
  const value = args[key];
  if (!Array.isArray(value) || !value.every(isToolArgs)) {
    throw new Error(`"${key}" must be an array of objects.`);
  }
  return value;
}

function isToolArgs(value: unknown): value is ToolArgs {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
