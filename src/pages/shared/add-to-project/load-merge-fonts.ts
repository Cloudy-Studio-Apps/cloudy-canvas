import {
  documentFonts,
  loadDocumentFonts,
  previewLibraryMerge,
  type CanvasDocument,
  type LibraryDocument,
  type MergePlan,
} from "@canvas";
import { fontLibrary } from "@platform";
import type { FontRequest } from "@shared/core";
import type { FileCodec } from "./file-codecs.types";

/**
 * Loads the fonts the file uses now and those it will use once merged (a library text style with
 * another font), as an editor opening the file would, so the product's after-edit hook measures
 * and lays out text with the right fonts during the merge. One that can't be loaded falls back as
 * in the editor.
 */
export async function loadMergeFonts(
  doc: CanvasDocument,
  library: LibraryDocument,
  plan: MergePlan,
  codec: FileCodec,
): Promise<void> {
  const kinds = codec.kinds();
  const preview = previewLibraryMerge(doc, library, plan, codec.afterEdit());
  let fonts: FontRequest[];
  try {
    fonts = [...documentFonts(doc, kinds), ...documentFonts(preview, kinds)];
  } finally {
    preview.destroy();
  }
  await loadDocumentFonts(kinds, fontLibrary, fonts);
}
