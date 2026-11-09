import { useEffect, useMemo } from "react";

import type { CanvasEngine } from "@canvas";
import { tabsSupported } from "@platform";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import type { CanvasFileContextValue } from "../file";
import { endSharing, useHostedSession } from "./host-session";
import { useRoomPresence } from "./use-room-presence";

/**
 * The open file, marked live while this app shares it, with the session's presence. On desktop the
 * session outlives the editor (its tab keeps the document connected in the background): it ends
 * when the user stops it or the tab closes (`closeTab`, `app/tabs/`). Where there are no tabs
 * (Android), closing the editor of a shared file ends the session.
 */
export function useHostedFile<O extends object>(
  file: CanvasFileContextValue,
  engine: CanvasEngine<O>,
): CanvasFileContextValue {
  const host = useHostedSession(file.id);
  const name = useCollaborationStore((s) => s.name);
  const color = useCollaborationStore((s) => s.color);
  const identity = useMemo(() => ({ name, color }), [name, color]);
  useRoomPresence(host?.awareness ?? null, engine, file.id, identity);

  const { id } = file;
  useEffect(
    () => () => {
      if (!tabsSupported()) void endSharing(id);
    },
    [id],
  );

  return useMemo(
    () =>
      host
        ? { ...file, live: { side: "host" as const, role: "edit" as const, host: identity } }
        : file,
    [file, host, identity],
  );
}
