import { toCamel, uniqueNames, type RelationProps } from "../../code";
import type { CodeColumn, CodeTable } from "../../model";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import { javaDefault } from "./java-default";
import type { JavaField, JavaFieldsOptions } from "./java-fields.types";
import { javaIdentifier } from "./java-identifier";
import type { JavaNames } from "./java-names.types";
import { javaType } from "./java-type-map";

/**
 * A class's fields in the table's column order. A foreign key column becomes the object it points
 * at (`post_id` → `Post post`), unless it's part of the primary key, which keeps the column too;
 * then come the lists and objects of relations pointing here, and many to many lists. `props` are
 * the schema's relation names (`relationProps`); `init` says which references start as `new`.
 */
export function javaFields(
  table: CodeTable,
  props: readonly RelationProps[],
  names: JavaNames,
  init: (p: RelationProps) => boolean,
  options: JavaFieldsOptions,
  warnings: CodeWarning[],
): JavaField[] {
  const own = props.filter(
    (p) => p.relation.from.table === table.name || p.relation.to.table === table.name,
  );
  const owned = own.filter(
    (p) => p.relation.from.table === table.name && p.relation.kind !== "many-to-many",
  );
  const used = new Set<RelationProps>();
  const fields: JavaField[] = [];

  const reference = (p: RelationProps, column: CodeColumn | null): JavaField => {
    used.add(p);
    const model = names.model(p.relation.to.table);
    const start = options.initObjects && init(p);
    return {
      name: p.from,
      type: model,
      init: start ? ` = new ${model}()` : "",
      comment: "",
      column,
      javaType: null,
      relation: { props: p, owner: true },
    };
  };

  for (const column of table.columns) {
    const p = owned.find((r) => r.relation.from.column === column.name && !used.has(r));
    if (p && !column.pk) {
      fields.push(reference(p, column));
      continue;
    }
    fields.push(columnField(table, column, names, options, warnings));
    if (p) fields.push(reference(p, null));
  }
  for (const p of owned) if (!used.has(p)) fields.push(reference(p, null));

  for (const p of own) {
    const { relation } = p;
    const list = (name: string, table: string, owner: boolean): JavaField => ({
      name,
      type: `List<${names.model(table)}>`,
      init: " = new ArrayList<>()",
      comment: "",
      column: null,
      javaType: null,
      relation: { props: p, owner },
    });
    if (relation.kind === "many-to-many") {
      if (relation.from.table === table.name) fields.push(list(p.from, relation.to.table, true));
      if (relation.to.table === table.name) fields.push(list(p.to, relation.from.table, false));
    } else if (relation.to.table === table.name) {
      fields.push(
        relation.kind === "one-to-one"
          ? {
              ...list(p.to, relation.from.table, false),
              type: names.model(relation.from.table),
              init: "",
            }
          : list(p.to, relation.from.table, false),
      );
    }
  }

  const unique = uniqueNames(fields.map((field) => field.name));
  return fields.map((field, i) => {
    const { name, keyword } = javaIdentifier(unique[i] ?? field.name);
    if (keyword) {
      const at = { table: table.name, ...(field.column ? { column: field.column.name } : {}) };
      warnings.push(warn("reserved-word", { name: field.name, target: options.target }, at));
    }
    return { ...field, name };
  });
}

function columnField(
  table: CodeTable,
  column: CodeColumn,
  names: JavaNames,
  options: JavaFieldsOptions,
  warnings: CodeWarning[],
): JavaField {
  const type = javaType(column, names.enumType);
  if (!type) {
    const at = { table: table.name, column: column.name };
    warnings.push(
      warn(
        "unknown-type",
        { ...at, type: column.type, target: options.target, fallback: "Object" },
        at,
      ),
    );
  }
  const base = type
    ? column.notNull && !column.pk && !column.array && type.primitive
      ? type.primitive
      : type.boxed
    : "Object";
  const value = javaDefault(column, type, options.keepEnumValues);
  return {
    name: toCamel(column.name),
    type: column.array ? `List<${base}>` : base,
    init: value.init,
    comment: [column.note, value.comment].filter(Boolean).join("; "),
    column,
    javaType: type,
    relation: null,
  };
}
