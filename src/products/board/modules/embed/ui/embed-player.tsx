import { useCallback, useEffect, useState } from "react";

import { EMBED_ACTIONS, embedOf } from "@board";
import { openExternal } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { EmbedPlayerFrame } from "./embed-player-frame";

/**
 * Handles link cards' buttons: "open" opens the link in the browser, "play" plays the video in
 * place. One video plays at a time, and no player exists until one is played.
 */
export function EmbedPlayer() {
  const engine = useBoardEngine();
  const [playing, setPlaying] = useState<string | null>(null);
  const stop = useCallback(() => setPlaying(null), []);

  useEffect(
    () =>
      engine.onElementAction(({ elementId, action }) => {
        const card = embedOf(engine.getElement(elementId));
        if (!card) return;
        if (action === EMBED_ACTIONS.play) setPlaying(elementId);
        else if (action === EMBED_ACTIONS.open) {
          void openExternal(card.url).catch((error: unknown) =>
            notifyError("The link couldn't be opened", error),
          );
        }
      }),
    [engine],
  );

  return playing ? <EmbedPlayerFrame key={playing} elementId={playing} onClose={stop} /> : null;
}
