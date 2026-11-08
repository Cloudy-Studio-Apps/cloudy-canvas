import { useEffect } from "react";

import { useModelEditStore } from "@canvas-ui";
import { useBoardEngine } from "@board/ui/board-engine-context";
import {
  CONVERT_MODEL_COMMAND,
  EDIT_MODEL_COMMAND,
  PLACE_MODEL_COMMAND,
} from "../model3d.commands";
import { placeModelFile } from "./place-model-file";
import { selectedModel } from "./selected-model";
import { useConvertStore } from "./convert-store";

/** The model commands (context menu and the canvas menu's Place 3D model…). */
export function useModelCommands(): void {
  const engine = useBoardEngine();
  useEffect(() => {
    const stops = [
      engine.handleHostAction(EDIT_MODEL_COMMAND, () => {
        const el = selectedModel(engine);
        if (el) useModelEditStore.getState().start(engine, el.id, el);
      }),
      engine.handleHostAction(CONVERT_MODEL_COMMAND, () => {
        const el = selectedModel(engine);
        if (el) useConvertStore.getState().ask(el.id);
      }),
      engine.handleHostAction(PLACE_MODEL_COMMAND, () => void placeModelFile(engine)),
    ];
    return () => stops.forEach((stop) => stop());
  }, [engine]);
}
