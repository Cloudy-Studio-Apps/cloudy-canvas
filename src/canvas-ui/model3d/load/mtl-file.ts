import type { ImportFile } from "@canvas";
import { toText } from "./bytes";
import { baseName } from "./external-texture";
import { isMtlName } from "./companion-names";
import { findFile } from "./find-file";
import type { SiblingReader } from "./import-model.types";

/**
 * The material file of an OBJ: the one its `mtllib` line names (only a `.mtl`), else a `.mtl` that came with it
 * (the one sharing the OBJ's name first). `null` when there is none.
 */
export async function findMtl(
  obj: ImportFile,
  others: readonly ImportFile[],
  readSibling: SiblingReader | null,
): Promise<Uint8Array | null> {
  const head = toText(obj.data.subarray(0, 64 * 1024));
  const named = /^mtllib[ \t]+(.+?)[ \t]*$/m.exec(head)?.[1];
  if (named) {
    const bytes = await findFile(named, others, readSibling, isMtlName);
    if (bytes) return bytes;
  }
  const stem = baseName(obj.name)
    .replace(/\.[^.]*$/, "")
    .toLowerCase();
  const mtls = others.filter((file) => file.name.toLowerCase().endsWith(".mtl"));
  return (mtls.find((file) => file.name.toLowerCase() === `${stem}.mtl`) ?? mtls[0])?.data ?? null;
}
