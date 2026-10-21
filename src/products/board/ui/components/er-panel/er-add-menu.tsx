import { Plus } from "lucide-react";

import type { ErElement, ErShapes } from "@board";
import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine } from "@canvas-ui";
import { useErDiagram, useErShape, useErShapes, useErSelection } from "../../er";

/**
 * Adds ER shapes to the shown diagram without typing: each starts from the selection where it makes sense (a relation
 * from the selected entity, a hierarchy under it, an aggregation round the selected relation), is
 * placed automatically and then selected so its form opens.
 */
export function ErAddMenu() {
  const engine = useEngine();
  const { edits } = useErDiagram();
  const selectedId = useErSelection().id;
  const selected = useErShape(selectedId ?? "");
  const shapes = useErShapes();
  const entity = pick(selected, "er-entity") ?? shapes.entities[0];
  const relation = pick(selected, "er-relation") ?? shapes.relations[0];
  const otherRelation = shapes.relations.find((r) => r.id !== relation?.id);
  const focus = (id: string | undefined) => id && engine.focusElement(id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus />
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuItem onSelect={() => focus(edits.addEntity())}>Entity</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => focus(edits.addRelation(relationEnds(shapes, entity)))}>
          Relation{entity ? ` from ${entity.name}` : ""}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!entity}
          onSelect={() => entity && focus(edits.addIsa(entity.id))}
        >
          Hierarchy{entity ? ` under ${entity.name}` : ""}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!relation}
          onSelect={() => relation && focus(edits.addAggregate(relation.id))}
        >
          Aggregation{relation ? ` of ${relation.name}` : ""}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!relation || !otherRelation}
          onSelect={() =>
            relation &&
            otherRelation &&
            focus(edits.addConstraint("exclusion", relation.id, otherRelation.id))
          }
        >
          Constraint between relations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function pick<T extends ErElement["type"]>(
  shape: ErElement | undefined,
  type: T,
): Extract<ErElement, { type: T }> | undefined {
  return shape?.type === type ? (shape as Extract<ErElement, { type: T }>) : undefined;
}

/** A new relation joins the chosen entity and the next one (or just it, on a one-entity board). */
function relationEnds(shapes: ErShapes, entity: ErElement | undefined): string[] {
  if (!entity) return [];
  const other = shapes.entities.find((e) => e.id !== entity.id);
  return other ? [entity.id, other.id] : [entity.id];
}
