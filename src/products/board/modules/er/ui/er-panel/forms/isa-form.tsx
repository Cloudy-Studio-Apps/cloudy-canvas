import { Plus, Trash2 } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
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
      <FormField label="Parent entity">
        <div className="flex items-center gap-1">
          <ShapeSelect
            aria-label="Parent entity"
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
        aria-label="Overlapping or exclusive"
        value={isa.exclusive}
        off={{
          label: "Overlapping",
          title: "Solapada: an occurrence can be several children at once",
        }}
        on={{ label: "Exclusive", title: "Exclusiva: only one child (arc under the triangle)" }}
        onChange={(exclusive) => er.edits.updateIsa(isa.id, { exclusive })}
      />
      <Segmented
        aria-label="Partial or total"
        value={isa.total}
        off={{ label: "Partial", title: "Parcial: it can also be none of the children" }}
        on={{ label: "Total", title: "Total: always one of the children (circle on the line)" }}
        onChange={(total) => er.edits.updateIsa(isa.id, { total })}
      />
      <FormField label="Discriminator (optional)">
        <CommitInput
          value={discriminator}
          placeholder="e.g. tipo"
          onCommit={(name) => void er.edits.setDiscriminator(isa.id, name.trim())}
        />
      </FormField>
      <FormSection
        title="Children"
        actions={
          <Button
            variant="ghost"
            size="sm"
            title="Create a new child entity"
            onClick={() => {
              const id = er.edits.addEntity();
              if (id) addChild(id);
            }}
          >
            <Plus />
            New entity
          </Button>
        }
      >
        <ul className="divide-y">
          {isa.children.map((child) => (
            <li key={child.id} className="flex items-center gap-1 py-1.5">
              <ShapeSelect
                aria-label="Child entity"
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
                label="Remove child"
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
            aria-label="Add an existing entity as a child"
            value=""
            placeholder="Add an existing entity…"
            options={free}
            className="w-full"
            onChange={addChild}
          />
        )}
      </FormSection>
    </div>
  );
}
