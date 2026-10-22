import { defineModule } from "@shared/core";
import { BUILT_IN_ITEMS, BUILT_IN_SECTIONS } from "@board/ui/components/library/library-catalog";
import { OPEN_LIBRARY } from "@board/ui/components/library/library-command";
import { boardLibrary } from "@board/ui/components/library/library-points";
import { boardCanvas } from "../../board-points";

/**
 * The library of widgets, templates and more (the panel is the toolbar's last button): the command
 * that opens it (Shift+I) and its built-in sections and items. Tools are listed by their entries.
 */
export const libraryModule = defineModule({
  id: "library",
  register(host) {
    host.contribute(boardCanvas.hostCommands, {
      ...OPEN_LIBRARY,
      keys: [{ key: "i", shift: true }],
    });
    host.contribute(boardLibrary.sections, ...BUILT_IN_SECTIONS);
    host.contribute(boardLibrary.items, ...BUILT_IN_ITEMS);
  },
});
