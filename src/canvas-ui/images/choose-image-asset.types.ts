export interface ChooseImageOptions {
  /** The file dialog's title. */
  title: string;
  /** The error toast's title (default "The image couldn't be opened"). */
  errorTitle?: string;
  /** Makes the asset's id (default `createId`): for assets with their own id space. */
  id?: () => string;
}
