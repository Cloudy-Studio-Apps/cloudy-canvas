import { projectFs } from "@platform";
import { IMAGE_FILE_TYPES, joinRelative, projectPaths, type ImageFile } from "@shared/core";

/** The extension that stands for an image's media type (`png` for `image/png`). */
export function imageExtension(type: string): string {
  const found = Object.entries(IMAGE_FILE_TYPES).find(([, mime]) => mime === type);
  return found ? found[0] : "png";
}

/**
 * Copies a picked image into the project's data folder as `icon.<ext>` or `cover.<ext>` and
 * returns that file name, which the manifest keeps.
 */
export async function writeProjectImage(
  root: string,
  kind: "icon" | "cover",
  image: ImageFile,
): Promise<string> {
  const file = `${kind}.${imageExtension(image.type)}`;
  await projectFs.writeBytesAtomic(joinRelative(projectPaths(root).data, file), image.data);
  return file;
}
