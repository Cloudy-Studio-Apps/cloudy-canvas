import { Plus } from "lucide-react";

import type { ErAttributeShape } from "@engine";
import { Button } from "@ui/components/ui/button";
import { useErDiagram, useErShapes } from "../../../engine/use-er-query";
import { AttributeRow } from "./attribute-row";
import { FormSection } from "./form-section";
import type { AttributeListProps } from "./attribute-row.types";

/** The attributes of an entity, relation or aggregation, with their parts nested under them. */
export function AttributeList({ ownerId, title = "Attributes" }: AttributeListProps) {
  const er = useErDiagram();
  const { attributes } = useErShapes();
  const partsOf = new Map<string, ErAttributeShape[]>();
  for (const attribute of [...attributes].sort((a, b) => a.order - b.order)) {
    partsOf.set(attribute.ownerId, [...(partsOf.get(attribute.ownerId) ?? []), attribute]);
  }
  const own = partsOf.get(ownerId) ?? [];

  return (
    <FormSection
      title={title}
      actions={
        <Button variant="ghost" size="sm" onClick={() => er.edits.addAttribute(ownerId)}>
          <Plus />
          Add attribute
        </Button>
      }
    >
      {own.length === 0 ? (
        <p className="text-xs text-muted-foreground">No attributes yet.</p>
      ) : (
        <ul className="divide-y">
          {own.map((attribute, i) => (
            <AttributeRow
              key={attribute.id}
              attribute={attribute}
              partsOf={partsOf}
              first={i === 0}
              last={i === own.length - 1}
              depth={0}
            />
          ))}
        </ul>
      )}
    </FormSection>
  );
}
