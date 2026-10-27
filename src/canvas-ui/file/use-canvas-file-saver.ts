import { useCallback, useEffect, useRef, useState } from "react";

import type { CanvasEngine } from "@canvas";
import type { FileInfo } from "@shared/core";
import { saveCanvasFileDialog, storage } from "@platform";
import { useAutosaveStore } from "@shared/stores/autosave-store";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError } from "@shared/stores/toast-store";
import { useUnsavedChangesStore } from "@shared/stores/unsaved-changes-store";
import { useDocumentMeta } from "../use-document-meta";
import type {
  CanvasFileContextValue,
  CanvasFileFormat,
  SaveKind,
  SaveStatus,
} from "./canvas-file.types";
import { useCanvasAutosave } from "./use-canvas-autosave";
import { t } from "./file.i18n";

/** How long the top bar shows that the file was just saved. */
const SAVED_NOTICE_MS = 3000;

/**
 * Saves the document to its file in the product's `format` (asking where the first time), autosaves
 * it after changes (as a draft in the app data while it has no file) and tracks unsaved changes.
 */
export function useCanvasFileSaver<O extends object>(
  id: string,
  engine: CanvasEngine<O>,
  initialInfo: FileInfo | null,
  format: CanvasFileFormat,
): CanvasFileContextValue {
  const { type, noun, untitled, encode } = format;
  const [info, setInfo] = useState(initialInfo);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saved, setSaved] = useState<SaveKind | null>(null);
  const autosaveEnabled = useAutosaveStore((state) => state.enabled);
  const meta = useDocumentMeta(engine.doc);

  const infoRef = useRef(info);
  /** Counts document changes, so a change made while saving keeps the file dirty. */
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
    // Autosave flushes when the editor closes, so only a file it can't save needs a warning.
    setAppDirty(dirty && (!autosaveEnabled || status === "error"));
    return () => setAppDirty(false);
  }, [dirty, autosaveEnabled, status]);

  /** Writes the file to `path`, or to its draft when `path` is `null`. */
  const write = useCallback(
    (path: string | null, kind: SaveKind): Promise<boolean> => {
      // Encoded now, so a save queued as the editor closes still has the document.
      const data = encode(engine.doc);
      const fileMeta = engine.doc.meta();
      const at = revision.current;
      const run = queue.current.then(async () => {
        setStatus("saving");
        try {
          const file = path
            ? await storage.save(id, path, data, fileMeta)
            : await storage.saveDraft(id, fileMeta.title || untitled, type, data, fileMeta);
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
          return true;
        } catch (error) {
          if (kind === "manual" || !autosaveFailed.current) {
            notifyError(t("save.error", { noun }), error);
          }
          if (kind === "auto") autosaveFailed.current = true;
          setStatus("error");
          return false;
        }
      });
      queue.current = run;
      return run;
    },
    [engine, id, encode, untitled, type, noun],
  );

  const save = useCallback(
    async (asNew: boolean): Promise<boolean> => {
      const current = infoRef.current;
      const path =
        !asNew && current && !current.draft
          ? current.path
          : await saveCanvasFileDialog(
              type,
              engine.doc.meta().title || (current?.name ?? untitled),
            );
      return path ? write(path, "manual") : false;
    },
    [engine, write, type, untitled],
  );

  const autosave = useCallback(async () => {
    if (revision.current === savedRevision.current) return;
    const current = infoRef.current;
    await write(current && !current.draft ? current.path : null, "auto");
  }, [write]);

  useCanvasAutosave(engine, autosave, autosaveEnabled);

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
    id,
    name: meta.title || (info?.name ?? untitled),
    fileName: info?.name ?? untitled,
    title: meta.title,
    description: meta.description,
    noun,
    path: info && !draft ? info.path : null,
    isNew: initialInfo === null,
    draft,
    dirty,
    status,
    saved,
    autosave: autosaveEnabled,
    save: saveFile,
    saveAs: saveFileAs,
    live: null,
  };
}
