import { relationKeys, tableOfShape } from "../../../model";
import { useErDiagram, useErGate, useErQuery, useErShapes } from "../../model";
import { FormSection } from "./form-section";
import { RelationJoinNote } from "./relation-join-note";
import { memberName } from "./shape-label";
import { FormHint, KeyWires, ShapeLink, TableCard, tableRows } from "./visual";
import type { RelationFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** What connects a relation's sides: their tables, the rows it goes through and the new key. */
export function RelationJoin({ relation }: RelationFormProps) {
  const er = useErDiagram();
  const gate = useErGate();
  const shapes = useErShapes();
  const model = useErQuery((diagram) => diagram.tablesModel());
  const keys = relationKeys(model, relation);
  if (!keys) {
    return (
      <FormSection title={t("form.join.title")}>
        <FormHint>{t("form.join.noSides")}</FormHint>
      </FormSection>
    );
  }
  const { table, columns, holder, identifies } = keys;
  const sides = relation.participants.filter((p) => p.id !== holder?.id);
  const blocked = gate.reason("join-attributes");
  const owned = new Set(
    shapes.attributes.filter((a) => a.ownerId === relation.id).map((a) => a.id),
  );
  const isNew = (name: string) =>
    table.columns.some(
      (c) =>
        c.name === name &&
        (c.fromShape === relation.id || (c.attributeId && owned.has(c.attributeId))),
    );
  const wires = columns.flatMap((column) =>
    column.ref && column.fromSide
      ? [
          {
            from: `${column.fromSide}:${column.ref.column}`,
            to: `key:${column.name}`,
            many: !column.unique,
          },
        ]
      : [],
  );

  return (
    <FormSection title={t("form.join.title")}>
      {!identifies && <FormHint>{t("form.join.hint")}</FormHint>}
      <div className="relative grid grid-cols-2 gap-x-11 gap-y-6">
        {sides.map((side) => {
          const sideTable = tableOfShape(model, side.entityId);
          if (!sideTable) return null;
          const name = memberName(shapes, side.entityId);
          const picked = new Set(
            columns.filter((c) => c.fromSide === side.id).map((c) => c.ref?.column),
          );
          return (
            <TableCard
              key={side.id}
              title={<ShapeLink id={side.entityId} label={name} />}
              rows={tableRows(sideTable, side.id, (column) => {
                const attribute = column.attributeId;
                if (!attribute || identifies) return { picked: picked.has(column.name) };
                return {
                  picked: picked.has(column.name),
                  disabled: !side.via && blocked !== "",
                  title: blocked || undefined,
                  onPick: () =>
                    er.edits.updateParticipant(relation.id, side.id, {
                      via: side.via === attribute ? "" : attribute,
                    }),
                };
              })}
            />
          );
        })}
        <TableCard
          className={holder ? undefined : "col-span-2"}
          fresh={!holder}
          title={
            holder ? (
              <ShapeLink id={holder.entityId} label={memberName(shapes, holder.entityId)} />
            ) : (
              t("form.join.newTable", { name: table.name })
            )
          }
          rows={tableRows(table, "key", (column) => ({
            fresh: column.fromShape === relation.id,
            tag: holder && isNew(column.name) ? "+" : undefined,
          }))}
        />
        <KeyWires wires={wires} />
      </div>
      <RelationJoinNote relation={relation} />
    </FormSection>
  );
}
