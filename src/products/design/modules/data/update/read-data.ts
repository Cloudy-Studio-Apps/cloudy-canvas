import { detectFormat } from "../formats";
import { isWebPage } from "./is-web-page";
import { UPDATE_ERRORS } from "./update-errors";
import type { ReadDataInput, ReadResult } from "./read-data.types";
import type { DataContext, UpdateStage } from "./update-source.types";

/**
 * Fetches a source's data with its type and parses it with its format (`"auto"`: detected), as
 * Update and Try it both do. Fails on a web page and on a format it can't tell.
 */
export async function readData(
  input: ReadDataInput,
  ctx: DataContext,
  signal: AbortSignal,
  onStage?: (stage: UpdateStage) => void,
  onWarning?: (message: string) => void,
): Promise<ReadResult> {
  onStage?.("fetching");
  const { services } = ctx;
  const raw = await input.type.update(input.settings, {
    services,
    signal,
    secrets: input.secrets,
    files: input.files,
    rowsPath: input.rowsPath,
    preview: input.preview ?? false,
    warn: (message) => onWarning?.(message),
  });
  signal.throwIfAborted();
  if (isWebPage(raw)) throw new Error(UPDATE_ERRORS.webPage);

  onStage?.("parsing");
  // Rows a type read in pages come as JSON whatever format is chosen.
  const chosen = raw.rowsPlaced ? "json" : input.format;
  const format =
    chosen === "auto"
      ? detectFormat(raw, ctx.formats)
      : (ctx.formats.find((f) => f.id === chosen) ?? null);
  if (!format) {
    throw new Error(chosen === "auto" ? UPDATE_ERRORS.noFormat : `Unknown format "${chosen}".`);
  }
  const parsed = await format.parse(raw, raw.rowsPlaced ? {} : input.formatOptions);
  signal.throwIfAborted();
  return { parsed, placed: raw.rowsPlaced === true };
}
