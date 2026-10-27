import { tCommon } from "@shared/core";
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
import { t } from "../pages.i18n";

/** A page's ⋯ menu: rename, duplicate and delete. */
export function PageMenu({ page, deletable, onRename }: PageMenuProps) {
  const engine = useDesignEngine();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          size="xs"
          className="size-5 rounded-xs"
          label={t("list.options", { name: page.name })}
          title={t("list.optionsTitle")}
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
        <DropdownMenuItem onSelect={onRename}>{tCommon("rename")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => duplicatePage(engine, page.id)}>
          {tCommon("duplicate")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!deletable}
          onSelect={() => deletePage(engine, page.id)}
          className="text-destructive"
        >
          {tCommon("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
