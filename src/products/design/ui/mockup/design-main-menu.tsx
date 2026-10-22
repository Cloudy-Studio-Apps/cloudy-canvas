import { FilePlus, FolderOpen, House, Download, Save, Settings } from "lucide-react";
import { useNavigate } from "react-router";

import { SealLogo } from "@shared/ui/brand/seal-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import type { DesignMainMenuProps } from "./design-main-menu.types";

/** The logo button at the top of the rail: opens the app menu (file, edit, view, home). */
export function DesignMainMenu({ onHome }: DesignMainMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Main menu"
          className="mb-2 flex size-9 cursor-pointer items-center justify-center rounded-md hover:bg-hover data-[state=open]:bg-hover"
        >
          <SealLogo size={22} variant="mark" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-56">
        <DropdownMenuItem onSelect={onHome}>
          <House />
          Back to home
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>File</DropdownMenuLabel>
        <DropdownMenuItem>
          <FilePlus />
          New design
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FolderOpen />
          Open…
          <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Save />
          Save
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download />
          Export…
          <DropdownMenuShortcut>Ctrl+Shift+E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Edit</DropdownMenuLabel>
        <DropdownMenuItem>
          Undo
          <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Redo
          <DropdownMenuShortcut>Ctrl+Shift+Z</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>View</DropdownMenuLabel>
        <DropdownMenuItem>
          Zoom to fit
          <DropdownMenuShortcut>Shift+1</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Show rulers
          <DropdownMenuShortcut>Shift+R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void navigate("/settings")}>
          <Settings />
          Settings
          <DropdownMenuShortcut>Ctrl+,</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
