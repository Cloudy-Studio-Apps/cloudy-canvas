import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_DATA_SOURCES } from "../model";
import { holdsDevicePath } from "../settings";
import { secretKeys } from "../update";
import type { DataSourceElement } from "../source";

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
    fields: source.fields,
    sampleRows: all.slice(0, rows),
  };
}
