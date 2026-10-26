import { Plus } from "lucide-react";

import { useDocumentTokens } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { NEW_COLOR } from "./new-color";

/** The colors panel's "+": a color (in the first collection, "Colors" when there's none) or a collection. */
export function AddMenu() {
  const { tokens } = useDocumentTokens();
  const addColor = () => {
    const collection = tokens.store().collections()[0] ?? tokens.createCollection("Colors");
    tokens.createVariable({ ...NEW_COLOR, collectionId: collection.id });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label="Add" size="sm">
          <Plus />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={addColor}>New color</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => tokens.createCollection("Colors")}>
          New collection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
