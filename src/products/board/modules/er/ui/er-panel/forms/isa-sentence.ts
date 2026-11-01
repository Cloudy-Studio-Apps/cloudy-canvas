import { t } from "../../../er.i18n";

/** A hierarchy's two choices as one sentence about its parent and children. */
export function isaSentence(
  parent: string,
  children: readonly string[],
  exclusive: boolean,
  total: boolean,
): string {
  const last = children.at(-1) ?? "";
  const list =
    children.length > 1
      ? t("form.isa.list", { first: children.slice(0, -1).join(", "), last })
      : last;
  const key = exclusive
    ? total
      ? "form.isa.sayExactlyOne"
      : "form.isa.sayAtMostOne"
    : total
      ? "form.isa.sayAtLeastOne"
      : "form.isa.sayAny";
  return t(key, { name: parent, list });
}
