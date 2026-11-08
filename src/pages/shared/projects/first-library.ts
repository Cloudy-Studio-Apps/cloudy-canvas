import {
  canvasFileMagic,
  ElementKinds,
  libraryIdOf,
  readFileTokens,
  type CanvasFileKind,
  type TokenRecord,
} from "@canvas";
import { BUILT_IN_TOKEN_FORMATS, readTokenSource } from "@design";
import { copyLibraryRecords } from "./copy-library-records";
import type { FirstLibrarySource } from "./first-library.types";

const FILE_KINDS: Record<string, CanvasFileKind> = {
  CCDS: { magic: "CCDS", noun: "design" },
  CCBD: { magic: "CCBD", noun: "board" },
};

/**
 * The records a library starts with (or gets from Import): a file's variables and styles, or a
 * tokens JSON's. A file's records are a copy: those it holds of a library (tagged), and any whose
 * id is in `taken` (the ids the project's other libraries hold), get new ids, references
 * included, so one id is never in two libraries; all come back untagged. Throws with a message
 * people can act on when the source can't be read.
 */
export function firstLibraryRecords(
  source: FirstLibrarySource,
  taken: ReadonlySet<string> = new Set(),
): TokenRecord[] {
  if (source === "empty") return [];
  if ("fromFile" in source) {
    const kind = FILE_KINDS[canvasFileMagic(source.fromFile) ?? ""];
    if (!kind) throw new Error("This isn't a Cloudy Canvas design or board.");
    return copyLibraryRecords(
      readFileTokens(source.fromFile, kind),
      (record) => libraryIdOf(record) !== undefined || taken.has(record.id),
    );
  }
  return readTokenSource(source.fromTokensJson, BUILT_IN_TOKEN_FORMATS, new ElementKinds()).records;
}
