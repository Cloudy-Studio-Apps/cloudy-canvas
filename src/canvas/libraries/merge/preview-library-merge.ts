import type { AfterEdit, CanvasDocument } from "../../document";
import { LibraryDocument } from "../library-document";
import { applyLibraryMerge } from "./apply-library-merge";
import type { MergePlan } from "./library-merge.types";

/**
 * What `applyLibraryMerge` would make of the file, without touching it or the library: the merge
 * applied to a fork of `doc` and a copy of `library`, with `afterEdit` (the product's hook) on the
 * fork. For reading what the merged file asks for (its fonts) before merging for real; the caller
 * destroys the fork.
 */
export function previewLibraryMerge(
  doc: CanvasDocument,
  library: LibraryDocument,
  plan: MergePlan,
  afterEdit: AfterEdit | null,
): CanvasDocument {
  const fork = doc.fork();
  fork.setAfterEdit(afterEdit);
  try {
    applyLibraryMerge(fork, LibraryDocument.fromFile(library.encodeFile()), plan);
  } catch (error) {
    fork.destroy();
    throw error;
  } finally {
    fork.setAfterEdit(null);
  }
  return fork;
}
