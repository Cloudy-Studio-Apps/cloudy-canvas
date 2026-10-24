import { useCallback } from "react";

import { StickerWheel } from "@canvas-ui";
import type { PickedSticker } from "@shared/core";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";

/** The sticker tool's options: the shared wheel, stamping with the design's sticker tool. */
export function DesignStickerWheel() {
  const engine = useDesignEngine();
  const activeId = useDesignState((state) => state.options.sticker?.sticker);
  const onPicked = useCallback(
    (sticker: PickedSticker) => engine.setToolOptions({ sticker }),
    [engine],
  );
  return <StickerWheel activeId={activeId} onPicked={onPicked} />;
}
