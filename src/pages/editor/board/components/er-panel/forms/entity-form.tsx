import { GitFork, LocateFixed } from "lucide-react";

import { ER_ENTITY_COLOR, SHAPE_STROKES } from "@engine";
import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../../engine/engine-context";
import { useErDiagram, useErShapes } from "../../../engine/use-er-query";
import { CommitInput } from "../../db-panel/commit-input";
import { FlagToggle } from "../../db-panel/flag-toggle";
import { ColorSwatch } from "../../tool-options/color-swatch";
import { AttributeList } from "./attribute-list";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import type { EntityFormProps } from "./entity-form.types";

const COLORS = [
  { name: "Red", value: ER_ENTITY_COLOR },
  ...SHAPE_STROKES.filter((c) => c.value !== "transparent" && c.value !== ER_ENTITY_COLOR),
];

/** An entity: name, weak, outline color, attributes, and where it's used. */
export function EntityForm({ entity }: EntityFormProps) {
  const engine = useEngine();
  const er = useErDiagram();
  const shapes = useErShapes();
  const usedIn = [
    ...shapes.relations
      .filter((r) => r.participants.some((p) => p.entityId === entity.id))
      .map((r) => ({ id: r.id, label: `◇ ${r.name}` })),
    ...shapes.isas
      .filter((i) => i.parentId === entity.id || i.children.some((c) => c.entityId === entity.id))
      .map((i) => ({
        id: i.id,
        label: i.parentId === entity.id ? "▽ its hierarchy" : "▽ parent's hierarchy",
      })),
  ];

  return (
    <div className="space-y-4">
      <FormField label="Entity name">
        <CommitInput
          value={entity.name}
          onCommit={(name) =>
            name.trim() ? void er.edits.updateEntity(entity.id, { name: name.trim() }) : "Name it"
          }
        />
      </FormField>
      <div className="flex items-center justify-between gap-2">
        <FlagToggle
          label="Weak"
          title="Weak entity (double rectangle)"
          on={entity.weak}
          onToggle={() => er.edits.updateEntity(entity.id, { weak: !entity.weak })}
        />
        <div className="flex gap-0.5">
          {COLORS.map((color) => (
            <ColorSwatch
              key={color.value}
              label={color.name}
              color={color.value}
              selected={entity.color === color.value}
              onSelect={() => er.edits.updateEntity(entity.id, { color: color.value })}
            />
          ))}
        </div>
      </div>
      <AttributeList ownerId={entity.id} />
      <FormSection
        title="Used in"
        actions={
          <Button
            variant="ghost"
            size="sm"
            title="Specialize this entity into child entities (ES UN)"
            onClick={() => {
              const id = er.edits.addIsa(entity.id);
              if (id) engine.focusShape(id);
            }}
          >
            <GitFork />
            Add hierarchy
          </Button>
        }
      >
        {usedIn.length === 0 ? (
          <p className="text-xs text-muted-foreground">Not in any relation yet.</p>
        ) : (
          <ul>
            {usedIn.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-left text-sm hover:bg-hover"
                  onClick={() => engine.focusShape(item.id)}
                >
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <LocateFixed className="size-3.5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  );
}
