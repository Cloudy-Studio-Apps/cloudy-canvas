import type { CanvasDocument, ElementPatch } from "@canvas";

import { missingSettings } from "../settings";
import { isDataSource, type DataSourceElement } from "../source";
import { extraValues, findLists, guessFields, normalizeRows } from "../table";
import { addSnapshot, encodeRows } from "./snapshot";
import { downloadImages } from "./download-images";
import { requireFilePaths } from "./file-paths";
import { readData } from "./read-data";
import { loadSourceSecrets, missingSecretKeys } from "./source-secrets";
import { UPDATE_ERRORS } from "./update-errors";
import type { DataContext, UpdateOptions, UpdateResult } from "./update-source.types";

function record(doc: CanvasDocument, id: string): DataSourceElement {
  const el = doc.get(id);
  if (!el || !isDataSource(el)) throw new Error(`There's no data source with the id "${id}".`);
  return el;
}

/**
 * Fetches a source, parses its data into rows, guesses its fields, saves the pictures the data
 * names (`downloadImages`) and a new snapshot, in one undo step. The assets are added before the
 * checkpoint (assets are outside undo), so undoing points the record back at the previous
 * snapshot, fields and pictures. When anything fails nothing is written; a picture that can't be
 * saved is counted in `imagesFailed` instead.
 */
export async function updateSource(
  doc: CanvasDocument,
  id: string,
  ctx: DataContext,
  options: UpdateOptions = {},
): Promise<UpdateResult> {
  const signal = options.signal ?? new AbortController().signal;
  try {
    const source = record(doc, id);
    const type = ctx.types.find((t) => t.id === source.sourceType);
    if (!type) throw new Error(`Unknown source type "${source.sourceType}".`);
    const specs = type.settings;
    // Secrets bound to another origin than the settings' read as missing (never sent there).
    const secrets = await loadSourceSecrets(ctx.services, id, type, source.settings);
    // Secret pairs too (a header whose value isn't on this device), not only required settings.
    const missing = [
      ...new Set([
        ...missingSettings(specs, source.settings, secrets),
        ...missingSecretKeys(specs, source.settings, secrets),
      ]),
    ];
    if (missing.length > 0) throw new Error(`${UPDATE_ERRORS.missing}${missing.join(", ")}`);
    const files = await requireFilePaths(ctx.services, id, specs, source.settings);

    const services = ctx.services;
    const parsed = await readData(
      {
        type,
        settings: source.settings,
        secrets,
        files,
        format: source.format,
        formatOptions: source.formatOptions,
      },
      ctx,
      signal,
      options.onStage,
    );
    const rows = normalizeRows(parsed, source.rowsPath);
    if (!rows) throw new Error(`${UPDATE_ERRORS.noList}${source.rowsPath ?? ""}`);
    signal.throwIfAborted();

    const encoded = await encodeRows(rows);
    signal.throwIfAborted();

    // The pictures the data names, saved in the file; their assets are added (outside undo)
    // once all are in, and nothing async follows, so a cancel adds none.
    const before = record(doc, id);
    const typed = guessFields(rows, before.fields);
    let reported = false;
    const folderKey = specs.find((spec) => spec.kind === "folder")?.key;
    const downloaded = await downloadImages(rows, typed, before.images, {
      doc,
      services,
      folder: (folderKey && files[folderKey]) || null,
      signal,
      // The stage shows only when there are pictures to save.
      onProgress: (done, total) => {
        if (total === 0) return;
        if (!reported) options.onStage?.("images");
        reported = true;
        options.onProgress?.(done, total);
      },
    });

    options.onStage?.("saving");
    // Read again: the record may have changed (or gone) while fetching.
    const current = record(doc, id);
    const previous = current.snapshot;
    const changed = previous?.hash !== encoded.hash;
    const fields = guessFields(rows, current.fields);
    const images = { ...current.images, ...downloaded.images };
    const imagesChanged = JSON.stringify(images) !== JSON.stringify(current.images);
    // Same data keeps its asset, unless this device lacks it: then the rows are saved again.
    // A new snapshot names the one it replaces (`previous`), so pruning keeps that one too.
    const replaced = changed ? previous?.assetId : previous?.previous;
    const base =
      previous && !changed && doc.hasAsset(previous.assetId)
        ? { ...previous, updatedAt: Date.now() }
        : { ...addSnapshot(doc, rows, encoded), ...(replaced ? { previous: replaced } : {}) };
    // What else the data holds, for the "Rows come from" picker: kept with the snapshot.
    const snapshot = { ...base, lists: findLists(parsed), extras: extraValues(parsed) };
    doc.checkpoint();
    // One record update: the snapshot, the fields and the new pictures, one undo step.
    const patch: ElementPatch<DataSourceElement> = {
      snapshot,
      ...(changed ? { fields } : {}),
      ...(imagesChanged ? { images } : {}),
    };
    doc.update(id, patch);
    options.onImageFailures?.(downloaded.failed, downloaded.overLimit);
    return {
      ok: true,
      rowCount: rows.length,
      changed,
      imagesFailed: downloaded.failed.length,
      imagesTooLarge: downloaded.failed.filter((f) => f.reason === "tooLarge").length,
      imagesOverLimit: downloaded.overLimit,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const aborted = signal.aborted || undefined;
    return {
      ok: false,
      rowCount: 0,
      error: message,
      changed: false,
      imagesFailed: 0,
      imagesOverLimit: 0,
      aborted,
    };
  }
}
