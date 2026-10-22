import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { deletePage, duplicatePage } from "./page-actions";
import type { PageMenuProps } from "./page-row.types";

/** A page's ⋯ menu: rename, duplicate and delete. */
export function PageMenu({ page, deletable, onRename }: PageMenuProps) {
  const engine = useDesignEngine();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${page.name} options`}
          title="Page options"
          onClick={(event) => event.stopPropagation()}
          className="flex size-5 cursor-pointer items-center justify-center rounded-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 data-[state=open]:opacity-100 [&_svg]:size-3.5"
        >
          <MoreHorizontal />
        </button>
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
