import { Plus, Trash2 } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { useEngine } from "@canvas-ui";
import { useErDiagram, useErShapes } from "../../model";
import { entityOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { IconAction } from "./icon-action";
import { ShapeSelect } from "./shape-select";
import type { UnionFormProps } from "./entity-form.types";

/** A union type (category): the category entity and the superclasses it unites. */
export function UnionForm({ union }: UnionFormProps) {
  const engine = useEngine();
  const er = useErDiagram();
  const shapes = useErShapes();
  const options = entityOptions(shapes);
  const nameOf = (id: string) => options.find((o) => o.value === id)?.label ?? "?";
  const free = options.filter(
    (o) => o.value !== union.categoryId && !union.superclassIds.includes(o.value),
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Each {nameOf(union.categoryId)} is exactly one of the superclasses below (a category).
      </p>
      <FormField label="Category entity">
        <ShapeSelect
          aria-label="Category entity"
          value={union.categoryId}
          options={options}
          onChange={(categoryId) => er.edits.setUnionCategory(union.id, categoryId)}
        />
      </FormField>
      <FormSection
        title="Superclasses"
        actions={
          <Button
            variant="ghost"
            size="sm"
            title="Create a new superclass entity"
            onClick={() => {
              const id = er.edits.addUnionSuperclassEntity(union.id);
              if (id) engine.focusElement(id);
            }}
          >
            <Plus />
            New entity
          </Button>
        }
      >
        <ul className="divide-y">
          {union.superclassIds.map((id) => (
            <li key={id} className="flex items-center gap-1 py-1.5 text-sm">
              <span className="flex-1">{nameOf(id)}</span>
              <IconAction
                label="Remove superclass"
                danger
                onClick={() => er.edits.removeUnionSuperclass(union.id, id)}
              >
                <Trash2 />
              </IconAction>
            </li>
          ))}
        </ul>
        {free.length > 0 && (
          <ShapeSelect
            aria-label="Add an existing entity as a superclass"
            value=""
            placeholder="Add an existing entity…"
            options={free}
            className="w-full"
            onChange={(entityId) => entityId && er.edits.addUnionSuperclass(union.id, entityId)}
          />
        )}
      </FormSection>
    </div>
  );
}
