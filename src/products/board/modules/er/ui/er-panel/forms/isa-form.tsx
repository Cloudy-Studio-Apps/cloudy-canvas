import { Plus, Trash2 } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { CommitInput } from "@canvas-ui";
import { useErDiagram, useErShapes } from "../../model";
import { CardinalityPicker } from "./cardinality-picker";
import { entityOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { IconAction } from "./icon-action";
import { Segmented } from "./segmented";
import { ShapeSelect } from "./shape-select";
import type { IsaFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** A hierarchy (ES UN triangle): parent, kind, discriminator and children. */
export function IsaForm({ isa }: IsaFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const options = entityOptions(shapes);
  const discriminator = shapes.attributes.find((a) => a.ownerId === isa.id)?.name ?? "";
  const free = options.filter(
    (o) => o.value !== isa.parentId && !isa.children.some((c) => c.entityId === o.value),
  );

  const addChild = (entityId: string) => {
    if (entityId) er.edits.addIsaChild(isa.id, entityId);
  };

  return (
    <div className="space-y-4">
      <FormField label={t("form.isa.parent")}>
        <div className="flex items-center gap-1">
          <ShapeSelect
            aria-label={t("form.isa.parent")}
            value={isa.parentId}
            options={options}
            className="flex-1"
            onChange={(parentId) => er.edits.updateIsa(isa.id, { parentId })}
          />
          <CardinalityPicker
            optional
            min={isa.parentMin}
            max={isa.parentMax}
            onChange={(parentMin, parentMax) =>
              er.edits.updateIsa(isa.id, { parentMin, parentMax })
            }
          />
        </div>
      </FormField>
      <Segmented
        aria-label={t("form.isa.overlapOrExclusive")}
        value={isa.exclusive}
        off={{
          label: t("form.isa.overlapping"),
          title: t("form.isa.overlappingTitle"),
        }}
        on={{ label: t("form.isa.exclusive"), title: t("form.isa.exclusiveTitle") }}
        onChange={(exclusive) => er.edits.updateIsa(isa.id, { exclusive })}
      />
      <Segmented
        aria-label={t("form.isa.partialOrTotal")}
        value={isa.total}
        off={{ label: t("form.isa.partial"), title: t("form.isa.partialTitle") }}
        on={{ label: t("form.isa.total"), title: t("form.isa.totalTitle") }}
        onChange={(total) => er.edits.updateIsa(isa.id, { total })}
      />
      <FormField label={t("form.isa.discriminator")}>
        <CommitInput
          value={discriminator}
          placeholder={t("form.isa.discriminatorExample")}
          onCommit={(name) => void er.edits.setDiscriminator(isa.id, name.trim())}
        />
      </FormField>
      <FormSection
        title={t("form.isa.children")}
        actions={
          <Button
            variant="ghost"
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
        }
      >
        <ul className="divide-y">
          {isa.children.map((child) => (
            <li key={child.id} className="flex items-center gap-1 py-1.5">
              <ShapeSelect
                aria-label={t("form.isa.child")}
                value={child.entityId}
                options={options}
                className="flex-1"
                onChange={(entityId) => er.edits.updateIsaChild(isa.id, child.id, { entityId })}
              />
              <CardinalityPicker
                optional
                min={child.min}
                max={child.max}
                onChange={(min, max) => er.edits.updateIsaChild(isa.id, child.id, { min, max })}
              />
              <IconAction
                label={t("form.isa.removeChild")}
                danger
                onClick={() => er.edits.removeIsaChild(isa.id, child.id)}
              >
                <Trash2 />
              </IconAction>
            </li>
          ))}
        </ul>
        {free.length > 0 && (
          <ShapeSelect
            aria-label={t("form.isa.addExistingChild")}
            value=""
            placeholder={t("form.isa.addExisting")}
            options={free}
            className="w-full"
            onChange={addChild}
          />
        )}
      </FormSection>
    </div>
  );
}
