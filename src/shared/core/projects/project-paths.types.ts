export interface ProjectPaths {
  /** The `<name>.cproject` file at the root. */
  manifest(name: string): string;
  /** `.cloudy` */
  data: string;
  /** `.cloudy/libraries` */
  libraries: string;
  /** A library file (`<name>.clib`) in `.cloudy/libraries`. */
  library(file: string): string;
  /** The folder with a library's images and SVGs (`<name>.assets`). */
  libraryAssets(file: string): string;
  /** `.cloudy/trash` */
  trash: string;
  /** `.cloudy/trash/index.json` */
  trashIndex: string;
}
