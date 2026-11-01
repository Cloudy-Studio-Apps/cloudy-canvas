import { Group, Plus, RectangleHorizontal } from "lucide-react";

import { canConvert } from "../../../relation/can-convert";
import { Button } from "@shared/ui/kit";
import { CommitInput, useEngine } from "@canvas-ui";
import { useErDiagram, useErShapes, useErGate } from "../../model";
import { AttributeList } from "./attribute-list";
import { entityOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { MoreOptions } from "./more-options";
import { ParticipantRow } from "./participant-row";
import { RelationAmounts } from "./relation-amounts";
import { RelationJoin } from "./relation-join";
import { RelationKinds } from "./relation-kinds";
import { FormHint } from "./visual";
import type { RelationFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** A relation: how many of each side, what connects them, its kind and its attributes. */
export function RelationForm({ relation }: RelationFormProps) {
  const engine = useEngine();
  const er = useErDiagram();
  const shapes = useErShapes();
  const options = entityOptions(shapes, true);
  const firstEntity = options[0]?.value;
  const gate = useErGate();

  return (
    <div className="space-y-4">
      <FormField label={t("form.relation.name")}>
        <CommitInput
          value={relation.name}
          onCommit={(name) =>
            name.trim()
              ? void er.edits.updateRelation(relation.id, { name: name.trim() })
              : t("form.nameIt")
          }
        />
      </FormField>
      {relation.participants.length > 0 && <RelationAmounts relation={relation} />}
      <RelationJoin relation={relation} />
      <RelationKinds relation={relation} />
      <AttributeList ownerId={relation.id} />
      <MoreOptions>
        <FormSection
          title={t("form.relation.participants")}
          actions={
            <Button
              variant="ghost"
              size="sm"
              // A third side makes a relation of three or more, which a standard may forbid.
              title={
                relation.participants.length >= 2
                  ? gate.reason("nary-relations") || undefined
                  : undefined
              }
              disabled={
                !firstEntity ||
                (relation.participants.length >= 2 && !gate.allows("nary-relations"))
              }
              onClick={() => firstEntity && er.edits.addParticipant(relation.id, firstEntity)}
            >
              <Plus />
              {t("form.relation.addParticipant")}
            </Button>
          }
        >
          {relation.participants.length === 0 ? (
            <FormHint>{t("form.relation.noParticipants")}</FormHint>
          ) : (
            <ul className="divide-y">
              {relation.participants.map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  relation={relation}
                  participant={participant}
                  options={options}
                />
              ))}
            </ul>
          )}
        </FormSection>
        {canConvert(relation, engine) && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            title={t("form.relation.convertTitle")}
            onClick={() => {
              const entity = er.edits.convertToEntity(relation.id);
              if (entity) engine.focusElement(entity);
            }}
          >
            <RectangleHorizontal />
            {t("form.relation.convert")}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          title={t("form.relation.aggregateTitle")}
          onClick={() => {
            const id = er.edits.addAggregate(relation.id);
            if (id) engine.focusElement(id);
          }}
        >
          <Group />
          {t("form.relation.aggregate")}
        </Button>
      </MoreOptions>
    </div>
  );
}
