import type { ElementKinds } from "@canvas";

import { DesignNodeKind, type DesignNode } from "../../core";
import type { FieldType } from "../source";
import { t } from "../data.i18n";
import { isImageBinding } from "./binding-values";
import type { DataBindableField } from "./data-bindable.types";

const COLORS: readonly FieldType[] = ["color"];
const NUMBERS: readonly FieldType[] = ["integer", "number", "currency"];
export const IMAGE_TYPES: readonly FieldType[] = ["image-url", "image-base64", "image-file"];

/**
 * The data types that fit a field: a variable type's (`color`, `number`), or a picture's for
 * `fills.<i>.image`; `null` when any fits (a boolean or a text is read from anything).
 */
export function acceptedTypes(type: string, path: string): readonly FieldType[] | null {
  if (isImageBinding(path)) return IMAGE_TYPES;
  if (type === "color") return COLORS;
  if (type === "number") return NUMBERS;
  return null;
}

/**
 * The fields of a layer the Data section offers: its kind's color and number fields (what
 * variables can drive) and a picture for each fill when its kind takes image fills. Booleans and
 * visibility go through the show condition, a text's content through its template.
 */
export function dataBindableFields(el: DesignNode, kinds: ElementKinds): DataBindableField[] {
  const kind = kinds.kindOf(el);
  const out: DataBindableField[] = [];
  for (const field of kind.bindable(el)) {
    if (field.type !== "color" && field.type !== "number") continue;
    const accepts = acceptedTypes(field.type, field.path);
    if (accepts) out.push({ path: field.path, label: field.label, accepts });
  }
  if (kind instanceof DesignNodeKind && kind.fillable && kind.imageFills) {
    for (const i of el.fills.keys()) {
      out.push({
        path: `fills.${i}.image`,
        label: t("section.fields.image", { index: i + 1 }),
        accepts: IMAGE_TYPES,
      });
    }
  }
  return out;
}
