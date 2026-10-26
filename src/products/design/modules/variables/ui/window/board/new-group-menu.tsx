import { Palette, Plus, Ruler, SwatchBook, ToggleRight, Type } from "lucide-react";

import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { NUMBER_KINDS } from "../group-kinds";
import { freeGroup, joinPath } from "../group-paths";
import { scaleFromNumber } from "../scale-drafts";
import { draftFromColor } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { NewGroupMenuProps } from "./board.types";

/**
 * "+ New group", asking what it will hold: a color palette (separate colors), color shades (the
 * generator) or numbers of one kind (drawn and offered for it). Its first variable is selected.
 */
export function NewGroupMenu({ variant = "link" }: NewGroupMenuProps) {
  const { tokens, store, collection } = useBoard();
  const { select, setDraft, setScaleDraft } = useVariablesWindowStore();
  if (!collection) return null;
  const variables = store.variables(collection.id);
  const create = (group: string, spec: Parameters<typeof tokens.createVariable>[0]) =>
    select(
      tokens.createVariable({ ...spec, name: joinPath(freeGroup(variables, group), spec.name) }).id,
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 self-start rounded-md text-xs",
          variant === "primary"
            ? "h-8 bg-primary px-3.5 font-medium text-primary-foreground hover:bg-primary/90"
            : "h-7 px-1 text-muted-foreground hover:text-foreground",
        )}
      >
        <Plus className="size-3.5" /> New group
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Colors</DropdownMenuLabel>
        <DropdownMenuItem
          className="items-start"
          onSelect={() =>
            create("colors", {
              collectionId: collection.id,
              name: "color",
              type: "color",
              value: { color: "#9AA5B1FF" },
            })
          }
        >
          <Palette />
          <span className="flex flex-col">
            Color palette
            <span className="text-xs text-muted-foreground">
              Separate colors: brand, accent, surface…
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="items-start"
          onSelect={() => setDraft(draftFromColor(collection.id, freeGroup(variables, "shades")))}
        >
          <SwatchBook />
          <span className="flex flex-col">
            Color shades
            <span className="text-xs text-muted-foreground">
              Lighter and darker variants of one color
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Numbers</DropdownMenuLabel>
        <DropdownMenuItem
          className="items-start"
          onSelect={() =>
            setScaleDraft(
              scaleFromNumber(collection.id, freeGroup(variables, "scale"), ["gap", "padding"]),
            )
          }
        >
          <Ruler />
          <span className="flex flex-col">
            Number scale
            <span className="text-xs text-muted-foreground">
              Sizes from one base by a ratio: xs … 3xl
            </span>
          </span>
        </DropdownMenuItem>
        {NUMBER_KINDS.map((kind) => (
          <DropdownMenuItem
            key={kind.id}
            onSelect={() =>
              create(kind.group, {
                collectionId: collection.id,
                name: "base",
                type: "number",
                value: { number: kind.first },
                scopes: kind.scopes,
              })
            }
          >
            <span className="w-4 text-center text-xs text-muted-foreground">{kind.icon}</span>
            {kind.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Text and switches</DropdownMenuLabel>
        <DropdownMenuItem
          className="items-start"
          onSelect={() =>
            create("text", {
              collectionId: collection.id,
              name: "label",
              type: "string",
              value: { string: "Text" },
            })
          }
        >
          <Type />
          <span className="flex flex-col">
            Text
            <span className="text-xs text-muted-foreground">Labels, translations, font names</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="items-start"
          onSelect={() =>
            create("flags", {
              collectionId: collection.id,
              name: "flag",
              type: "boolean",
              value: { boolean: true },
            })
          }
        >
          <ToggleRight />
          <span className="flex flex-col">
            Boolean
            <span className="text-xs text-muted-foreground">Show or hide layers, clip content</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
