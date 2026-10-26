import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { deletePage, duplicatePage } from "./page-actions";
import type { PageMenuProps } from "./page-row.types";

/** A page's ⋯ menu: rename, duplicate and delete. */
export function PageMenu({ page, deletable, onRename }: PageMenuProps) {
  const engine = useDesignEngine();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          size="xs"
          className="size-5 rounded-xs"
          label={`${page.name} options`}
          title="Page options"
          tooltip={false}
          revealOnHover
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-40"
        // React events bubble out of the portal: the row mustn't take them as its own clicks.
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => duplicatePage(engine, page.id)}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!deletable}
          onSelect={() => deletePage(engine, page.id)}
          className="text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
