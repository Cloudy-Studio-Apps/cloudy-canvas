import { Group, Plus, RectangleHorizontal } from "lucide-react";

import { canConvert, cardinalityRatio } from "@board";
import { Button } from "@shared/ui/components/ui/button";
import { CommitInput, useEngine } from "@canvas-ui";
import { useErDiagram, useErShapes } from "../../model";
import { FlagToggle } from "../../../../db/ui/db-panel/flag-toggle";
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
          title="Identifying relation of a weak entity (double diamond)"
          on={relation.identifying}
          onToggle={() =>
            er.edits.updateRelation(relation.id, { identifying: !relation.identifying })
          }
        />
        <FlagToggle
          label="Associative"
          title="An associative entity: a relation that is also an entity, with a key of its own, taking part in other relations"
          on={relation.associative}
          onToggle={() =>
            er.edits.updateRelation(relation.id, { associative: !relation.associative })
          }
        />
        <FlagToggle
          label="I mark"
          title="Dependency by identification (an I at the top of the diamond)"
          on={relation.idMark}
          onToggle={() => er.edits.updateRelation(relation.id, { idMark: !relation.idMark })}
        />
        <FlagToggle
          label="E mark"
          title="Dependency by existence (an E at the top of the diamond)"
          on={relation.existenceMark}
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
            disabled={!firstEntity}
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
