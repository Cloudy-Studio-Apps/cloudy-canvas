import { Group, Plus, RectangleHorizontal } from "lucide-react";

import { canConvert } from "../../../relation/can-convert";
import { cardinalityRatio } from "../../../relation/cardinality-ratio";
import { Button } from "@shared/ui/kit";
import { CommitInput, useEngine } from "@canvas-ui";
import { useErDiagram, useErShapes, lockedOn, useErGate } from "../../model";
import { FlagToggle } from "../../../../db/ui";
import { AttributeList } from "./attribute-list";
import { entityOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { ParticipantRow } from "./participant-row";
import type { RelationFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** A relation: name, identifying marks, participants with cardinalities, and its attributes. */
export function RelationForm({ relation }: RelationFormProps) {
  const engine = useEngine();
  const er = useErDiagram();
  const shapes = useErShapes();
  const options = entityOptions(shapes, true);
  const ratio = cardinalityRatio(relation);
  const firstEntity = options[0]?.value;
  const gate = useErGate();
  const lock = (construct: string, on: boolean) => lockedOn(gate, construct, on);

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
      <div className="flex items-center gap-1">
        <FlagToggle
          label={t("form.relation.identifying")}
          title={
            lock("identifying-relations", relation.identifying).reason ||
            t("form.relation.identifyingTitle")
          }
          on={relation.identifying}
          disabled={lock("identifying-relations", relation.identifying).disabled}
          onToggle={() =>
            er.edits.updateRelation(relation.id, { identifying: !relation.identifying })
          }
        />
        <FlagToggle
          label={t("form.relation.associative")}
          title={
            lock("associative-entities", relation.associative).reason ||
            t("form.relation.associativeTitle")
          }
          on={relation.associative}
          disabled={lock("associative-entities", relation.associative).disabled}
          onToggle={() =>
            er.edits.updateRelation(relation.id, { associative: !relation.associative })
          }
        />
        <FlagToggle
          label={t("form.relation.iMark")}
          title={lock("dependency-marks", relation.idMark).reason || t("form.relation.iMarkTitle")}
          on={relation.idMark}
          disabled={lock("dependency-marks", relation.idMark).disabled}
          onToggle={() => er.edits.updateRelation(relation.id, { idMark: !relation.idMark })}
        />
        <FlagToggle
          label={t("form.relation.eMark")}
          title={
            lock("dependency-marks", relation.existenceMark).reason || t("form.relation.eMarkTitle")
          }
          on={relation.existenceMark}
          disabled={lock("dependency-marks", relation.existenceMark).disabled}
          onToggle={() =>
            er.edits.updateRelation(relation.id, { existenceMark: !relation.existenceMark })
          }
        />
        {ratio && (
          <span
            className="ml-auto font-mono text-xs text-muted-foreground"
            title={t("form.relation.ratioTitle")}
          >
            {ratio}
          </span>
        )}
      </div>
      {canConvert(relation, engine) && (
        <Button
          variant="secondary"
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
              !firstEntity || (relation.participants.length >= 2 && !gate.allows("nary-relations"))
            }
            onClick={() => firstEntity && er.edits.addParticipant(relation.id, firstEntity)}
          >
            <Plus />
            {t("form.relation.addParticipant")}
          </Button>
        }
      >
        {relation.participants.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("form.relation.noParticipants")}</p>
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
      <AttributeList ownerId={relation.id} />
      <Button
        variant="outline"
        size="sm"
        title={t("form.relation.aggregateTitle")}
        onClick={() => {
          const id = er.edits.addAggregate(relation.id);
          if (id) engine.focusElement(id);
        }}
      >
        <Group />
        {t("form.relation.aggregate")}
      </Button>
    </div>
  );
}
