import { imageTypeFromName } from "@shared/core";

/** Whether a name ends with `extension` (with its dot), regardless of case. */
function endsWith(extension: string): (name: string) => boolean {
  return (name) => name.toLowerCase().endsWith(extension);
}

/** The files a model may bring along, by what they must be named. */
export const isMtlName = endsWith(".mtl");
export const isBinName = endsWith(".bin");

export function isPictureName(name: string): boolean {
  return imageTypeFromName(name) !== null;
}
