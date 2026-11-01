import { relationKeys, tableOfShape } from "../../../model";
import { useErQuery, useErShapes } from "../../model";
import { memberName } from "./shape-label";
import { FormHint } from "./visual";
import type { RelationFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** What the connection does to the tables, in a sentence, and a warning when it isn't safe. */
export function RelationJoinNote({ relation }: RelationFormProps) {
  const model = useErQuery((diagram) => diagram.tablesModel());
  const shapes = useErShapes();
  const keys = relationKeys(model, relation);
  if (!keys) return null;
  const { table, columns, holder, identifies } = keys;
  const first = columns[0];
  const other = relation.participants.find((p) => p.id !== holder?.id);
  const holderName = holder ? memberName(shapes, holder.entityId) : "";
  const otherName = other ? memberName(shapes, other.entityId) : "";
  const risky = relation.participants.flatMap((side) => {
    const attribute = shapes.attributes.find((a) => a.id === side.via);
    const sideTable = tableOfShape(model, side.entityId);
    if (!attribute || !sideTable || sideTable.pk.includes(attribute.name)) return [];
    return [{ name: attribute.name, side: memberName(shapes, side.entityId) }];
  });

  const message = !holder
    ? t("form.join.link", { name: table.name })
    : identifies
      ? t("form.join.identifies", { name: holderName })
      : [
          columns.length === 1
            ? t("form.join.oneColumn", {
                holder: holderName,
                column: first?.name ?? "",
                other: otherName,
              })
            : t("form.join.columns", {
                holder: holderName,
                number: String(columns.length),
                other: otherName,
              }),
          t(
            first?.notNull
              ? columns.length === 1
                ? "form.join.required"
                : "form.join.requiredMany"
              : columns.length === 1
                ? "form.join.optional"
                : "form.join.optionalMany",
          ),
          ...(first?.unique ? [t("form.join.unique", { name: otherName })] : []),
        ].join(" ");

  return (
    <>
      <FormHint>{message}</FormHint>
      {risky.map(({ name, side }) => (
        <FormHint key={name} warn>
          {t("form.join.risky", { name, side })}
        </FormHint>
      ))}
    </>
  );
}
