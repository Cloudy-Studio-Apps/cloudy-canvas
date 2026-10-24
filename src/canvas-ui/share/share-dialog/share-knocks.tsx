import { createPortal } from "react-dom";

import { KnockCard } from "./knock-card";
import type { ShareKnocksProps } from "./share-dialog.types";
import { useStoreState } from "../use-store-state";

/** The people asking to join, as cards in the window's corner until the host answers. */
export function ShareKnocks({ host }: ShareKnocksProps) {
  const { knocks } = useStoreState(host.state);
  if (knocks.length === 0) return null;
  return createPortal(
    <div className="pointer-events-none fixed bottom-20 left-4 z-50 flex w-80 flex-col gap-2">
      {knocks.map((knock) => (
        <KnockCard key={knock.peer} host={host} knock={knock} />
      ))}
    </div>,
    document.body,
  );
}
