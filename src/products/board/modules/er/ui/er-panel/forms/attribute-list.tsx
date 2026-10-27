import { Plus } from "lucide-react";

import type { ErAttributeElement } from "../../../attribute/attribute.types";
import { Button } from "@shared/ui/kit";
import { useErDiagram, useErGate, useErShapes } from "../../model";
import { AttributeRow } from "./attribute-row";
import { FormSection } from "./form-section";
import type { AttributeListProps } from "./attribute-row.types";
import { t } from "../../../er.i18n";

/** The attributes of an entity, relation or aggregation, with their parts nested under them. */
export function AttributeList({ ownerId, title = t("form.attributes.title") }: AttributeListProps) {
  const er = useErDiagram();
  const { attributes, relations } = useErShapes();
  // A relation's attributes are a construct a standard may forbid.
  const gate = useErGate();
  const blocked = relations.some((r) => r.id === ownerId) ? gate.reason("relation-attributes") : "";
  const partsOf = new Map<string, ErAttributeElement[]>();
  for (const attribute of [...attributes].sort((a, b) => a.order - b.order)) {
    partsOf.set(attribute.ownerId, [...(partsOf.get(attribute.ownerId) ?? []), attribute]);
  }
  const own = partsOf.get(ownerId) ?? [];

  return (
    <FormSection
      title={title}
      actions={
        <Button
          variant="ghost"
          size="sm"
          title={blocked || undefined}
          disabled={blocked !== ""}
          onClick={() => er.edits.addAttribute(ownerId)}
        >
          <Plus />
          {t("form.attributes.add")}
        </Button>
      }
    >
      {own.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("form.attributes.none")}</p>
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
