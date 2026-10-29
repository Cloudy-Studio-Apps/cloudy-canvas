import type { PrismaField } from "./prisma-block.types";

/** `model X { … }` / `enum X { … }` with aligned fields and the block attributes after them. */
export function prismaBlock(
  keyword: string,
  name: string,
  fields: readonly PrismaField[],
  blockAttributes: readonly string[],
): string {
  const nameWidth = Math.max(0, ...fields.map(([field]) => field.length));
  const typeWidth = Math.max(0, ...fields.map(([, type]) => type.length));
  const lines = fields.map(([field, type, attributes]) =>
    `  ${field.padEnd(nameWidth)} ${type.padEnd(typeWidth)} ${attributes}`.trimEnd(),
  );
  const tail = blockAttributes.length > 0 ? ["", ...blockAttributes.map((a) => `  ${a}`)] : [];
  return [`${keyword} ${name} {`, ...lines, ...tail, "}"].join("\n");
}
