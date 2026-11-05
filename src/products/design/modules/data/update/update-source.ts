import type { CanvasDocument, ElementPatch } from "@canvas";

import { missingSettings } from "../settings";
import { isDataSource, type DataSourceElement } from "../source";
import {
  extraValues,
  findLists,
  guessFields,
  normalizeRows,
  placeRows,
  SHAPE_ERRORS,
} from "../table";
import { shapedData } from "./shaped-data";
import { removeAddedPictures } from "./remove-added-pictures";
import type { SourceRead } from "./shaped-data.types";
import { addSnapshot, encodeRows } from "./snapshot";
import { downloadImages } from "./download-images";
import { requireFilePaths } from "./file-paths";
import { readData } from "./read-data";
import { loadSourceSecrets, missingSecretKeys } from "./source-secrets";
import { noSourceTypeMessage, UPDATE_ERRORS } from "./update-errors";
import type { DataContext, UpdateOptions, UpdateResult } from "./update-source.types";

/** How many times a save shapes the data again for a rows path or shape changed meanwhile. */
const MAX_RESHAPES = 3;

/** Whether the record reads its rows as `read` says (the same rows path and shape step). */
function sameRead(source: DataSourceElement, read: SourceRead): boolean {
  return (
    source.rowsPath === read.rowsPath &&
    JSON.stringify(source.shape ?? null) === JSON.stringify(read.shape)
  );
}

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
    if (!type) throw new Error(noSourceTypeMessage(source.sourceType));
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
    const warnings: string[] = [];
    const { parsed: fetched, placed } = await readData(
      {
        type,
        settings: source.settings,
        secrets,
        files,
        format: source.format,
        formatOptions: source.formatOptions,
        rowsPath: source.rowsPath,
      },
      ctx,
      signal,
      options.onStage,
      (message) => warnings.push(message),
    );
    // The rows path and shape step read now; the record's may change while this runs, and the
    // ones current when it writes win (below). With a shape step that changes something the rows
    // as read are kept too, so the step can change without fetching again (`setShape`).
    let read: SourceRead = { rowsPath: source.rowsPath, shape: source.shape ?? null };
    // The data as the rows path in `read` finds it (re-placed when the path changes below).
    let parsed = fetched;
    let { rows, raw: kept } = shapedData(parsed, read.rowsPath, read.shape);
    signal.throwIfAborted();

    let encoded = await encodeRows(rows, kept);
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
    // Read again: the record may have changed (or gone) while fetching. A rows path or shape set
    // meanwhile is applied to the data fetched, so the rows match the fields and bindings it left
    // (pictures were saved by the rows read first: a field it brings saves its own next Update).
    // The pictures' assets are in, so a cancel no longer stops it: it ends as a finished Update.
    // A failure here removes the pictures it added (`removeAddedPictures`).
    let current: DataSourceElement;
    try {
      current = record(doc, id);
      for (let tries = 0; !sameRead(current, read); tries++) {
        if (tries >= MAX_RESHAPES) throw new Error(SHAPE_ERRORS.changed);
        // A paged type put its rows at the path it was given: put them at the new one.
        if (placed && current.rowsPath !== read.rowsPath) {
          const found = normalizeRows(parsed, read.rowsPath);
          if (found) parsed = placeRows(found, current.rowsPath);
        }
        read = { rowsPath: current.rowsPath, shape: current.shape ?? null };
        ({ rows, raw: kept } = shapedData(parsed, read.rowsPath, read.shape));
        encoded = await encodeRows(rows, kept);
        current = record(doc, id);
      }
    } catch (error) {
      // Failing here, the pictures this Update just saved would be pointed at by nothing.
      removeAddedPictures(doc, id, before.images, downloaded.images);
      throw error;
    }
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
        : { ...addSnapshot(doc, rows, encoded, kept), ...(replaced ? { previous: replaced } : {}) };
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
    options.onWarnings?.(warnings);
    return {
      ok: true,
      ...(warnings.length > 0 ? { warnings } : {}),
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
