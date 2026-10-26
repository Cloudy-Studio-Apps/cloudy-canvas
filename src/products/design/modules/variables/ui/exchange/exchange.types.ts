import type { TokenSourceRead } from "../../exchange";

/** A picked file, read and ready to import. */
export interface ImportSource extends TokenSourceRead {
  /** The file's name. */
  name: string;
}

export interface ImportTokensDialogProps {
  source: ImportSource | null;
  onClose: () => void;
}

export interface ImportBodyProps {
  source: ImportSource;
  onClose: () => void;
}

/** One tickable row of the import tree: a collection or style type, or a group of one. */
export interface PickRow {
  key: string;
  label: string;
  /** How many variables or styles it holds. */
  count: number;
  /** Rows of a collection or style type (its top-level groups). */
  children: PickRow[];
}

export interface ImportPickTreeProps {
  rows: readonly PickRow[];
  /** Ticked group keys. */
  ticked: ReadonlySet<string>;
  onChange: (ticked: Set<string>) => void;
}
