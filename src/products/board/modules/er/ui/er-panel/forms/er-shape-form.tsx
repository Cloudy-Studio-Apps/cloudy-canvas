import { useErShape } from "../../model";
import { AggregateForm } from "./aggregate-form";
import { AttributeForm } from "./attribute-form";
import { ConstraintForm } from "./constraint-form";
import { EntityForm } from "./entity-form";
import { IsaForm } from "./isa-form";
import { RelationForm } from "./relation-form";
import type { ErShapeFormProps } from "./er-shape-form.types";

/** The form for the selected ER shape. */
export function ErShapeForm({ id }: ErShapeFormProps) {
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
    default:
      return null;
  }
}
