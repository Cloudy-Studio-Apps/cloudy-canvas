import { migrateCollectionModes, type CanvasDocument, type ElementPatch } from "@canvas";

/**
 * Brings tokens from before mode axes up to date (`migrateCollectionModes`) and renames the
 * collection ids in pages' and layers' `variableModes` to their axes', outside the undo history.
 */
export function migrateVariableModes(doc: CanvasDocument): void {
  const migration = migrateCollectionModes(doc.tokenRecords());
  if (!migration) return;
  doc.setTokenRecordsUntracked(migration.records);
  if (migration.axisOf.size === 0) return;
  for (const id of doc.ids()) {
    const modes = doc.field(id, "variableModes");
    if (typeof modes !== "object" || modes === null) continue;
    const renamed = Object.fromEntries(
      Object.entries(modes as Record<string, string>).map(([key, mode]) => [
        migration.axisOf.get(key) ?? key,
        mode,
      ]),
    );
    const patch: ElementPatch = { variableModes: renamed };
    doc.updateUntracked(id, patch);
  }
}
