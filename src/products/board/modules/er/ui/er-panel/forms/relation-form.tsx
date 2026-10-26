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
      <FormField label="Relation name">
        <CommitInput
          value={relation.name}
          onCommit={(name) =>
            name.trim()
              ? void er.edits.updateRelation(relation.id, { name: name.trim() })
              : "Name it"
          }
        />
      </FormField>
      <div className="flex items-center gap-1">
        <FlagToggle
          label="Identifying"
          title={
            lock("identifying-relations", relation.identifying).reason ||
            "Identifying relation of a weak entity (double diamond)"
          }
          on={relation.identifying}
          disabled={lock("identifying-relations", relation.identifying).disabled}
          onToggle={() =>
            er.edits.updateRelation(relation.id, { identifying: !relation.identifying })
          }
        />
        <FlagToggle
          label="Associative"
          title={
            lock("associative-entities", relation.associative).reason ||
            "An associative entity: a relation that is also an entity, with a key of its own, taking part in other relations"
          }
          on={relation.associative}
          disabled={lock("associative-entities", relation.associative).disabled}
          onToggle={() =>
            er.edits.updateRelation(relation.id, { associative: !relation.associative })
          }
        />
        <FlagToggle
          label="I mark"
          title={
            lock("dependency-marks", relation.idMark).reason ||
            "Dependency by identification (an I at the top of the diamond)"
          }
          on={relation.idMark}
          disabled={lock("dependency-marks", relation.idMark).disabled}
          onToggle={() => er.edits.updateRelation(relation.id, { idMark: !relation.idMark })}
        />
        <FlagToggle
          label="E mark"
          title={
            lock("dependency-marks", relation.existenceMark).reason ||
            "Dependency by existence (an E at the top of the diamond)"
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
            title="From the max cardinalities"
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
          title="Replace the relation with an entity and a two-way relation per side"
          onClick={() => {
            const entity = er.edits.convertToEntity(relation.id);
            if (entity) engine.focusElement(entity);
          }}
        >
          <RectangleHorizontal />
          Convert to entity
        </Button>
      )}
      <FormSection
        title="Participants"
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
            Add
          </Button>
        }
      >
        {relation.participants.length === 0 ? (
          <p className="text-xs text-muted-foreground">No entities take part yet.</p>
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
        title="Box this relation and its entities so it can take part in other relations"
        onClick={() => {
          const id = er.edits.addAggregate(relation.id);
          if (id) engine.focusElement(id);
        }}
      >
        <Group />
        Make an aggregation
      </Button>
    </div>
  );
}
