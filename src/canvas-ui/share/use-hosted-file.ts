import { useEffect, useMemo } from "react";

import type { CanvasEngine } from "@canvas";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { toast } from "@shared/stores/toast-store";
import type { CanvasFileContextValue } from "../file";
import { isSharing, stopSharing, useHostedSession } from "./host-session";
import { useRoomPresence } from "./use-room-presence";
import { t } from "./share.i18n";

/**
 * The open file, marked live while this app shares it, with the session's presence. Closing the
 * editor of a shared file ends the session.
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
      if (!isSharing(id)) return;
      void stopSharing();
      toast({
        title: t("hostedStopped.title"),
        description: t("hostedStopped.description"),
      });
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
