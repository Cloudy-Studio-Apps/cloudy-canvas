import type { CodeTable } from "../../model";
import type { JavaField } from "./java-fields.types";
import { javaIdentifier, springPhysicalName } from "./java-identifier";

const str = (text: string) => JSON.stringify(text);
const args = (options: readonly string[]) => (options.length > 0 ? `(${options.join(", ")})` : "");

/**
 * A field's JPA annotations, only those that say something Spring Boot wouldn't guess: names that
 * differ from its naming, `nullable`, `unique`, lengths other than 255, precision and scale.
 */
export function springAnnotations(field: JavaField, table: CodeTable): string[] {
  return field.relation ? relationAnnotations(field) : columnAnnotations(field, table);
}

function columnAnnotations(field: JavaField, table: CodeTable): string[] {
  const column = field.column;
  if (!column) return [];
  const out: string[] = [];
  const single = table.primaryKey.length === 1;
  if (column.pk) {
    out.push("@Id");
    if (single && column.increment) {
      out.push("@GeneratedValue(strategy = GenerationType.IDENTITY)");
    } else if (single && column.type === "uuid" && !column.default) {
      out.push("@GeneratedValue(strategy = GenerationType.UUID)");
    }
  }
  if (field.javaType?.kind === "enum") out.push("@Enumerated(EnumType.STRING)");
  if (field.javaType?.kind === "json") out.push("@JdbcTypeCode(SqlTypes.JSON)");
  else if (column.array) out.push("@JdbcTypeCode(SqlTypes.ARRAY)");
  if (field.javaType?.kind === "bytes") out.push("@Lob");

  const options: string[] = [];
  if (springPhysicalName(field.name) !== column.name) options.push(`name = ${str(column.name)}`);
  if (column.notNull && !column.pk) options.push("nullable = false");
  if (column.unique && !column.pk) options.push("unique = true");
  const [a, b] = column.args;
  if ((column.type === "varchar" || column.type === "char") && a !== undefined && a !== 255) {
    options.push(`length = ${a}`);
  }
  if (column.type === "decimal" && a !== undefined) {
    options.push(`precision = ${a}`, ...(b !== undefined ? [`scale = ${b}`] : []));
  }
  if (column.type === "text") options.push('columnDefinition = "text"');
  if (options.length > 0) out.push(`@Column${args(options)}`);
  return out;
}

function relationAnnotations(field: JavaField): string[] {
  const relation = field.relation;
  if (!relation) return [];
  const { props, owner } = relation;
  const { kind, from, to } = props.relation;
  const mappedBy = `mappedBy = ${str(javaIdentifier(props.from).name)}`;
  if (kind === "many-to-many") return [owner ? "@ManyToMany" : `@ManyToMany(${mappedBy})`];
  if (!owner) return [kind === "one-to-one" ? `@OneToOne(${mappedBy})` : `@OneToMany(${mappedBy})`];

  const join: string[] = [];
  const guessed = `${springPhysicalName(field.name)}_${to.column}`;
  const keyColumn = field.column === null;
  if (guessed !== from.column || keyColumn) join.push(`name = ${str(from.column)}`);
  if (to.column !== "id") join.push(`referencedColumnName = ${str(to.column)}`);
  if (field.column?.notNull) join.push("nullable = false");
  // A foreign key that's also part of the primary key is written by its column field.
  if (keyColumn) join.push("insertable = false", "updatable = false");
  return [
    kind === "one-to-one" ? "@OneToOne" : "@ManyToOne",
    ...(join.length > 0 ? [`@JoinColumn${args(join)}`] : []),
  ];
}
