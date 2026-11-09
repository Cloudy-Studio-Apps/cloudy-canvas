import { MODEL_BASE_SIZE } from "../model3d.constants";
import type { ModelBaker, ModelData, ModelImport } from "../model3d.types";
import { baseName, siblingPath } from "./file-path";
import { sizeWarning } from "./size-warning";
import { textureArgs } from "./texture-args";
import { optionalNumber, stringArg } from "../../mcp/tool-args";
import type {
  AgentModelImport,
  AgentModelReport,
  ModelFileNoun,
  ReadAgentFile,
} from "./model-agent.types";

/**
 * Reads and imports the model file a `model3d_add`-style call names (its `path`, siblings, hand
 * `textures`) and works out where it goes (`x`, `y`, `h`, the width follows). Writes nothing.
 */
export async function readAgentModel(
  args: Record<string, unknown>,
  baker: ModelBaker,
  readFile: ReadAgentFile,
): Promise<AgentModelImport> {
  const path = stringArg(args, "path");
  const h = optionalNumber(args, "h") ?? MODEL_BASE_SIZE;
  if (h < 16) throw new Error('"h" must be at least 16.');
  const data = await readFile(path);
  const readSibling = async (name: string) => readFile(siblingPath(path, name)).catch(() => null);
  const imp = await baker.importModel({ name: baseName(path), path, data }, [], readSibling);
  const chosen = textureArgs(args, imp.slots, false);
  for (const slot of imp.slots) {
    const file = chosen.get(slot.name);
    if (file) slot.data = await readFile(file);
  }
  const rect = {
    x: optionalNumber(args, "x") ?? 0,
    y: optionalNumber(args, "y") ?? 0,
    w: Math.max(1, Math.round(h * imp.aspect)),
    h: Math.round(h),
  };
  return { imp, rect };
}

/** The slots, missing slots and size warning an agent is told of a stored model. */
export function agentModelReport(
  data: ModelData,
  imp: ModelImport,
  noun: ModelFileNoun,
): AgentModelReport {
  const warning = sizeWarning(imp.totalBytes, noun);
  return {
    slots: data.textures.map((slot) => slot.name),
    missing: data.textures
      .filter((slot) => slot.file !== null && !slot.embedded && !slot.assetId)
      .map((slot) => slot.name),
    ...(warning ? { warning } : {}),
  };
}
