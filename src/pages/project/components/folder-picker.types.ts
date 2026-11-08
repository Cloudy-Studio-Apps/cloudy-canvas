export interface FolderPickerProps {
  /** The picked folder's path (`""` is the project root). */
  value: string | null;
  onChange: (rel: string) => void;
  /** Folders that can't be picked, and the ones inside them (a folder moved into itself). */
  exclude?: string;
}

export interface FolderPickerNodeProps extends FolderPickerProps {
  rel: string;
  name: string;
  depth: number;
}
