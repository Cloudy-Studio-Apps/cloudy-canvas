import type { StyleguideCategory } from "../styleguide.types";

/** The first page: the file's title, description and date. */
export const coverCategory: StyleguideCategory = {
  id: "cover",
  label: "Cover",
  order: 10,
  defaultTemplate: "cover.title",
  untitled: true,
  // One group, no tokens: the template reads the file's title and description.
  groups: () => [{ id: "cover", title: "", items: [] }],
};
