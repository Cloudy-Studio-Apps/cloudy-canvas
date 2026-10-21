import { useCallback, useEffect, useState } from "react";

import { encodeBoardFile, type BoardEngine } from "@board";
import type { FileInfo } from "@shared/core";
import { saveCanvasFileDialog, storage } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import type { BoardFileContextValue, SaveStatus } from "./board-file-context.types";

const UNTITLED = "Untitled board";

/** Saves the board to its `.cboard` file (asking where the first time) and tracks unsaved changes. */
export function useBoardSaver(
  id: string,
  engine: BoardEngine,
  initialInfo: FileInfo | null,
): BoardFileContextValue {
  const [info, setInfo] = useState(initialInfo);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");

  useEffect(() => engine.doc.observe(() => setDirty(true)), [engine]);

  const save = useCallback(
    async (asNew: boolean) => {
      const path =
        !asNew && info ? info.path : await saveCanvasFileDialog("board", info?.name ?? UNTITLED);
      if (!path) return;
      setStatus("saving");
      try {
        const saved = await storage.save(id, path, encodeBoardFile(engine.doc.encode()));
        setInfo(saved);
        setDirty(false);
        setStatus("idle");
        useRecentFilesStore.getState().upsert(saved);
      } catch (error) {
        console.error("[board] Failed to save:", error);
        setStatus("error");
      }
    },
    [engine, id, info],
  );

  const saveFile = useCallback(() => save(false), [save]);
  const saveFileAs = useCallback(() => save(true), [save]);

  useEffect(() => {
    engine.setHostActions({ save: () => void save(false), saveAs: () => void save(true) });
    return () => engine.setHostActions({});
  }, [engine, save]);

  return {
    name: info?.name ?? UNTITLED,
    path: info?.path ?? null,
    dirty,
    status,
    save: saveFile,
    saveAs: saveFileAs,
  };
}
