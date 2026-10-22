import { CommitInput } from "@canvas-ui";
import { useErDiagram, useErShapes } from "../../model";
import { AttributeList } from "./attribute-list";
import { relationOptions } from "./entity-options";
import { FormField } from "./form-field";
import { ShapeSelect } from "./shape-select";
import type { AggregateFormProps } from "./entity-form.types";

/** An aggregation: its name, the relation it boxes, and its own attributes. */
export function AggregateForm({ aggregate }: AggregateFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();

  return (
    <div className="space-y-4">
      <FormField label="Aggregation name">
        <CommitInput
          value={aggregate.name}
          onCommit={(name) =>
            name.trim()
              ? void er.edits.updateAggregate(aggregate.id, { name: name.trim() })
              : "Name it"
          }
        />
      </FormField>
      <FormField label="Relation it groups">
        <ShapeSelect
          aria-label="Relation it groups"
          value={aggregate.relationId}
          options={relationOptions(shapes)}
          className="w-full"
          onChange={(relationId) => er.edits.updateAggregate(aggregate.id, { relationId })}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        Add this aggregation as a participant of another relation to relate it like an entity.
      </p>
      <AttributeList ownerId={aggregate.id} />
    </div>
  );
}
