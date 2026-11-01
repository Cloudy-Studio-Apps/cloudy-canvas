import { ArrowDown, ArrowUp, LocateFixed, Trash2 } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { CommitInput, useEngine } from "@canvas-ui";
import { useErDiagram, useErGate, useErShape, useErShapes } from "../../model";
import { AttributeEffect } from "./attribute-effect";
import { AttributeFlags } from "./attribute-flags";
import { AttributeList } from "./attribute-list";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { shapeLabel } from "./shape-label";
import { useErGoTo } from "./use-er-go-to";
import type { AttributeFormProps } from "./attribute-form.types";
import { t } from "../../../er.i18n";

/** An attribute: its name, what it is, what it makes, its parts and its place in the list. */
export function AttributeForm({ attribute }: AttributeFormProps) {
  const er = useErDiagram();
  const gate = useErGate();
  const engine = useEngine();
  const { goTo, back, previous } = useErGoTo();
  const owner = useErShape(attribute.ownerId);
  const siblings = useErShapes()
    .attributes.filter((a) => a.ownerId === attribute.ownerId)
    .sort((a, b) => a.order - b.order);
  const index = siblings.findIndex((a) => a.id === attribute.id);

  return (
    <div className="space-y-4">
      <FormField label={t("form.attribute.name")}>
        <CommitInput
          value={attribute.name}
          onCommit={(name) =>
            name.trim()
              ? void er.edits.updateAttribute(attribute.id, { name: name.trim() })
              : t("form.nameIt")
          }
        />
      </FormField>
      <FormSection title={t("form.attribute.what")}>
        <AttributeFlags attribute={attribute} />
      </FormSection>
      <FormSection title={t("form.effect.title")}>
        <AttributeEffect attribute={attribute} />
      </FormSection>
      <AttributeList
        ownerId={attribute.id}
        title={t("form.attribute.parts")}
        addLabel={t("form.attribute.addPartShort")}
        blocked={gate.reason("composite-attributes")}
      />
      {siblings.length > 1 && (
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={index === 0}
            onClick={() => er.edits.moveAttribute(attribute.id, -1)}
          >
            <ArrowUp />
            {t("form.moveUp")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={index === siblings.length - 1}
            onClick={() => er.edits.moveAttribute(attribute.id, 1)}
          >
            <ArrowDown />
            {t("form.moveDown")}
          </Button>
        </div>
      )}
      <div className="flex gap-1">
        {!previous && owner && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => goTo(attribute.ownerId)}
          >
            <LocateFixed />
            {t("forms.editOwner", { name: shapeLabel(owner) })}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            // Off it first: it must not stay on the way back once it's gone.
            if (previous) back();
            else engine.select([attribute.ownerId]);
            er.edits.removeAttribute(attribute.id);
          }}
        >
          <Trash2 />
          {t("form.attribute.delete")}
        </Button>
      </div>
    </div>
  );
}
