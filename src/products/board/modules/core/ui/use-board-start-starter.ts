import { useEditorModules, useStartStarter } from "@canvas-ui";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { boardStarters } from "./core.points";

/** Fills a new board with the starter its link asks for (`/board/<id>?starter=retro`). */
export function useBoardStartStarter(): void {
  useStartStarter(useBoardEngine(), useEditorModules().host.get(boardStarters));
}
