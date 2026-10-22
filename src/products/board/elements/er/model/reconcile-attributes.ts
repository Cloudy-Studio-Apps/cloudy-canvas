import { createId } from "@shared/core";

import { pairByName } from "../../../modules/db/schema/pair-by-name";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErAttributeElement, ErAttributeLook } from "../attribute/attribute.types";
import { attributeSize } from "../base/er-size";
import { keepCenter } from "../base/keep-center";
import type { ParsedErAttribute } from "./lang";

/**
 * The attributes of one owner (and their parts, recursively), matched by name then position
 * against the owner's current attributes so their ids and positions survive.
 */
export function buildAttributes(
  parsed: readonly ParsedErAttribute[],
  ownerId: string,
  existingOwnerId: string | undefined,
  existing: readonly ErAttributeElement[],
  out: ErAttributeElement[],
  added: Set<string>,
  look: ErAttributeLook,
): void {
  const current = existingOwnerId
    ? existing.filter((a) => a.ownerId === existingOwnerId).sort((a, b) => a.order - b.order)
    : [];
  const pairs = pairByName(parsed, current);
  parsed.forEach((item, order) => {
    const match = pairs.get(order);
    const size = attributeSize(item.name, look);
    const shape: ErAttributeElement = {
      id: match?.id ?? createId(),
      type: "er-attribute",
      ...NO_ER_DIAGRAM,
      index: match?.index ?? "",
      ...keepCenter(match, size),
      ...size,
      ownerId,
      name: item.name,
      key: item.key,
      multivalued: item.multivalued,
      derived: item.derived,
      optional: item.optional,
      look,
      order,
    };
    if (!match) added.add(shape.id);
    out.push(shape);
    buildAttributes(item.children, shape.id, match?.id, existing, out, added, look);
  });
}
