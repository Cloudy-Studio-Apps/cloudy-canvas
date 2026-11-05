import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_DATA_SOURCES } from "../model";
import { holdsDevicePath } from "../settings";
import { fieldPaths } from "../table";
import { secretKeys } from "../update";
import type { DataSourceElement } from "../source";
import { sourceOf } from "../checks/source-of";
import { dataCopyTag, documentScopes, repeatOf } from "../repeat";
import { isFrame } from "../../frame";

/** The summary `list_data_sources` and the other tools give of a source. */
export async function summarizeSource(engine: DesignWorkspace, source: DataSourceElement) {
  const sources = engine.service(DESIGN_DATA_SOURCES);
  return {
    id: source.id,
    name: source.name,
    type: source.sourceType,
    format: source.format,
    rows: source.snapshot?.rowCount ?? 0,
    updatedAt: source.snapshot ? new Date(source.snapshot.updatedAt).toISOString() : null,
    lastError: sources.error(source.id),
    needsSecrets: await sources.missingSecrets(source.id),
  };
}

/**
 * The frames that repeat a card for this source's rows: id, name and the card (id, name). One
 * `documentScopes` answers every frame's scope and children.
 */
function iteratorsOf(engine: DesignWorkspace, source: DataSourceElement) {
  const scopes = documentScopes(engine.doc);
  return engine.doc.all().flatMap((el) => {
    if (!isFrame(el) || dataCopyTag(el)) return [];
    const repeat = repeatOf(el);
    if (!repeat || sourceOf(scopes.scopeFor(el), repeat.source) !== source.id) return [];
    const card = scopes.templateOf(el);
    return [
      { frame: el.id, name: el.name, template: card ? { id: card.id, name: card.name } : null },
    ];
  });
}

/**
 * A source in full: its settings (secret values never, only which secrets this device holds, and
 * whether it knows where each chosen file is), its fields and its first `rows` rows.
 */
export async function describeSource(
  engine: DesignWorkspace,
  source: DataSourceElement,
  rows: number,
) {
  const sources = engine.service(DESIGN_DATA_SOURCES);
  const type = sources.types().find((t) => t.id === source.sourceType);
  const missing = await sources.missingSecrets(source.id);
  const missingFiles = await sources.missingFiles(source.id);
  const all = sources.rows(source.id);
  return {
    ...(await summarizeSource(engine, source)),
    formatOptions: source.formatOptions,
    rowsPath: source.rowsPath,
    shape: source.shape,
    // The fields as read, before the shape step (what `shape.rename` and `include` name).
    ...(source.shape ? { rawFields: fieldPaths(sources.rawRows(source.id)) } : {}),
    lists: source.snapshot?.lists ?? [],
    settings: source.settings,
    secrets: (type ? secretKeys(type.settings, source.settings) : []).map((key) => ({
      key,
      set: !missing.includes(key),
    })),
    files: (type?.settings ?? []).flatMap((spec) =>
      holdsDevicePath(spec) && source.settings[spec.key]
        ? [{ key: spec.key, onDevice: !missingFiles.includes(spec.key) }]
        : [],
    ),
    iterators: iteratorsOf(engine, source),
    fields: source.fields,
    sampleRows: all.slice(0, rows),
  };
}
