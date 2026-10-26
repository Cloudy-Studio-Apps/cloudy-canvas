import { Plus } from "lucide-react";

import { erAddActions } from "../../model/er-add-actions";
import { gateOf } from "../../model/standard-of";
import type { ErPaletteItemId } from "../../model/er-drop.types";
import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine } from "@canvas-ui";
import { useErDiagram, useErShape, useErShapes, useErSelection } from "../model";

const MENU_ITEMS: readonly ErPaletteItemId[] = [
  "entity",
  "relation",
  "isa",
  "aggregate",
  "constraint",
];

/**
 * Adds ER shapes to the shown diagram without typing: each starts from the selection where it
 * makes sense (`erAddActions`), is placed automatically and then selected so its form opens.
 */
export function ErAddMenu() {
  const engine = useEngine();
  const { edits } = useErDiagram();
  const selected = useErShape(useErSelection().id ?? "");
  const shapes = useErShapes();
  const actions = erAddActions(edits, shapes, selected, gateOf(shapes));
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
        {MENU_ITEMS.map((id) => {
          const action = actions[id];
          return (
            <DropdownMenuItem
              key={id}
              disabled={action.disabled}
              onSelect={() => focus(action.run())}
            >
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
