import { Blocks } from "lucide-react";
import { useEffect } from "react";

import { BOARD_HOST_COMMAND_LABELS, BOARD_HOST_COMMANDS } from "@board";
import { ToolButton } from "@canvas-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { useBoardEngine } from "../../board-engine-context";
import { useBoardPanelStore } from "../../stores/board-panel-store";
import { LibraryPanel } from "./library-panel";

/** The toolbar's last button: opens the library above the toolbar (also with its shortcut). */
export function LibraryButton() {
  const engine = useBoardEngine();
  const open = useBoardPanelStore((state) => state.libraryOpen);
  const setOpen = useBoardPanelStore((state) => state.setLibraryOpen);

  useEffect(
    () =>
      engine.handleHostAction(BOARD_HOST_COMMANDS.openLibrary, () => {
        const { libraryOpen, setLibraryOpen } = useBoardPanelStore.getState();
        setLibraryOpen(!libraryOpen);
      }),
    [engine],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolButton
          label={BOARD_HOST_COMMAND_LABELS.openLibrary}
          description="Templates, lists, widgets and board tools."
          shortcut={engine.keymap.label(BOARD_HOST_COMMANDS.openLibrary)}
          active={open}
        >
          <Blocks />
        </ToolButton>
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={10} className="w-[480px] p-0">
        <LibraryPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
