import { useEffect } from "react";

import { useModelEditStore } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { CONVERT_MODEL_COMMAND, EDIT_MODEL_COMMAND } from "../model3d.commands";
import { selectedModel } from "./selected-model";
import { useConvertStore } from "./convert-store";

/** The model commands of the context menu: Edit in 3D and Convert to PNG (which asks first). */
export function useModelCommands(): void {
  const engine = useDesignEngine();
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
    ];
    return () => stops.forEach((stop) => stop());
  }, [engine]);
}
