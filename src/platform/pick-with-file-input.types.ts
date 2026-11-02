export interface PickWithFileInputOptions {
  /** MIME types to offer. Left out on Android for our own extensions, which it doesn't know. */
  accept?: string;
  multiple: boolean;
}
