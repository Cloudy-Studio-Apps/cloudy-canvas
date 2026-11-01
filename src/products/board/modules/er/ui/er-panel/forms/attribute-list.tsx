import { Plus } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useErDiagram, useErGate, useErShapes } from "../../model";
import { AttributeRow } from "./attribute-row";
import { FormSection } from "./form-section";
import { FormHint } from "./visual";
import type { AttributeListProps } from "./attribute-row.types";
import { t } from "../../../er.i18n";

/** The attributes of a shape (or an attribute's parts); each one's oval selects it. */
export function AttributeList({
  ownerId,
  title = t("form.attributes.title"),
  addLabel = t("form.attributes.add"),
  blocked = "",
}: AttributeListProps) {
  const er = useErDiagram();
  const { attributes, relations } = useErShapes();
  // A relation's attributes are a construct a standard may forbid.
  const gate = useErGate();
  const reason =
    blocked || (relations.some((r) => r.id === ownerId) ? gate.reason("relation-attributes") : "");
  const own = attributes.filter((a) => a.ownerId === ownerId).sort((a, b) => a.order - b.order);

  return (
    <FormSection
      title={title}
      actions={
        <Button
          variant="ghost"
          size="sm"
          title={reason || undefined}
          disabled={reason !== ""}
          onClick={() => er.edits.addAttribute(ownerId)}
        >
          <Plus />
          {addLabel}
        </Button>
      }
    >
      {own.length === 0 ? (
        <FormHint>{t("form.attributes.none")}</FormHint>
      ) : (
        <>
          <FormHint>{t("form.attributes.hint")}</FormHint>
          <ul className="space-y-1">
            {own.map((attribute) => (
              <AttributeRow key={attribute.id} attribute={attribute} />
            ))}
          </ul>
        </>
      )}
    </FormSection>
  );
}
