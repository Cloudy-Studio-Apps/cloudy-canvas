import { formatName } from "../../../db/schema/dbml";
import type { ErAttributeElement } from "../../attribute/attribute.types";

const INDENT = "  ";

/** Attributes grouped by owner id, each group in text order. */
export function attributesByOwner(
  attributes: readonly ErAttributeElement[],
): Map<string, ErAttributeElement[]> {
  const byOwner = new Map<string, ErAttributeElement[]>();
  for (const attribute of attributes) {
    const list = byOwner.get(attribute.ownerId);
    if (list) list.push(attribute);
    else byOwner.set(attribute.ownerId, [attribute]);
  }
  for (const list of byOwner.values()) list.sort((a, b) => a.order - b.order);
  return byOwner;
}

/** Lines for the attributes of `ownerId`, with composite parts nested in braces. */
export function serializeAttributes(
  ownerId: string,
  byOwner: ReadonlyMap<string, ErAttributeElement[]>,
  depth: number,
): string[] {
  const pad = INDENT.repeat(depth);
  const lines: string[] = [];
  for (const attribute of byOwner.get(ownerId) ?? []) {
    const head = `${pad}${formatName(attribute.name)}${attributeSettings(attribute)}`;
    const children = serializeAttributes(attribute.id, byOwner, depth + 1);
    if (children.length === 0) {
      lines.push(head);
    } else {
      lines.push(`${head} {`, ...children, `${pad}}`);
    }
  }
  return lines;
}

function attributeSettings(attribute: ErAttributeElement): string {
  const settings: string[] = [];
  if (attribute.key !== "none") settings.push(attribute.key);
  if (attribute.multivalued) settings.push("multi");
  if (attribute.derived) settings.push("derived");
  if (attribute.optional) settings.push("optional");
  return settings.length ? ` [${settings.join(", ")}]` : "";
}
