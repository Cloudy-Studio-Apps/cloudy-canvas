/** What `openFile` asks for: the dialog's title and the kinds of files it offers. */
export interface OpenFilePick {
  title: string;
  filters: { name: string; extensions: string[] }[];
}

/** A file the user picked: its name (without the folder), contents and where it is. */
export interface OpenedFile {
  name: string;
  bytes: Uint8Array;
  /** Its absolute path on the device. */
  path: string;
}
