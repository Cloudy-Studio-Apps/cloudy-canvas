/** Where the app's source code and releases live. */
export const APP_REPOSITORY_URL = "https://github.com/Cloudy-Studio-Apps/cloudy-canvas";

/** The page of one release, where its files can be downloaded. */
export function releasePageUrl(version: string): string {
  return `${APP_REPOSITORY_URL}/releases/tag/v${version}`;
}
