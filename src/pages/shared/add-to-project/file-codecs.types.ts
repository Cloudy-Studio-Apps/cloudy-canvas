import type { CanvasDocument, EditedChange, ElementKinds } from "@canvas";

/** A product's file read and written without its editor. */
export interface FileCodec {
  /** The document of the file's bytes, brought up to date by the modules' migrations. */
  open: (bytes: Uint8Array) => CanvasDocument;
  /** The product's element kinds (what elements ask for, e.g. their fonts). */
  kinds: () => ElementKinds;
  /** The file's bytes, as the editor saves them. */
  encode: (doc: CanvasDocument) => Uint8Array;
  /** What a file without a name of its own (a draft) is called. */
  untitled: () => string;
  /** The product's after-edit hook, for the document while the merge writes it. */
  afterEdit: () => ((doc: CanvasDocument, change: EditedChange) => void) | null;
  /** Points the layers showing picture `from` at `to`; `null` for a product without pictures to move. */
  relink: ((doc: CanvasDocument, from: string, to: string) => void) | null;
}
