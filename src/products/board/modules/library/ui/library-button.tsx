import { Blocks } from "lucide-react";
import { useEffect } from "react";

import { ToolButton } from "@canvas-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { OPEN_LIBRARY } from "./library-command";
import { LibraryPanel } from "./library-panel";

/** The toolbar's last button: opens the library above the toolbar (also with its shortcut). */
export function LibraryButton() {
  const engine = useBoardEngine();
  const open = useBoardPanelStore((state) => state.libraryOpen);
  const setOpen = useBoardPanelStore((state) => state.setLibraryOpen);

  useEffect(
    () =>
      engine.handleHostAction(OPEN_LIBRARY.id, () => {
        const { libraryOpen, setLibraryOpen } = useBoardPanelStore.getState();
        setLibraryOpen(!libraryOpen);
      }),
    [engine],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolButton
          label={OPEN_LIBRARY.label}
          description="Templates, lists, widgets and board tools."
          shortcut={engine.keymap.label(OPEN_LIBRARY.id)}
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
