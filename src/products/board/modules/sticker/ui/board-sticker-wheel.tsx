import { useCallback } from "react";

import { StickerWheel } from "@canvas-ui";
import type { PickedSticker } from "@shared/core";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";

/** The sticker tool's options: the shared wheel, stamping with the board's sticker tool. */
export function BoardStickerWheel() {
  const engine = useBoardEngine();
  const activeId = useBoardState((state) => state.options.sticker?.sticker);
  const onPicked = useCallback(
    (sticker: PickedSticker) => engine.setToolOptions({ sticker }),
    [engine],
  );
  return <StickerWheel activeId={activeId} onPicked={onPicked} />;
}
