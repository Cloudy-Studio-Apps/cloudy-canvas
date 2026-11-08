import { joinRelative, uniqueName } from "@shared/core";
import { projectFs } from "@platform";

/** A path in the folder `dir` for a new file named `name.ext`, numbered when that name is taken. */
export async function freeFilePath(dir: string, name: string, ext: string): Promise<string> {
  const taken = new Set<string>();
  let file = uniqueName(`${name}.${ext}`, taken);
  while (await projectFs.exists(joinRelative(dir, file))) {
    taken.add(file);
    file = uniqueName(file, taken);
  }
  return joinRelative(dir, file);
}
