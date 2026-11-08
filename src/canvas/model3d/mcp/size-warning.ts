import { MODEL_SIZE_WARNING_BYTES } from "../model3d.constants";
import type { ModelFileNoun } from "./model-agent.types";

/** The warning an agent gets for a model over 10 MB, or `undefined`. */
export function sizeWarning(totalBytes: number, noun: ModelFileNoun): string | undefined {
  if (totalBytes <= MODEL_SIZE_WARNING_BYTES) return undefined;
  const mb = (totalBytes / 1048576).toFixed(1);
  return `The model and its textures are ${mb} MB. Files over 10 MB can make the ${noun} slow and its file large.`;
}
