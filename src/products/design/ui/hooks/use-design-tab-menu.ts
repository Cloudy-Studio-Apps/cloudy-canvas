import { useEngine, useEditorModules, useTabMenu } from "@canvas-ui";
import { designEditor } from "../modules";

/** Gives the design's tab its main menu (the modules' `mainMenu` groups) for the title bar's seal. */
export function useDesignTabMenu(): void {
  const engine = useEngine();
  const { host } = useEditorModules();
  useTabMenu(engine, host.get(designEditor.mainMenu));
}
