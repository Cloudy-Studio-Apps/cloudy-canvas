import {
  createId,
  isReservedName,
  LIBRARIES_DIR,
  LIBRARY_EXTENSION,
  PROJECT_DATA_DIR,
  projectPaths,
  uniqueName,
  type LibraryEntry,
  type ProjectFs,
} from "@shared/core";

import type { TokenRecord } from "../tokens/token.types";
import { keyBetween } from "../utils";
import { LibraryDocument } from "./library-document";

/** The libraries folder relative to the project root. */
const LIBRARIES_REL = `${PROJECT_DATA_DIR}/${LIBRARIES_DIR}`;

/**
 * Writes a library named `name` (its `.clib`, holding `records` if any, and `.assets/` folder,
 * with a file name no other library of the project at `root` has) and returns its manifest entry;
 * the caller adds it to the manifest. Throws when `name` can't be a file name.
 */
export async function createLibraryFile(
  fs: ProjectFs,
  root: string,
  name: string,
  records: readonly TokenRecord[] = [],
): Promise<LibraryEntry> {
  const label = name.trim();
  if (isReservedName(label)) throw new Error(`"${label}" can't be a library name`);
  const paths = projectPaths(root);
  const libraries = (await fs.readManifest(root))?.libraries ?? [];
  const taken = new Set(libraries.map((library) => library.file));

  let file = uniqueName(`${label}.${LIBRARY_EXTENSION}`, taken);
  while (await fs.exists(paths.library(file))) {
    taken.add(file);
    file = uniqueName(file, taken);
  }

  if (!(await fs.exists(paths.libraries))) await fs.createFolder(root, LIBRARIES_REL);
  const assets = paths.libraryAssets(file);
  if (!(await fs.exists(assets))) {
    await fs.createFolder(root, `${LIBRARIES_REL}/${assets.split(/[\\/]/).pop()}`);
  }

  const entry: LibraryEntry = {
    id: createId(),
    name: label,
    file,
    order: keyBetween(
      libraries
        .map((library) => library.order)
        .sort()
        .at(-1) ?? null,
      null,
    ),
    autoAdd: true,
  };
  const library = LibraryDocument.create(entry.id, label);
  if (records.length > 0) library.setTokenRecords(records);
  await fs.writeBytesAtomic(paths.library(file), library.encodeFile());
  return entry;
}
