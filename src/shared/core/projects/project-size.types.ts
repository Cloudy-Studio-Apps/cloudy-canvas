export interface ProjectSizes {
  /** Bytes of the project outside its `.cloudy` folder. */
  files: number;
  /** Bytes of the libraries' files and assets. */
  libraries: number;
  /** Bytes of the files waiting in the trash. */
  trash: number;
  /** The three above together. */
  total: number;
  /** How many items the trash holds. */
  trashItems: number;
}
