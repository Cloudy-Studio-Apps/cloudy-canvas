import type { ErAttributeElement, ErElement, ErJoin } from "@board";
import type { ShapeSelectOption } from "../er-panel/forms/shape-select.types";
import type { ErJoinValue } from "./er-relation-prompt.types";

export const NEW_KEY = "new";
export const NO_JOIN = "none";

/** The entity's own attributes, keys first: what another entity can link to. */
export function joinAttributes(
  entity: ErElement,
  attributes: readonly ErAttributeElement[],
): ErAttributeElement[] {
  const own = attributes.filter((a) => a.ownerId === entity.id);
  return [...own.filter((a) => a.key === "pk"), ...own.filter((a) => a.key !== "pk")];
}

export function joinOptions(
  attributes: readonly ErAttributeElement[],
  newKeyName: string,
): ShapeSelectOption[] {
  return [
    ...attributes.map((a) => ({
      value: `attr:${a.id}`,
      label: a.key === "pk" ? `${a.name} (key)` : a.name,
    })),
    { value: NEW_KEY, label: `New key attribute "${newKeyName}"` },
    { value: NO_JOIN, label: "No join attribute" },
  ];
}

/** Its key if it has one, else a new key. */
export function defaultJoin(attributes: readonly ErAttributeElement[]): ErJoinValue {
  const key = attributes.find((a) => a.key === "pk");
  return key ? `attr:${key.id}` : NEW_KEY;
}

/** `id`, or `id_2`… when the entity already has an attribute of that name. */
export function newKeyName(attributes: readonly ErAttributeElement[]): string {
  const names = new Set(attributes.map((a) => a.name));
  if (!names.has("id")) return "id";
  let n = 2;
  while (names.has(`id_${n}`)) n++;
  return `id_${n}`;
}

export function joinOf(value: ErJoinValue | undefined, newKey: string): ErJoin {
  if (value?.startsWith("attr:")) return { kind: "attribute", id: value.slice(5) };
  if (value === NEW_KEY) return { kind: "new-key", name: newKey };
  return { kind: "none" };
}
