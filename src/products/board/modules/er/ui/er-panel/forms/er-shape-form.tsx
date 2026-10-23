import { useErShape } from "../../model";
import { AggregateForm } from "./aggregate-form";
import { AttributeForm } from "./attribute-form";
import { ConstraintForm } from "./constraint-form";
import { EntityForm } from "./entity-form";
import { IsaForm } from "./isa-form";
import { RelationForm } from "./relation-form";
import { ShapeIssues } from "./shape-issues";
import { UnionForm } from "./union-form";
import type { ErShapeFormProps } from "./er-shape-form.types";

/** The form for the selected ER shape, with what the Check diagram finds about it above. */
export function ErShapeForm({ id }: ErShapeFormProps) {
  return (
    <div className="space-y-3">
      <ShapeIssues id={id} />
      <ShapeForm id={id} />
    </div>
  );
}

function ShapeForm({ id }: ErShapeFormProps) {
  const shape = useErShape(id);
  switch (shape?.type) {
    case "er-entity":
      return <EntityForm entity={shape} />;
    case "er-relation":
      return <RelationForm relation={shape} />;
    case "er-attribute":
      return <AttributeForm attribute={shape} />;
    case "er-isa":
      return <IsaForm isa={shape} />;
    case "er-aggregate":
      return <AggregateForm aggregate={shape} />;
    case "er-constraint":
      return <ConstraintForm constraint={shape} />;
    case "er-union":
      return <UnionForm union={shape} />;
    default:
      return null;
  }
}
