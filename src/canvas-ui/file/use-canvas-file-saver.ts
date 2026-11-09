import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import type { CanvasEngine } from "@canvas";
import { FILE_EXTENSIONS, isAndroidPlatform, type FileInfo } from "@shared/core";
import { exportFile, saveCanvasFileDialog, storage } from "@platform";
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
import { freeFilePath } from "./free-file-path";
import { useCanvasAutosave } from "./use-canvas-autosave";
import { useRecentProject } from "./use-recent-project";
import { t } from "./file.i18n";

/** How long the top bar shows that the file was just saved. */
const SAVED_NOTICE_MS = 3000;

/**
 * Saves the document to its file in the product's `format` (asking where the first time), autosaves
 * it after changes (as a draft in the app data while it has no file) and tracks unsaved changes.
 * A new file opened with `?dir=` (made in a project's folder) goes there, with a free untitled
 * name, without asking.
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
  const [params] = useSearchParams();
  /** The folder a new file made in a project goes to, and the path picked there once. */
  const folder = useRef(initialInfo === null ? params.get("dir") : null);
  const folderPath = useRef<Promise<string | null> | null>(null);

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

  /** Writes the file to `path` (once it's known), or to its draft when `path` is `null`. */
  const write = useCallback(
    (target: string | null | Promise<string | null>, kind: SaveKind): Promise<boolean> => {
      // Encoded now, so a save queued as the editor closes still has the document.
      const data = encode(engine.doc);
      const projectId = engine.doc.projectLink()?.projectId;
      const fileMeta = { ...engine.doc.meta(), ...(projectId && { projectId }) };
      const at = revision.current;
      const run = queue.current.then(async () => {
        setStatus("saving");
        try {
          const path = await target;
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

  /** Where a file with no file yet goes without asking (`?dir=`), `null` for nowhere. */
  const firstPath = useCallback((): Promise<string | null> => {
    const dir = folder.current;
    if (!dir) return Promise.resolve(null);
    folderPath.current ??= freeFilePath(dir, untitled, FILE_EXTENSIONS[type]).catch(
      (error: unknown) => {
        notifyError(t("save.error", { noun }), error);
        return null;
      },
    );
    return folderPath.current;
  }, [untitled, type, noun]);

  const save = useCallback(
    async (asNew: boolean): Promise<boolean> => {
      const current = infoRef.current;
      const name = engine.doc.meta().title || (current?.name ?? untitled);
      // Android keeps the file in the app, so saving elsewhere is handing out a copy.
      if (asNew && isAndroidPlatform()) {
        const data = encode(engine.doc) as BlobPart;
        return exportFile(new Blob([data]), name, {
          extension: FILE_EXTENSIONS[type],
          label: noun,
        });
      }
      const saved = current && !current.draft ? current.path : null;
      let path = asNew ? null : (saved ?? (await firstPath()));
      path ??= await saveCanvasFileDialog(type, name);
      return path ? write(path, "manual") : false;
    },
    [engine, write, encode, type, noun, untitled, firstPath],
  );

  /** `force`: save even with no counted change (the editor's last work after it closed). */
  const autosave = useCallback(
    async (force = false) => {
      if (!force && revision.current === savedRevision.current) return;
      const current = infoRef.current;
      await write(current && !current.draft ? current.path : firstPath(), "auto");
    },
    [write, firstPath],
  );

  useCanvasAutosave(engine, autosave, autosaveEnabled);
  useRecentProject(id, engine, info);

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
