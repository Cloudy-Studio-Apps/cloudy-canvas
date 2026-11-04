import { optionalBoolean, optionalString, type ToolArgs } from "@canvas";

import type { DataCondition } from "../bindings";
import type { SortRule } from "../repeat";
import type { RepeatArgs } from "./repeat-args.types";

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

function readFilter(value: unknown): DataCondition[] {
  if (!Array.isArray(value)) throw new Error('"filter" must be a list of { path, op, value? }.');
  return value.map((c, i) => {
    if (!isObject(c) || typeof c.path !== "string" || typeof c.op !== "string") {
      throw new Error(`filter[${i}] must be { path, op, value? }.`);
    }
    if (c.value !== undefined && typeof c.value !== "string" && typeof c.value !== "number") {
      throw new Error(`filter[${i}].value must be a text or a number.`);
    }
    return {
      path: c.path,
      op: c.op,
      ...(c.value !== undefined ? { value: c.value } : {}),
    } as DataCondition;
  });
}

function readSort(value: unknown): SortRule[] {
  if (!Array.isArray(value)) throw new Error('"sort" must be a list of { path, descending? }.');
  return value.map((r, i) => {
    if (!isObject(r) || typeof r.path !== "string" || !r.path) {
      throw new Error(`sort[${i}] must be { path, descending? }.`);
    }
    if (r.descending !== undefined && typeof r.descending !== "boolean") {
      throw new Error(`sort[${i}].descending must be true or false.`);
    }
    return r.descending === true ? { path: r.path, descending: true } : { path: r.path };
  });
}

/** A count (whole, 0 or more) or null to clear it. */
function readCount(args: ToolArgs, name: string): number | null | undefined {
  const value = args[name];
  if (value === undefined || value === null) return value;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`"${name}" must be a whole number of 0 or more, or null.`);
  }
  return value;
}

/** The repeat settings an agent gave (shapes only; `setRepeat` checks the rest). */
export function readRepeatArgs(args: ToolArgs): RepeatArgs {
  const repeat: RepeatArgs["repeat"] = {};
  const template = optionalString(args, "template");
  if (template !== undefined) repeat.template = template;
  const source = optionalString(args, "source");
  if (source !== undefined) repeat.source = source;
  const as = optionalString(args, "as");
  if (as !== undefined) repeat.as = as;
  if (args.key !== undefined) {
    if (args.key !== null && typeof args.key !== "string") {
      throw new Error('"key" must be a path or null.');
    }
    repeat.key = args.key === null ? undefined : args.key;
  }
  if (args.filter !== undefined) repeat.filter = readFilter(args.filter);
  if (args.sort !== undefined) repeat.sort = readSort(args.sort);
  for (const name of ["limit", "designLimit", "previewRow"] as const) {
    const count = readCount(args, name);
    if (count !== undefined) repeat[name] = count === null ? undefined : count;
  }
  return { repeat, addLayout: optionalBoolean(args, "addLayout") ?? true };
}
