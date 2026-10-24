import { useEffect, useMemo } from "react";

import type { CanvasEngine, ShareGuest } from "@canvas";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { toast } from "@shared/stores/toast-store";
import type { CanvasFileContextValue } from "../file";
import { useDocumentMeta } from "../use-document-meta";
import { useRoomPresence } from "./use-room-presence";
import { useStoreState } from "./use-store-state";

/**
 * The file of a live session joined as a guest: named and identified as the host's (so everyone's
 * presence matches it), never saved here (Save and Save as say so: the host saves it), and
 * read-only while the guest only views it.
 */
export function useLiveGuestFile<O extends object>(
  guest: ShareGuest,
  engine: CanvasEngine<O>,
  noun: string,
): CanvasFileContextValue {
  const { file, role, host } = useStoreState(guest.state);
  const meta = useDocumentMeta(engine.doc);
  const hostName = host?.name ?? "The host";
  const name = useCollaborationStore((s) => s.name);
  const color = useCollaborationStore((s) => s.color);
  const identity = useMemo(() => ({ name, color }), [name, color]);
  useRoomPresence(guest.awareness, engine, file?.fileId ?? "", identity);

  // A viewer's own edits would never reach the host: the document takes none.
  useEffect(() => engine.doc.setReadOnly(role !== "edit"), [engine, role]);

  useEffect(() => {
    const explain = () =>
      toast({
        title: `${hostName} saves this ${noun}`,
        description: "It's their file: changes made in the session are saved on their computer.",
      });
    const removeSave = engine.handleHostAction("save", explain);
    const removeSaveAs = engine.handleHostAction("saveAs", explain);
    return () => {
      removeSave();
      removeSaveAs();
    };
  }, [engine, hostName, noun]);

  return useMemo(() => {
    const fileName = file?.fileName ?? `Shared ${noun}`;
    const nothing = () => Promise.resolve(false);
    return {
      id: file?.fileId ?? "",
      name: meta.title || fileName,
      fileName,
      title: meta.title,
      description: meta.description,
      noun,
      path: null,
      draft: false,
      dirty: false,
      status: "idle",
      saved: null,
      autosave: false,
      save: nothing,
      saveAs: nothing,
      live: {
        side: "guest",
        role: role ?? "view",
        host: host ?? { name: hostName, color: "#7c8a99" },
      },
    };
  }, [file, meta, noun, role, host, hostName]);
}
