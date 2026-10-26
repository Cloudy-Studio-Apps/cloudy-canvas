import { GitFork, LocateFixed } from "lucide-react";

import { ER_ENTITY_COLOR, SHAPE_STROKES } from "../../../../../palette";
import { Button } from "@shared/ui/components/ui/button";
import { ListRow } from "@shared/ui/kit";
import { ColorPalette, CommitInput, useEngine } from "@canvas-ui";
import { lockedOn, useErDiagram, useErGate, useErShapes } from "../../model";
import { FlagToggle } from "../../../../db/ui";
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
  const gate = useErGate();
  const lock = (construct: string, on: boolean) => lockedOn(gate, construct, on);
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
          title={lock("weak-entities", entity.weak).reason || "Weak entity (double rectangle)"}
          on={entity.weak}
          disabled={lock("weak-entities", entity.weak).disabled}
          onToggle={() => er.edits.updateEntity(entity.id, { weak: !entity.weak })}
        />
        <div className="flex gap-0.5">
          <ColorPalette
            colors={COLORS}
            value={entity.color}
            onSelect={(color) => er.edits.updateEntity(entity.id, { color })}
          />
        </div>
      </div>
      <AttributeList ownerId={entity.id} />
      <FormSection
        title="Used in"
        actions={
          <Button
            variant="ghost"
            size="sm"
            title={
              gate.reason("hierarchies") || "Specialize this entity into child entities (ES UN)"
            }
            disabled={!gate.allows("hierarchies")}
            onClick={() => {
              const id = er.edits.addIsa(entity.id);
              if (id) engine.focusElement(id);
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
                <ListRow
                  size="md"
                  onSelect={() => engine.focusElement(item.id)}
                  label={item.label}
                  meta={<LocateFixed className="size-3.5" />}
                />
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  );
}
