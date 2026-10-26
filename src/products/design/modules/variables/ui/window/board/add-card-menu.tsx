import { Plus } from "lucide-react";

import { leafName, joinPath } from "../group-paths";
import { NEW_NAMES, NEW_VALUES } from "../../scope-options";
import { numberKindOf } from "../group-kinds";
import { scaleFromVariable } from "../scale-drafts";
import { draftFromVariable } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import type { AddCardMenuProps } from "./board.types";

/**
 * The "+" card at the end of a group: a new color (separate, starting gray) or shades of the
 * group's main color; in a number group, a new number of its kind.
 */
export function AddCardMenu({ group, items }: AddCardMenuProps) {
  const { tokens, store, collection } = useBoard();
  const { select, setDraft, setScaleDraft } = useVariablesWindowStore();
  const first = items[0];
  if (!collection || !first) return null;
  const add = () => {
    const kind = first.type === "number" ? numberKindOf(first) : null;
    const variable = tokens.createVariable({
      collectionId: collection.id,
      name: joinPath(group, kind ? "new" : NEW_NAMES[first.type].toLowerCase()),
      type: first.type,
      value: kind ? { number: kind.first } : NEW_VALUES[first.type],
      scopes: kind?.scopes ?? first.scopes,
    });
    select(variable.id);
  };
  if (first.type === "string" || first.type === "boolean") {
    return (
      <button
        type="button"
        aria-label={`New ${first.type === "string" ? "text" : "boolean"}`}
        title={`New ${first.type === "string" ? "text" : "boolean"}`}
        onClick={add}
        className="grid min-h-23 place-items-center rounded-card border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
      >
        <Plus className="size-4" />
      </button>
    );
  }
  const anchor = items.find((v) => leafName(v) === "500") ?? first;
  const numberAnchor = items.find((v) => leafName(v) === "md") ?? first;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="grid min-h-23 place-items-center rounded-card border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
        <Plus className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {first.type === "number" ? (
          <>
            <DropdownMenuItem onSelect={add}>
              New {numberKindOf(first).label.toLowerCase()}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setScaleDraft(scaleFromVariable(store, numberAnchor.id))}
              className="flex-col items-start gap-0"
            >
              Make a scale from {leafName(numberAnchor)}
              <span className="text-xs text-muted-foreground">
                Smaller and larger steps by a ratio
              </span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onSelect={add} className="flex-col items-start gap-0">
              New color
              <span className="text-xs text-muted-foreground">A separate color, starting gray</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setDraft(draftFromVariable(store, anchor.id))}
              className="flex-col items-start gap-0"
            >
              Shades of {leafName(anchor)}
              <span className="text-xs text-muted-foreground">Its lighter and darker steps</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
