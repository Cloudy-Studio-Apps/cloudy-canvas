import { useMemo, useSyncExternalStore } from "react";

import { useEngine } from "@canvas-ui";
import { DB_SCHEMA } from "../../db";
import { exportCode, type CodeOutput } from "../targets";
import type { CodeOutputInput } from "./use-code-output.types";

/**
 * The files the target writes for the board's schema now, regenerated when the schema or a choice
 * changes; `empty` when the schema has no tables or enums.
 */
export function useCodeOutput(input: CodeOutputInput): { output: CodeOutput; empty: boolean } {
  const schema = useEngine().service(DB_SCHEMA);
  const version = useSyncExternalStore(schema.subscribe, schema.getVersion);
  const { target, profile, options, ids, table, now } = input;
  return useMemo(() => {
    void version;
    const empty = schema.tables().length === 0 && schema.enums().length === 0;
    const output = exportCode(schema, target, {
      ...(table ? { table } : ids.length > 0 ? { ids } : {}),
      profile,
      options,
      now,
    });
    return { output, empty };
  }, [schema, version, target, profile, options, ids, table, now]);
}
