import { createId } from "@shared/core";

import { DB_ENUM_COLOR } from "../../../palette";
import { enumSize, type DbEnumElement } from "../enum";
import type { ParsedEnum } from "./dbml";
import { pairByName } from "./pair-by-name";
import { ReconcileError } from "./reconcile-error";

/** An enum's final content; values keep their ids when matched by name (or position). */
export function buildEnum(parsed: ParsedEnum, existing: DbEnumElement | undefined): DbEnumElement {
  const names = new Set<string>();
  for (const value of parsed.values) {
    if (names.has(value.name)) {
      throw new ReconcileError(
        `Value "${value.name}" is listed twice in "${parsed.name}"`,
        parsed.line,
      );
    }
    names.add(value.name);
  }
  const pairs = pairByName(parsed.values, existing?.values ?? []);
  const values = parsed.values.map((value, i) => ({
    id: pairs.get(i)?.id ?? createId(),
    ...value,
  }));
  return {
    id: existing?.id ?? createId(),
    type: "db-enum",
    index: existing?.index ?? "",
    x: existing?.x ?? 0,
    y: existing?.y ?? 0,
    ...enumSize(parsed.name, values),
    name: parsed.name,
    headerColor: parsed.headerColor ?? DB_ENUM_COLOR,
    values,
  };
}
