export interface ThumbnailState {
  /** Bumped each time a file's preview picture is written, so previews reload it. */
  versions: Record<string, number>;
  bump: (id: string) => void;
}
