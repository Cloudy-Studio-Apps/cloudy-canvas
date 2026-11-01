import { Plus } from "lucide-react";

import { Button, ChoiceCards } from "@shared/ui/kit";
import { useErDiagram, useErShapes } from "../../model";
import { CardinalityPicker } from "./cardinality-picker";
import { entityOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { IsaDiscriminator } from "./isa-discriminator";
import { IsaPicture } from "./isa-picture";
import { isaSentence } from "./isa-sentence";
import { IsaVenn } from "./isa-venn";
import { MoreOptions } from "./more-options";
import { memberName } from "./shape-label";
import { ShapeChips } from "./shape-chips";
import { ShapeSelect } from "./shape-select";
import { FormHint, OpenShape } from "./visual";
import type { IsaFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** A hierarchy (ES UN triangle): its drawing, its two questions, parent, children and the rest. */
export function IsaForm({ isa }: IsaFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const options = entityOptions(shapes);
  const parent = memberName(shapes, isa.parentId);
  const children = isa.children.map((c) => memberName(shapes, c.entityId));
  const free = options.filter(
    (o) => o.value !== isa.parentId && !isa.children.some((c) => c.entityId === o.value),
  );
  const addChild = (entityId: string) => {
    if (entityId) er.edits.addIsaChild(isa.id, entityId);
  };

  return (
    <div className="space-y-4">
      <IsaPicture isa={isa} />
      <FormHint>{isaSentence(parent, children, isa.exclusive, isa.total)}</FormHint>
      <FormSection title={t("form.isa.moreThanOne", { name: parent })}>
        <ChoiceCards
          label={t("form.isa.overlapOrExclusive")}
          value={isa.exclusive ? "exclusive" : "overlapping"}
          onChange={(value) => er.edits.updateIsa(isa.id, { exclusive: value === "exclusive" })}
          options={[
            {
              value: "overlapping",
              label: t("form.isa.overlapping"),
              hint: t("form.isa.overlappingHint"),
              title: t("form.isa.overlappingTitle"),
              picture: <IsaVenn kind="overlapping" />,
            },
            {
              value: "exclusive",
              label: t("form.isa.exclusive"),
              hint: t("form.isa.exclusiveHint"),
              title: t("form.isa.exclusiveTitle"),
              picture: <IsaVenn kind="exclusive" />,
            },
          ]}
        />
      </FormSection>
      <FormSection title={t("form.isa.noneOfThem", { name: parent })}>
        <ChoiceCards
          label={t("form.isa.partialOrTotal")}
          value={isa.total ? "total" : "partial"}
          onChange={(value) => er.edits.updateIsa(isa.id, { total: value === "total" })}
          options={[
            {
              value: "partial",
              label: t("form.isa.partial"),
              hint: t("form.isa.partialHint"),
              title: t("form.isa.partialTitle"),
              picture: <IsaVenn kind="partial" />,
            },
            {
              value: "total",
              label: t("form.isa.total"),
              hint: t("form.isa.totalHint"),
              title: t("form.isa.totalTitle"),
              picture: <IsaVenn kind="total" />,
            },
          ]}
        />
      </FormSection>
      <FormField label={t("form.isa.parent")}>
        <div className="flex items-center gap-1">
          <ShapeSelect
            aria-label={t("form.isa.parent")}
            value={isa.parentId}
            options={options}
            className="flex-1"
            onChange={(parentId) => er.edits.updateIsa(isa.id, { parentId })}
          />
          <OpenShape id={isa.parentId} label={parent} />
        </div>
      </FormField>
      <FormSection title={t("form.isa.children")}>
        <ShapeChips
          chips={isa.children.map((child, i) => ({
            id: child.entityId,
            label: children[i] ?? "",
            removeLabel: t("form.isa.removeChild"),
            onRemove: () => er.edits.removeIsaChild(isa.id, child.id),
          }))}
        />
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            title={t("form.isa.newChildTitle")}
            onClick={() => {
              const id = er.edits.addEntity();
              if (id) addChild(id);
            }}
          >
            <Plus />
            {t("form.isa.newEntity")}
          </Button>
          {free.length > 0 && (
            <ShapeSelect
              aria-label={t("form.isa.addExistingChild")}
              value=""
              placeholder={t("form.isa.addExisting")}
              options={free}
              onChange={addChild}
            />
          )}
        </div>
      </FormSection>
      <IsaDiscriminator isa={isa} />
      <MoreOptions>
        <FormHint>{t("form.isa.lineNumbers")}</FormHint>
        <ul className="space-y-1">
          <li className="flex items-center justify-between gap-1 text-xs">
            <span className="truncate">{parent}</span>
            <CardinalityPicker
              optional
              min={isa.parentMin}
              max={isa.parentMax}
              onChange={(parentMin, parentMax) =>
                er.edits.updateIsa(isa.id, { parentMin, parentMax })
              }
            />
          </li>
          {isa.children.map((child, i) => (
            <li key={child.id} className="flex items-center justify-between gap-1 text-xs">
              <span className="truncate">{children[i]}</span>
              <CardinalityPicker
                optional
                min={child.min}
                max={child.max}
                onChange={(min, max) => er.edits.updateIsaChild(isa.id, child.id, { min, max })}
              />
            </li>
          ))}
        </ul>
      </MoreOptions>
    </div>
  );
}
