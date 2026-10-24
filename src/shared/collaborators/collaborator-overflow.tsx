import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { CollaboratorList } from "./collaborator-list";
import type { CollaboratorOverflowProps } from "./collaborator-overflow.types";

/** The stack's "+N" circle: opens the list of every collaborator, as in Figma. */
export function CollaboratorOverflow({ count, followable, side }: CollaboratorOverflowProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the "+N" avatar */}
        <button
          type="button"
          className="relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted text-[10px] font-semibold text-foreground ring-2 ring-surface hover:z-20 hover:bg-hover focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={`${count} more collaborators`}
        >
          +{count}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="w-72">
        <CollaboratorList followable={followable} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
