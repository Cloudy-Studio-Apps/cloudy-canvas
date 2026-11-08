import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { useDocVersion } from "../hooks/use-doc-version";
import { PlayerBar } from "./player-bar";
import type { PlayerDialogProps } from "./player-dialog.types";
import { PlayerFoot } from "./player-foot";
import { PlayerRun } from "./player-run";
import { playerShown } from "./player-shown";
import { PlayerStage } from "./player-stage";
import { usePlayerStore } from "./player-store";
import type { PlayerSurfaces } from "./player-surfaces.types";
import { ScreenPictures } from "./screen-pictures";
import { useHints } from "./use-hints";
import { usePlayerKeys } from "./use-player-keys";
import { t } from "../../prototype.i18n";

const NOTHING: PlayerSurfaces = { base: null, overlays: [] };

/**
 * The player, over the whole window: the bar, the flow playing in its device, the hint. It reads
 * the document as it changes and closes once its flow is gone; its pictures are revoked on close.
 */
export function PlayerDialog({ target }: PlayerDialogProps) {
  const engine = useDesignEngine();
  useDocVersion();
  const close = usePlayerStore((state) => state.close);
  const [pictures] = useState(() => new ScreenPictures(engine));
  const [run] = useState(() => new PlayerRun(engine, target, pictures));
  useEffect(() => run.attach(), [run]);
  useEffect(() => () => pictures.clear(), [pictures]);
  const view = useSyncExternalStore(run.subscribe, run.snapshot);
  const shown = playerShown(engine, target.flow, view);
  const hints = useHints(shown?.flow.hints ?? false);
  usePlayerKeys({
    run,
    surfaces: shown?.surfaces ?? NOTHING,
    onClose: close,
    onToggleHints: hints.toggle,
  });
  const gone = shown === null;
  useEffect(() => {
    if (gone) close();
  }, [gone, close]);
  // Keys go to the player, not to whatever had the focus in the editor.
  const focus = useCallback((el: HTMLDivElement | null) => el?.focus(), []);
  if (!shown) return null;

  const { flow, flows, device, surfaces, address } = shown;
  const { stack, overlays } = view.state;
  return (
    <div
      ref={focus}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={t("player.label", { name: flow.name })}
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-background outline-none"
    >
      <PlayerBar
        flow={flow}
        flows={flows}
        run={run}
        canGoBack={stack.length > 1 || overlays.length > 0}
        pinned={hints.pinned}
        onToggleHints={hints.toggle}
        onClose={close}
      />
      <PlayerStage
        flow={flow}
        run={run}
        surfaces={surfaces}
        device={device}
        address={address}
        pictures={pictures}
        hints={hints.shown}
        onMiss={hints.flash}
      />
      <PlayerFoot flow={flow} />
    </div>
  );
}
