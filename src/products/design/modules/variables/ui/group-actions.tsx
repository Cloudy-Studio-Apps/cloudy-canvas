import { Pencil } from "lucide-react";

import { DOCUMENT_TOKENS } from "@canvas";
import { CommitInput } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import { NewVariableMenu } from "./new-variable-menu";
import type { GroupActionsProps } from "./variables-ui.types";

/** A group's header buttons: add a variable in it, rename it (moving what's in it). */
export function GroupActions({ collectionId, group, onCreated }: GroupActionsProps) {
  const engine = useDesignEngine();
  return (
    <div className="flex items-center opacity-0 group-hover/token-group:opacity-100 focus-within:opacity-100">
      <NewVariableMenu collectionId={collectionId} group={group.path} onCreated={onCreated} />
      <Popover>
        <PopoverTrigger
          aria-label="Rename group"
          title="Rename group"
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
        >
          <Pencil />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-2">
          <CommitInput
            autoFocus
            aria-label="Group name"
            value={group.path}
            onCommit={(to) =>
              engine.service(DOCUMENT_TOKENS).renameGroup(collectionId, group.path, to)
            }
            className="h-7 text-xs"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
