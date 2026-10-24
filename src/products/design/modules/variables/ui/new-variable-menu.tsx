import { Hash, Palette, Plus } from "lucide-react";

import type { VariableType } from "@canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useCreateVariable } from "./use-create-variable";
import type { NewVariableMenuProps } from "./variables-ui.types";

/** "+": a new color or number variable (in a new collection when the file has none). */
export function NewVariableMenu({ onCreated, collectionId, group }: NewVariableMenuProps) {
  const createVariable = useCreateVariable();
  const create = (type: VariableType) => {
    const id = createVariable(type, collectionId, group);
    if (id) onCreated(id);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Add variable"
        title="Add variable"
        className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
      >
        <Plus />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => create("color")}>
          <Palette /> Color
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => create("number")}>
          <Hash /> Number
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
