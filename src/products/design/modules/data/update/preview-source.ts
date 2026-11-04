import { holdsDevicePath, isAbsolutePath, missingSettings, splitSecrets } from "../settings";
import { extraValues, findLists, guessFields, normalizeRows } from "../table";
import { loadFilePaths } from "./file-paths";
import { readData } from "./read-data";
import { loadSourceSecrets, missingSecretKeys } from "./source-secrets";
import { UPDATE_ERRORS } from "./update-errors";
import type { PreviewInput, PreviewResult } from "./preview-source.types";
import type { DataContext } from "./update-source.types";

const PREVIEW_ROWS = 50;

/**
 * Runs a source's settings once, as Update would, and gives what came back, writing nothing:
 * not the record, not the secrets, not a picture. Secrets typed in the form are used for this
 * one request; the ones kept for `sourceId` only when the settings' origin is theirs.
 */
export async function previewSource(
  ctx: DataContext,
  input: PreviewInput,
  signal: AbortSignal,
): Promise<PreviewResult> {
  try {
    const type = ctx.types.find((t) => t.id === input.sourceType);
    if (!type) throw new Error(`Unknown source type "${input.sourceType}".`);
    const specs = type.settings;
    const { settings, secrets: typed } = splitSecrets(specs, input.settings);
    const stored = input.sourceId
      ? await loadSourceSecrets(ctx.services, input.sourceId, type, settings)
      : {};
    const secrets = { ...stored };
    for (const [key, value] of Object.entries(typed)) if (value !== "") secrets[key] = value;
    const missing = [
      ...new Set([
        ...missingSettings(specs, settings, secrets),
        ...missingSecretKeys(specs, settings, secrets),
      ]),
    ];
    if (missing.length > 0) throw new Error(`${UPDATE_ERRORS.missing}${missing.join(", ")}`);

    // A path chosen now is this device's; otherwise the one kept for the source.
    const files = input.sourceId
      ? await loadFilePaths(ctx.services, input.sourceId, specs, settings)
      : {};
    for (const spec of specs) {
      const value = input.settings[spec.key];
      if (!holdsDevicePath(spec) || typeof value !== "string") continue;
      if (isAbsolutePath(value)) files[spec.key] = value;
      if (spec.kind === "file" && value !== "" && !files[spec.key]) {
        throw new Error(UPDATE_ERRORS.pickFileAgain);
      }
      const path = files[spec.key];
      if (path && (await ctx.services.isPrivatePath(path))) {
        throw new Error(
          spec.kind === "folder" ? UPDATE_ERRORS.privateFolder : UPDATE_ERRORS.privateFile,
        );
      }
    }

    const parsed = await readData(
      { type, settings, secrets, files, format: input.format, formatOptions: input.formatOptions },
      ctx,
      signal,
    );
    const rows = normalizeRows(parsed, input.rowsPath);
    if (!rows) throw new Error(`${UPDATE_ERRORS.noList}${input.rowsPath ?? ""}`);
    return {
      ok: true,
      rows: rows.slice(0, PREVIEW_ROWS),
      rowCount: rows.length,
      fields: guessFields(rows, input.fields ?? []),
      lists: findLists(parsed),
      extras: extraValues(parsed),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message, aborted: signal.aborted || undefined };
  }
}
