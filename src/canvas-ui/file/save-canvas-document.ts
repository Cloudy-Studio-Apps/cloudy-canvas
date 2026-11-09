import { FILE_EXTENSIONS, type FileInfo } from "@shared/core";
import { storage } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { freeFilePath } from "./free-file-path";
import type { SaveCanvasDocumentInput } from "./save-canvas-document.types";

/** Each file's writes in line, resolving to the file the last one wrote (`null` if it failed). */
const writes = new Map<string, Promise<FileInfo | null>>();

/**
 * Writes a document to its file: encoded now (so a save queued as its editor or tab goes still has
 * it), then after the writes already in line for the same file id, so one file never has two
 * writers at once, whoever saves it (its editor's saver, the document autosave of a tab with no
 * editor). The path is `path` when given, else the file it was saved in (`info`, or the one the
 * write before it in line made), else a free untitled name in `dir`, else its draft. The document's
 * title, description and project id go with it, and the recent files are updated.
 */
export function saveCanvasDocument(input: SaveCanvasDocumentInput): Promise<FileInfo> {
  const { id, doc, info, format, dir } = input;
  const data = format.encode(doc);
  const projectId = doc.projectLink()?.projectId;
  const meta = { ...doc.meta(), ...(projectId && { projectId }) };
  const before = writes.get(id) ?? Promise.resolve(null);
  const run = before.then(async (written) => {
    const path = await targetPath(input, written ?? info, dir);
    const file = path
      ? await storage.save(id, path, data, meta)
      : await storage.saveDraft(id, meta.title || format.untitled, format.type, data, meta);
    useRecentFilesStore.getState().upsert(file);
    return file;
  });
  const settled = run.catch(() => null);
  writes.set(id, settled);
  void settled.then(() => {
    if (writes.get(id) === settled) writes.delete(id);
  });
  return run;
}

/** Where the write goes: `path` when given, the saved file, a free name in `dir`, or the draft. */
function targetPath(
  input: SaveCanvasDocumentInput,
  current: FileInfo | null,
  dir: string | null,
): Promise<string | null> {
  if (input.path !== undefined) return Promise.resolve(input.path);
  if (current) return Promise.resolve(current.draft ? null : current.path);
  if (!dir) return Promise.resolve(null);
  const { untitled, type } = input.format;
  return freeFilePath(dir, untitled, FILE_EXTENSIONS[type]);
}
