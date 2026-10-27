import type { StyleguideCategory } from "../styleguide.types";
import { t } from "../styleguide.i18n";

/** The first page: the file's title, description and date. */
export const coverCategory: StyleguideCategory = {
  id: "cover",
  label: t("categories.cover"),
  order: 10,
  defaultTemplate: "cover.title",
  untitled: true,
  // One group, no tokens: the template reads the file's title and description.
  groups: () => [{ id: "cover", title: "", items: [] }],
};
