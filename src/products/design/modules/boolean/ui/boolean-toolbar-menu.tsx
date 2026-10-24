import { useState } from "react";
import { ChevronDown, Combine, Spline } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import {
  BOOLEAN_OPERATIONS,
  BOOLEAN_TYPE,
  type BooleanElement,
  type BooleanOperation,
} from "@design";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useSelectedNodes } from "@design/ui/hooks";
import { BOOLEAN_COMMANDS, BOOLEAN_ICONS } from "./boolean-icons";

/**
 * The toolbar's boolean button, as in Figma: the operation picked last (a selected boolean's own)
 * and a menu of the four, Flatten and Outline stroke, with their shortcuts.
 */
export function BooleanToolbarMenu() {
  const engine = useDesignEngine();
  const nodes = useSelectedNodes();
  const [last, setLast] = useState<BooleanOperation>("union");
  if (nodes.length === 0) return null;
  const [only] = nodes;
  const current =
    nodes.length === 1 && only?.type === BOOLEAN_TYPE ? (only as BooleanElement).operation : last;
  const shown = BOOLEAN_OPERATIONS.find((entry) => entry.operation === current)!;
  const Icon = BOOLEAN_ICONS[current];
  const run = (command: string) => engine.commands[command]?.();
  const pick = (operation: BooleanOperation) => {
    setLast(operation);
    run(BOOLEAN_COMMANDS[operation]);
  };

  return (
    <div className="flex items-center">
      <ToolButton
        label={shown.label}
        description="Combine the selected layers into one shape."
        shortcut={engine.keymap.label(BOOLEAN_COMMANDS[current])}
        disabled={nodes.length < 2 && only?.type !== BOOLEAN_TYPE}
        onClick={() => pick(current)}
      >
        <Icon />
      </ToolButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the split button's chevron */}
          <button
            type="button"
            aria-label="Boolean operations"
            className="flex h-9 w-3.5 cursor-pointer items-center justify-center rounded-sm text-subtle-foreground hover:bg-hover hover:text-foreground data-[state=open]:bg-hover"
          >
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="min-w-52">
          {BOOLEAN_OPERATIONS.map(({ operation, label }) => {
            const ItemIcon = BOOLEAN_ICONS[operation];
            return (
              <DropdownMenuItem key={operation} onSelect={() => pick(operation)}>
                <ItemIcon />
                {label}
                <DropdownMenuShortcut>
                  {engine.keymap.label(BOOLEAN_COMMANDS[operation])}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => run("flatten")}>
            <Combine />
            Flatten
            <DropdownMenuShortcut>{engine.keymap.label("flatten")}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => run("outlineStroke")}>
            <Spline />
            Outline stroke
            <DropdownMenuShortcut>{engine.keymap.label("outlineStroke")}</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
