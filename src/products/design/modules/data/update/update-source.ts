import type { CanvasDocument, ElementPatch } from "@canvas";

import { detectFormat } from "../formats";
import { missingSettings } from "../settings";
import { isDataSource, type DataSourceElement } from "../source";
import { guessFields, normalizeRows } from "../table";
import { addSnapshot, encodeRows } from "./snapshot";
import { loadSecrets, secretKeys } from "./source-secrets";
import type { DataContext, UpdateOptions, UpdateResult } from "./update-source.types";

function record(doc: CanvasDocument, id: string): DataSourceElement {
  const el = doc.get(id);
  if (!el || !isDataSource(el)) throw new Error(`There's no data source with the id "${id}".`);
  return el;
}

/**
 * Fetches a source, parses its data into rows, guesses its fields and saves a new snapshot, in one
 * undo step. The asset is added before the checkpoint (assets are outside undo), so undoing points
 * the record back at the previous snapshot and fields. When anything fails nothing is written.
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
    const secrets = await loadSecrets(ctx.services, id, secretKeys(specs, source.settings));
    const missing = missingSettings(specs, source.settings, secrets);
    if (missing.length > 0) throw new Error(`Missing: ${missing.join(", ")}`);

    options.onStage?.("fetching");
    const raw = await type.update(source.settings, { services: ctx.services, signal, secrets });
    signal.throwIfAborted();

    options.onStage?.("parsing");
    const format =
      source.format === "auto"
        ? detectFormat(raw, ctx.formats)
        : (ctx.formats.find((f) => f.id === source.format) ?? null);
    if (!format) {
      throw new Error(
        source.format === "auto"
          ? "Couldn't tell the data's format."
          : `Unknown format "${source.format}".`,
      );
    }
    const rows = normalizeRows(await format.parse(raw, source.formatOptions));
    signal.throwIfAborted();

    options.onStage?.("saving");
    const encoded = await encodeRows(rows);
    signal.throwIfAborted();
    // Read again: the record may have changed (or gone) while fetching.
    const current = record(doc, id);
    const previous = current.snapshot;
    const changed = previous?.hash !== encoded.hash;
    const fields = guessFields(rows, current.fields);
    const snapshot =
      previous && !changed
        ? { ...previous, updatedAt: Date.now() }
        : addSnapshot(doc, rows, encoded);
    doc.checkpoint();
    const patch: ElementPatch<DataSourceElement> = changed ? { snapshot, fields } : { snapshot };
    doc.update(id, patch);
    return { ok: true, rowCount: rows.length, changed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, rowCount: 0, error: message, changed: false };
  }
}
