import { useCallback, useEffect, useRef, useState } from "react";

import { encodeBoardFile, type BoardEngine } from "@board";
import { useDocumentMeta } from "@canvas-ui";
import type { FileInfo } from "@shared/core";
import { saveCanvasFileDialog, storage } from "@platform";
import { useAutosaveStore } from "@shared/stores/autosave-store";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError } from "@shared/stores/toast-store";
import { useUnsavedChangesStore } from "@shared/stores/unsaved-changes-store";
import { useBoardAutosave } from "./use-board-autosave";
import type { BoardFileContextValue, SaveKind, SaveStatus } from "./board-file-context.types";

const UNTITLED = "Untitled board";
/** How long the top bar shows that the board was just saved. */
const SAVED_NOTICE_MS = 3000;

/**
 * Saves the board to its `.cboard` file (asking where the first time), autosaves it after changes
 * (as a draft in the app data while it has no file) and tracks unsaved changes.
 */
export function useBoardSaver(
  id: string,
  engine: BoardEngine,
  initialInfo: FileInfo | null,
): BoardFileContextValue {
  const [info, setInfo] = useState(initialInfo);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saved, setSaved] = useState<SaveKind | null>(null);
  const autosaveEnabled = useAutosaveStore((state) => state.enabled);
  const meta = useDocumentMeta(engine.doc);

  const infoRef = useRef(info);
  /** Counts document changes, so a change made while saving keeps the board dirty. */
  const revision = useRef(0);
  const savedRevision = useRef(0);
  /** Saves run one after another. */
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  /** A failed autosave is reported once, until a save works again. */
  const autosaveFailed = useRef(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () =>
      // Any change, metadata included, needs saving.
      engine.doc.onChange(() => {
        revision.current += 1;
        setDirty(true);
      }),
    [engine],
  );

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  useEffect(() => {
    const { setDirty: setAppDirty } = useUnsavedChangesStore.getState();
    // Autosave flushes when the editor closes, so only a board it can't save needs a warning.
    setAppDirty(dirty && (!autosaveEnabled || status === "error"));
    return () => setAppDirty(false);
  }, [dirty, autosaveEnabled, status]);

  /** Writes the board to `path`, or to its draft when `path` is `null`. */
  const write = useCallback(
    (path: string | null, kind: SaveKind): Promise<void> => {
      // Encoded now, so a save queued as the editor closes still has the document.
      const data = encodeBoardFile(engine.doc.encode());
      const fileMeta = engine.doc.meta();
      const at = revision.current;
      const run = queue.current.then(async () => {
        setStatus("saving");
        try {
          const file = path
            ? await storage.save(id, path, data, fileMeta)
            : await storage.saveDraft(id, fileMeta.title || UNTITLED, "board", data, fileMeta);
          infoRef.current = file;
          setInfo(file);
          savedRevision.current = Math.max(savedRevision.current, at);
          setDirty(revision.current !== savedRevision.current);
          setStatus("idle");
          autosaveFailed.current = false;
          useRecentFilesStore.getState().upsert(file);
          setSaved(kind);
          clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setSaved(null), SAVED_NOTICE_MS);
        } catch (error) {
          if (kind === "manual" || !autosaveFailed.current) {
            notifyError("The board couldn't be saved", error);
          }
          if (kind === "auto") autosaveFailed.current = true;
          setStatus("error");
        }
      });
      queue.current = run;
      return run;
    },
    [engine, id],
  );

  const save = useCallback(
    async (asNew: boolean) => {
      const current = infoRef.current;
      const path =
        !asNew && current && !current.draft
          ? current.path
          : await saveCanvasFileDialog(
              "board",
              engine.doc.meta().title || (current?.name ?? UNTITLED),
            );
      if (path) await write(path, "manual");
    },
    [engine, write],
  );

  const autosave = useCallback(async () => {
    if (revision.current === savedRevision.current) return;
    const current = infoRef.current;
    await write(current && !current.draft ? current.path : null, "auto");
  }, [write]);

  useBoardAutosave(engine, autosave, autosaveEnabled);

  const saveFile = useCallback(() => save(false), [save]);
  const saveFileAs = useCallback(() => save(true), [save]);

  useEffect(() => {
    const removeSave = engine.handleHostAction("save", () => void save(false));
    const removeSaveAs = engine.handleHostAction("saveAs", () => void save(true));
    return () => {
      removeSave();
      removeSaveAs();
    };
  }, [engine, save]);

  const draft = info?.draft === true;
  return {
    name: meta.title || (info?.name ?? UNTITLED),
    fileName: info?.name ?? UNTITLED,
    title: meta.title,
    description: meta.description,
    path: info && !draft ? info.path : null,
    draft,
    dirty,
    status,
    saved,
    autosave: autosaveEnabled,
    save: saveFile,
    saveAs: saveFileAs,
  };
}
