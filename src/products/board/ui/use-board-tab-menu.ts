import { useEngine, useEditorModules, useTabMenu } from "@canvas-ui";
import { boardEditor } from "./modules";

/** Gives the board's tab its main menu (the modules' `mainMenu` groups) for the title bar's seal. */
export function useBoardTabMenu(): void {
  const engine = useEngine();
  const { host } = useEditorModules();
  useTabMenu(engine, host.get(boardEditor.mainMenu));
}
