/** The file type of an export, for the save dialog's filter. */
export interface ExportFileType {
  /** Without the dot, e.g. `png`. */
  extension: string;
  /** e.g. "PNG image". */
  label: string;
}
