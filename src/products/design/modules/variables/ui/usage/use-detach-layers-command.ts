import { useEffect } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";

/** The host command that unlinks the selected layers from every variable and style they use. */
export const DETACH_LAYERS_COMMAND = "detachLayerVariables";

/**
 * Runs "Detach variables and styles" (a session hook): the selected layers stop using their
 * variables and styles and keep what they show, in one undo step.
 */
export function useDetachLayersCommand(): void {
  const engine = useDesignEngine();
  useEffect(
    () =>
      engine.handleHostAction(DETACH_LAYERS_COMMAND, () => {
        const count = engine.service(DOCUMENT_TOKENS).detachLayers(engine.selectedIds());
        toast({
          title:
            count > 0
              ? `Unlinked ${count} ${count === 1 ? "field" : "fields"}`
              : "Nothing to unlink",
        });
      }),
    [engine],
  );
}
