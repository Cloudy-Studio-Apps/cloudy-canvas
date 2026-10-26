import { defineModule } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { BUILT_IN_ITEMS, BUILT_IN_SECTIONS } from "./ui/library-catalog";
import { OPEN_LIBRARY } from "./ui/library-command";
import { boardLibrary } from "./ui/library.points";

/**
 * The library of widgets, templates and more (the panel is the toolbar's last button): the command
 * that opens it (Shift+I) and its built-in sections and items. Tools are listed by their entries.
 */
export const libraryModule = defineModule({
  id: "library",
  tier: "core",
  register(host) {
    host.contribute(boardCanvas.hostCommands, {
      ...OPEN_LIBRARY,
      keys: [{ key: "i", shift: true }],
    });
    host.contribute(boardLibrary.sections, ...BUILT_IN_SECTIONS);
    host.contribute(boardLibrary.items, ...BUILT_IN_ITEMS);
  },
});
