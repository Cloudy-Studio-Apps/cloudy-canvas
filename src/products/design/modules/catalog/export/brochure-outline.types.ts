/** A bookmark while the outline is built, its children still being added. */
export interface OpenOutlineItem {
  title: string;
  page: number;
  children: OpenOutlineItem[];
}
