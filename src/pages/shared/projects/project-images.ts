import { projectFs } from "@platform";
import { imageExtension, joinRelative, projectPaths, type ImageFile } from "@shared/core";

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
