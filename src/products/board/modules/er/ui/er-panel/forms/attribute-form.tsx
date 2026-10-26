import { LocateFixed } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useEngine } from "@canvas-ui";
import type { ErAttributeElement } from "../../../attribute/attribute.types";
import { useErShape, useErShapes } from "../../model";
import { AttributeRow } from "./attribute-row";
import type { AttributeFormProps } from "./attribute-form.types";

/** One attribute (with its parts); its owner is a click away. */
export function AttributeForm({ attribute }: AttributeFormProps) {
  const engine = useEngine();
  const owner = useErShape(attribute.ownerId);
  const { attributes } = useErShapes();
  const partsOf = new Map<string, ErAttributeElement[]>();
  for (const a of [...attributes].sort((x, y) => x.order - y.order)) {
    partsOf.set(a.ownerId, [...(partsOf.get(a.ownerId) ?? []), a]);
  }
  const ownerName = owner && "name" in owner ? owner.name : "its owner";

  return (
    <div className="space-y-3">
      <ul>
        <AttributeRow attribute={attribute} partsOf={partsOf} first last depth={0} />
      </ul>
      <Button variant="outline" size="sm" onClick={() => engine.focusElement(attribute.ownerId)}>
        <LocateFixed />
        Edit {ownerName}
      </Button>
    </div>
  );
}
