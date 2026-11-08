import type { ToolArgs } from "../../mcp/mcp-tool.types";
import { optionalRecord } from "../../mcp/tool-args";
import type { ModelTextureSlot } from "../model3d.types";

/**
 * `textures` as slot name to file path (`null` clears the slot, when `allowNull`). Every name must
 * be one of `slots`, so a typo fails before anything is read or written.
 */
export function textureArgs(
  args: ToolArgs,
  slots: readonly Pick<ModelTextureSlot, "name">[],
  allowNull: boolean,
): Map<string, string | null> {
  const record = optionalRecord(args, "textures") ?? {};
  const names = slots.map((slot) => slot.name);
  const result = new Map<string, string | null>();
  for (const [slot, path] of Object.entries(record)) {
    if (!names.includes(slot)) {
      throw new Error(`No texture slot "${slot}". Slots: ${names.join(", ") || "none"}.`);
    }
    const valid = typeof path === "string" && path !== "";
    if (!valid && !(allowNull && path === null)) {
      throw new Error(
        `The texture of "${slot}" must be a file path${allowNull ? " or null" : ""}.`,
      );
    }
    result.set(slot, path as string | null);
  }
  return result;
}
