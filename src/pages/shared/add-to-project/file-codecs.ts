import { boardMigrations, openBoardDocument } from "@board";
import { BOARD_FILE_FORMAT, getBoardModules, getBoardProduct } from "@board/ui";
import { designMigrations, openDesignDocument, relinkImageAsset } from "@design";
import { DESIGN_FILE_FORMAT, getDesignModules, getDesignProduct } from "@design/ui";
import type { FileType } from "@shared/core";
import type { FileCodec } from "./file-codecs.types";

/**
 * How each product's files are read and written outside an editor, through the products' public
 * barrels: opened with their modules' migrations, edited with the product's after-edit hook (so
 * bound layers follow the merge), saved with the editor's encoder.
 */
export const FILE_CODECS: Record<FileType, FileCodec> = {
  design: {
    open: (bytes) =>
      openDesignDocument(bytes, getDesignProduct().kinds, getDesignModules().get(designMigrations)),
    encode: (doc) => DESIGN_FILE_FORMAT.encode(doc),
    untitled: () => DESIGN_FILE_FORMAT.untitled,
    afterEdit: () => getDesignProduct().afterEdit?.bind(getDesignProduct()) ?? null,
    relink: (doc, from, to) => void relinkImageAsset(doc, getDesignProduct().kinds, from, to),
  },
  board: {
    open: (bytes) =>
      openBoardDocument(bytes, getBoardProduct().kinds, getBoardModules().get(boardMigrations)),
    encode: (doc) => BOARD_FILE_FORMAT.encode(doc),
    untitled: () => BOARD_FILE_FORMAT.untitled,
    afterEdit: () => getBoardProduct().afterEdit?.bind(getBoardProduct()) ?? null,
    relink: null,
  },
};
