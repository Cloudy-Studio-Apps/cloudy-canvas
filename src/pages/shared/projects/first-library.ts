import {
  canvasFileMagic,
  ElementKinds,
  readFileTokens,
  type CanvasFileKind,
  type TokenRecord,
} from "@canvas";
import { BUILT_IN_TOKEN_FORMATS, readTokenSource } from "@design";
import type { FirstLibrarySource } from "./first-library.types";

const FILE_KINDS: Record<string, CanvasFileKind> = {
  CCDS: { magic: "CCDS", noun: "design" },
  CCBD: { magic: "CCBD", noun: "board" },
};

/**
 * The records a new project's first library starts with: a file's variables and styles, or a
 * tokens JSON's. Throws with a message people can act on when the source can't be read.
 */
export function firstLibraryRecords(source: FirstLibrarySource): TokenRecord[] {
  if (source === "empty") return [];
  if ("fromFile" in source) {
    const kind = FILE_KINDS[canvasFileMagic(source.fromFile) ?? ""];
    if (!kind) throw new Error("This isn't a Cloudy Canvas design or board.");
    return readFileTokens(source.fromFile, kind);
  }
  return readTokenSource(source.fromTokensJson, BUILT_IN_TOKEN_FORMATS, new ElementKinds()).records;
}
