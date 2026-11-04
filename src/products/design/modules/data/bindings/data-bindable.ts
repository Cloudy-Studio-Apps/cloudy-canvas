import type { ElementKinds } from "@canvas";

import { DesignNodeKind, type DesignNode } from "../../core";
import type { FieldType } from "../source";
import { t } from "../data.i18n";
import type { DataBindableField } from "./data-bindable.types";

const COLORS: readonly FieldType[] = ["color"];
const NUMBERS: readonly FieldType[] = ["integer", "number", "currency"];
export const IMAGE_TYPES: readonly FieldType[] = ["image-url", "image-base64", "image-file"];

/**
 * The fields of a layer the Data section offers: its kind's color and number fields (what
 * variables can drive) and a picture for each fill when its kind takes image fills. Booleans and
 * visibility go through the show condition, a text's content through its template.
 */
export function dataBindableFields(el: DesignNode, kinds: ElementKinds): DataBindableField[] {
  const kind = kinds.kindOf(el);
  const out: DataBindableField[] = [];
  for (const field of kind.bindable(el)) {
    if (field.type === "color") out.push({ path: field.path, label: field.label, accepts: COLORS });
    else if (field.type === "number")
      out.push({ path: field.path, label: field.label, accepts: NUMBERS });
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
